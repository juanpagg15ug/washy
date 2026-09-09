import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Sun, Moon, AlertTriangle, Plus } from 'lucide-react';
import { db } from '../../src/shared/lib/db';
import { batches, batchEvents } from 'washy-core/src/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { PhysicalButton } from '../../src/shared/ui/PhysicalButton';

function checkSemaphore() {
  const currentHour = new Date().getHours();
  const remaining = 18 - currentHour;
  if (remaining >= 4) return { color: 'GREEN', message: 'Óptimo. Tienes sol suficiente para secar la ropa.' };
  if (remaining >= 2) return { color: 'YELLOW', message: 'Precaución. Queda poco sol.' };
  return { color: 'RED', message: 'Muy tarde. Solo remojo nocturno.' };
}

export default function DashboardScreen() {
  const router = useRouter();
  const [semaphore, setSemaphore] = useState(checkSemaphore());
  const [backlogCount, setBacklogCount] = useState(0);
  const [wipCount, setWipCount] = useState(0);
  const [activeBatches, setActiveBatches] = useState<any[]>([]);
  const [machineInUse, setMachineInUse] = useState(false);
  const [loading, setLoading] = useState(true);

  // Poll semaphore every minute
  useEffect(() => {
    const timer = setInterval(() => setSemaphore(checkSemaphore()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch DB State
  const fetchState = async () => {
    try {
      // 1. Backlog
      const backlogQuery = await db.select().from(batches).where(eq(batches.status, 'BACKLOG'));
      setBacklogCount(backlogQuery.length);

      // 2. Extraemos todos los activos (Drizzle real filtra bien, el Mock web trae todo)
      const wipQuery = await db.select().from(batches).where(inArray(batches.status, ['SOAKING', 'WASHING', 'DRYING', 'READY_TO_FOLD']));
      
      // Filtro defensivo (Esencial para que el Mock de Web funcione idéntico a SQLite nativo)
      const active = wipQuery.filter((b: any) => ['SOAKING', 'WASHING', 'DRYING', 'READY_TO_FOLD'].includes(b.status));
      setWipCount(active.length);
      setActiveBatches(active);

      // 3. Recursos Físicos (Lavadora Ocupada)
      const machineActive = wipQuery.filter((b: any) => ['SOAKING', 'WASHING'].includes(b.status));
      setMachineInUse(machineActive.length > 0);

    } catch (e) {
      console.error("DB Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleBlindCapture = async () => {
    try {
      const newBatchId = crypto.randomUUID();
      // Insertar en la BD local
      await db.insert(batches).values({
        id: newBatchId,
        status: 'BACKLOG',
        priorityScore: 0,
        createdAt: new Date(),
      });
      
      await db.insert(batchEvents).values({
        id: crypto.randomUUID(),
        batchId: newBatchId,
        eventType: 'STATE_CHANGE',
        toStatus: 'BACKLOG',
        createdAt: new Date(),
      });
      
      // Actualizar UI
      fetchState();
    } catch (e) {
      console.error("Error capturando impulso:", e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // Regla de bloqueo: Límite cognitivo (WIP) o Físico (Lavadora)
  const isStartBlocked = wipCount >= 2 || machineInUse;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Washy</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>Backlog: <Text style={styles.statValue}>{backlogCount}</Text></Text>
          <Text style={styles.statText}>WIP: <Text style={styles.statValue}>{wipCount}/2</Text></Text>
        </View>
      </View>

      {/* SEMAPHORE */}
      <View style={styles.content}>
        <View style={styles.semaphoreContainer}>
          <View style={[
            styles.iconCircle, 
            semaphore.color === 'GREEN' ? styles.bgGreen : 
            semaphore.color === 'YELLOW' ? styles.bgYellow : styles.bgRed
          ]}>
            {semaphore.color === 'GREEN' && <Sun size={56} color="#171717" />}
            {semaphore.color === 'YELLOW' && <AlertTriangle size={56} color="#171717" />}
            {semaphore.color === 'RED' && <Moon size={56} color="#171717" />}
          </View>
          
          <Text style={styles.semaphoreTitle}>
            {semaphore.color === 'GREEN' ? 'Luz Verde' : 
             semaphore.color === 'YELLOW' ? 'Precaución' : 'Luz Roja'}
          </Text>
          <Text style={styles.semaphoreMessage}>{semaphore.message}</Text>
        </View>

        {/* BUTTONS */}
        <View style={styles.actions}>
          
          {/* Active WIP Resumers con microcopy honesto y claro */}
          {activeBatches.map(batch => {
            let label = `⏳ Retomar Tanda (${batch.status})`;
            if (batch.status === 'WASHING') label = '🌀 Lavadora en marcha / Por tender';
            else if (batch.status === 'DRYING') label = '☀️ Ropa secándose en tendedero';
            else if (batch.status === 'READY_TO_FOLD') label = '🧺 Ropa lista para recoger y doblar';

            return (
              <PhysicalButton 
                key={batch.id}
                label={label}
                onPress={() => router.push(`/batch/${batch.id}`)}
                variant="primary"
              />
            );
          })}

          {/* Bloqueador de Lavadora (solo visible si está bloqueado por uso o límite WIP) */}
          {isStartBlocked && (
            <PhysicalButton 
              label={machineInUse ? 'Lavadora en Uso' : 'Límite de Tareas (WIP) Alcanzado'}
              onPress={() => {}}
              variant="primary"
              disabled={true}
            />
          )}

          {/* Nueva Tanda (solo visible si hay capacidad) */}
          {!isStartBlocked && (
            <PhysicalButton 
              label={semaphore.color === 'RED' ? 'Iniciar Remojo Nocturno' : (backlogCount > 0 ? `Iniciar Ritual (de ${backlogCount} pendientes)` : 'Iniciar Nuevo Ritual')}
              onPress={() => router.push('/batch/new')}
              variant="primary"
            />
          )}

          <PhysicalButton 
            label="Anotar intención (Lavar después)"
            onPress={() => {
              handleBlindCapture();
              if (typeof window !== 'undefined') {
                alert('¡Intención guardada! Quedó anotada en el Backlog sin culpa.');
              }
            }}
            variant="secondary"
            icon={<Plus size={24} color="#ffffff" />}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171717' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#e5e5e5' },
  stats: { flexDirection: 'row', gap: 16 },
  statText: { fontSize: 12, color: '#737373', fontWeight: '500' },
  statValue: { color: '#ffffff' },
  
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 32 },
  
  semaphoreContainer: { alignItems: 'center', marginBottom: 48 },
  iconCircle: { padding: 24, borderRadius: 100, marginBottom: 24 },
  bgGreen: { backgroundColor: '#10b981' },
  bgYellow: { backgroundColor: '#fbbf24' },
  bgRed: { backgroundColor: '#f43f5e' },
  
  semaphoreTitle: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
  semaphoreMessage: { fontSize: 16, color: '#a3a3a3', textAlign: 'center', maxWidth: 280 },
  
  actions: { gap: 16 },
});
