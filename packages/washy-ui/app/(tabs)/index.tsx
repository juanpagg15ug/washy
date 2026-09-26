import React, { useState, useEffect, createElement } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Platform } from 'react-native';
import { Sun, Moon, AlertTriangle, Plus, Calendar as CalendarIcon, X, Search, BookOpen, Settings } from 'lucide-react';
import { db } from '../../src/shared/lib/db';
import { batches, batchEvents } from 'washy-core/src/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { PhysicalButton } from '../../src/shared/ui/PhysicalButton';

import { fetchDryingEstimate } from '../../src/shared/lib/weather';

function checkSemaphore(sunsetHour: number = 18, dryingHours: number = 4) {
  const currentHour = new Date().getHours();
  const remaining = sunsetHour - currentHour;

  if (remaining >= dryingHours) {
    return { color: 'GREEN', message: `Óptimo. Secado toma ~${dryingHours}h y el sol se oculta a las ${sunsetHour}:00.` };
  }
  if (remaining >= (dryingHours / 2) && remaining > 0) {
    return { color: 'YELLOW', message: `Precaución. Secado toma ~${dryingHours}h. Queda poco sol (Atardecer ~${sunsetHour}:00).` };
  }
  return { color: 'RED', message: `Muy tarde. Necesitas ~${dryingHours}h para secar. Solo remojo nocturno.` };
}

export default function DashboardScreen() {
  const router = useRouter();
  const [sunsetHour, setSunsetHour] = useState(18);
  const [dryingHours, setDryingHours] = useState(4);
  const [semaphore, setSemaphore] = useState(checkSemaphore(18, 4));
  const [backlogCount, setBacklogCount] = useState(0);
  const [wipCount, setWipCount] = useState(0);
  const [activeBatches, setActiveBatches] = useState<any[]>([]);
  const [machineInUse, setMachineInUse] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal de Agenda
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  // Funciones de conveniencia para la Agenda TDAH
  const addDays = (days: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const getNextSaturday = () => {
    const d = new Date();
    const daysUntilSaturday = (6 - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSaturday);
    d.setHours(10, 0, 0, 0);
    return d;
  };

  // Obtener hora del atardecer real y tiempo de secado
  useEffect(() => {
    async function loadWeather() {
      const { dryingHours: dh, sunsetHour: sh } = await fetchDryingEstimate();
      setSunsetHour(sh);
      setDryingHours(dh);
      setSemaphore(checkSemaphore(sh, dh));
    }
    loadWeather();
  }, []);

  // Poll semaphore every minute (usando el sunset actual)
  useEffect(() => {
    const timer = setInterval(() => setSemaphore(checkSemaphore(sunsetHour, dryingHours)), 60000);
    return () => clearInterval(timer);
  }, [sunsetHour, dryingHours]);

  // Fetch DB State
  const fetchState = async () => {
    try {
      // 1. Backlog
      const backlogQuery = await db.select().from(batches).where(eq(batches.status, 'BACKLOG'));
      const backlogFiltered = backlogQuery.filter((b: any) => b.status === 'BACKLOG');
      setBacklogCount(backlogFiltered.length);

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

  const handleBlindCapture = async (scheduledDate?: Date) => {
    try {
      const newBatchId = crypto.randomUUID();
      // Insertar en la BD local
      await db.insert(batches).values({
        id: newBatchId,
        status: 'BACKLOG',
        priorityScore: 0,
        createdAt: new Date(),
        metadata: { 
          intentionType: 'DEFERRED',
          calendarScheduledAt: scheduledDate ? scheduledDate.toISOString() : null
        }
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={styles.title}>Washy</Text>
          <TouchableOpacity onPress={() => router.push('/dictionary')} style={{ padding: 6, backgroundColor: '#262626', borderRadius: 8 }}>
            <BookOpen size={18} color="#a3a3a3" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} style={{ padding: 6, backgroundColor: '#262626', borderRadius: 8 }}>
            <Settings size={18} color="#a3a3a3" />
          </TouchableOpacity>
        </View>
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

          {/* Botón para abrir el selector de agenda */}
          <PhysicalButton 
            label="Anotar intención (Agendar lavado)"
            onPress={() => setScheduleModalVisible(true)}
            variant="secondary"
            icon={<CalendarIcon size={24} color="#ffffff" />}
          />

          <PhysicalButton 
            label="Consultar Inventario de Telas"
            onPress={() => router.push('/dictionary')}
            variant="secondary"
            icon={<Search size={24} color="#ffffff" />}
          />
        </View>
      </View>

      {/* MODAL DE AGENDA TDAH (Quick Slots + Custom) */}
      <Modal visible={scheduleModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>¿Cuándo planeas lavar?</Text>
              <TouchableOpacity onPress={() => setScheduleModalVisible(false)}>
                <X size={24} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Agendarlo reduce la carga mental. Te recordaremos cuando llegue el momento.</Text>
            
            <View style={{ gap: 12, marginTop: 16 }}>
              <PhysicalButton 
                label="Mañana temprano (7:00 AM)" 
                variant="primary" 
                onPress={() => {
                  handleBlindCapture(addDays(1, 7));
                  setScheduleModalVisible(false);
                }} 
              />
              <PhysicalButton 
                label="Mañana por la noche (8:00 PM)" 
                variant="secondary" 
                onPress={() => {
                  handleBlindCapture(addDays(1, 20));
                  setScheduleModalVisible(false);
                }} 
              />
              <PhysicalButton 
                label="Solo déjalo en mi Backlog (Sin fecha)" 
                variant="secondary" 
                onPress={() => {
                  handleBlindCapture(undefined);
                  setScheduleModalVisible(false);
                }} 
              />

              {/* DATE PICKER NATIVO HTML5 PARA WEB */}
              {Platform.OS === 'web' && (
                <View style={{ marginTop: 16, backgroundColor: '#171717', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#3f3f46' }}>
                  <Text style={{ color: '#e5e5e5', marginBottom: 12, fontSize: 14, fontWeight: 'bold' }}>🕒 O elige fecha y hora exacta:</Text>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      {createElement('input', {
                        type: 'datetime-local',
                        style: { padding: '12px', borderRadius: '12px', background: '#262626', color: '#ffffff', border: '1px solid #52525b', fontSize: '16px', width: '100%', colorScheme: 'dark' },
                        onChange: (e: any) => setCustomDate(new Date(e.target.value))
                      })}
                    </View>
                    <PhysicalButton 
                      label="Guardar" 
                      variant="primary" 
                      onPress={() => {
                        if (customDate && !isNaN(customDate.getTime())) {
                          handleBlindCapture(customDate);
                          setScheduleModalVisible(false);
                          alert(`¡Agendado para: ${customDate.toLocaleString()}!`);
                        } else {
                          alert('Por favor selecciona una fecha y hora válida.');
                        }
                      }} 
                    />
                  </View>
                </View>
              )}

            </View>
          </View>
        </View>
      </Modal>

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

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#262626', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  modalSubtitle: { fontSize: 14, color: '#a3a3a3', marginBottom: 16 },
});
