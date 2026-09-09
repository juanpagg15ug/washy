import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../src/shared/lib/db';
import { batches, batchEvents } from 'washy-core/src/db/schema';
import { eq } from 'drizzle-orm';
import { PhysicalButton } from '../../src/shared/ui/PhysicalButton';

export default function BatchFlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);

  // Sub-estados efímeros de la UI (separando la acción física de colgar del secado pasivo)
  const [flowStep, setFlowStep] = useState<'TIME_CHECK' | 'ANCHOR' | 'CLASSIFICATION' | 'WASHING' | 'HANGING' | 'DRYING' | 'CLOSURE' | 'DONE'>('TIME_CHECK');
  const [closureGoal, setClosureGoal] = useState<'MINI' | 'PLUS' | 'ELITE' | null>(null);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { categories } = require('washy-core/src/db/schema');
        const cats = await db.select().from(categories);
        setCategoriesList(cats);
      } catch (e) {
        console.error("Error loading categories", e);
      }
    }
    loadCategories();
  }, []);
  useEffect(() => {
    async function loadBatch() {
      if (!id) return;
      const result = await db.select().from(batches).where(eq(batches.id, id));
      if (result.length > 0) {
        const b = result[0];
        setBatch(b);
        // Si la tanda ya estaba en curso, retomamos el paso correspondiente
        if (b.status === 'WASHING') setFlowStep('WASHING');
        else if (b.status === 'DRYING') setFlowStep('DRYING');
        else if (b.status === 'READY_TO_FOLD') setFlowStep('CLOSURE');
      }
      setLoading(false);
    }
    loadBatch();
  }, [id]);

  const updateBatchStatus = async (newStatus: string) => {
    try {
      await db.update(batches).set({ status: newStatus as any }).where(eq(batches.id, id));
      await db.insert(batchEvents).values({
        id: crypto.randomUUID(),
        batchId: id,
        eventType: 'STATE_CHANGE',
        fromStatus: batch.status,
        toStatus: newStatus as any,
        createdAt: new Date(),
      });
      setBatch({ ...batch, status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAbort = async () => {
    // Honestidad clínica: no se completó, regresa al Backlog sin culpa
    await updateBatchStatus('BACKLOG');
    router.replace('/');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>;
  if (!batch) return <View style={styles.center}><Text style={styles.title}>Error: Tanda no encontrada</Text></View>;

  const shortId = id.split('-')[0].toUpperCase();

  // Header compartido para los pasos
  const StepHeader = () => (
    <View style={styles.stepHeader}>
      <Text style={styles.stepHeaderText}>TANDA #{shortId}</Text>
      <Text style={styles.stepHeaderSub}>Progreso Físico</Text>
    </View>
  );

  // ==========================================
  // PANTALLAS DE LA MÁQUINA DE ESTADOS (FSM)
  // ==========================================

  if (flowStep === 'TIME_CHECK') {
    return (
      <View style={styles.container}>
        <StepHeader />
        <Text style={styles.title}>¿Cuánta energía tienes hoy?</Text>
        <Text style={styles.subtitle}>Sé honesto, no hay respuestas incorrectas.</Text>
        <View style={styles.buttonGroup}>
          <PhysicalButton label="Baja (Solo lo urgente)" variant="secondary" onPress={() => setFlowStep('ANCHOR')} />
          <PhysicalButton label="Media (Ritmo normal)" variant="primary" onPress={() => setFlowStep('ANCHOR')} />
          <PhysicalButton label="Alta (A limpiar todo)" variant="secondary" onPress={() => setFlowStep('ANCHOR')} />
        </View>
        <PhysicalButton label="Mejor en otro momento" variant="danger" onPress={handleAbort} style={styles.abortBtn} />
      </View>
    );
  }

  if (flowStep === 'ANCHOR') {
    return (
      <View style={styles.container}>
        <StepHeader />
        <Text style={styles.title}>Ponte tus audífonos</Text>
        <Text style={styles.subtitle}>Pon música o un podcast. Avísame cuando estés listo.</Text>
        <View style={styles.buttonGroup}>
          <PhysicalButton label="Listo, ya estoy en la zona" variant="primary" onPress={() => setFlowStep('CLASSIFICATION')} />
          <PhysicalButton label="Atrás" variant="secondary" onPress={() => setFlowStep('TIME_CHECK')} />
        </View>
      </View>
    );
  }


  if (flowStep === 'CLASSIFICATION') {
    return (
      <View style={styles.container}>
        <StepHeader />
        <Text style={styles.title}>Clasificación</Text>
        <Text style={styles.subtitle}>¿Qué vas a meter a la lavadora?</Text>
        <View style={styles.buttonGroup}>
          {categoriesList.length > 0 ? categoriesList.map(cat => (
            <PhysicalButton 
              key={cat.id} 
              label={cat.name} 
              variant="secondary" 
              onPress={async () => {
                const { batchCategories } = require('washy-core/src/db/schema');
                // Guardamos qué categoría eligió para esta tanda
                await db.insert(batchCategories).values({
                  batchId: id,
                  categoryId: cat.id
                }).onConflictDoNothing();
                
                updateBatchStatus('WASHING');
                setFlowStep('WASHING');
              }} 
            />
          )) : <ActivityIndicator size="large" color="#10b981" />}
        </View>
        <PhysicalButton label="Atrás" variant="secondary" onPress={() => setFlowStep('ANCHOR')} style={styles.abortBtn} />
      </View>
    );
  }

  if (flowStep === 'WASHING') {
    return (
      <View style={styles.container}>
        <StepHeader />
        <Text style={styles.title}>Lavadora en marcha 🌀</Text>
        <Text style={styles.subtitle}>Zona Ciega: el motor está trabajando. Te avisaré cuando termine.</Text>
        <View style={styles.buttonGroup}>
          <PhysicalButton label="Simular fin de lavado" variant="primary" onPress={() => {
            // El ciclo de lavado terminó, pero la ropa sigue adentro!
            setFlowStep('HANGING');
          }} />
          <PhysicalButton label="Volver al Dashboard (Sigue lavando)" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      </View>
    );
  }

  // PASO CRÍTICO ANTI-AVOIDANCE: Transición física activa
  if (flowStep === 'HANGING') {
    return (
      <View style={styles.container}>
        <StepHeader />
        <Text style={styles.title}>¡Lavado finalizado! 🧺</Text>
        <Text style={styles.subtitle}>La ropa está húmeda dentro del tambor. Sacudida técnica y a colgar para evitar olor a humedad.</Text>
        <View style={styles.buttonGroup}>
          <PhysicalButton 
            label="Ya colgué toda la tanda" 
            variant="primary" 
            onPress={() => {
              // Ahora sí: físicamente la ropa está en la cuerda y la lavadora queda libre
              updateBatchStatus('DRYING');
              setFlowStep('DRYING');
            }} 
          />
          <PhysicalButton 
            label="Dejar en lavadora (Aviso: Se queda mojada)" 
            variant="secondary" 
            onPress={() => router.replace('/')} 
          />
        </View>
      </View>
    );
  }

  // PASO PASIVO: Secado real en tendedero
  if (flowStep === 'DRYING') {
    return (
      <View style={styles.container}>
        <StepHeader />
        <Text style={styles.title}>Secándose al Sol ☀️</Text>
        <Text style={styles.subtitle}>La ropa ya está colgada. El tendedero está ocupado, pero la lavadora está libre.</Text>
        <View style={styles.buttonGroup}>
          <PhysicalButton 
            label="Ya descolgué y subí al cuarto 🧺" 
            variant="primary" 
            onPress={() => {
              // Físicamente: libera el tendedero y la ropa entra al cuarto
              updateBatchStatus('READY_TO_FOLD');
              setFlowStep('CLOSURE');
            }} 
          />
          <PhysicalButton label="Volver al Dashboard (Dejar secar)" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      </View>
    );
  }

  // FASE ACTIVA 2B: Doblar y Guardar (Primero se elige la Meta, luego se ejecuta la Acción y se Registra)
  if (flowStep === 'CLOSURE') {
    // PASO 1: Elegir la Meta de Cierre (Intención)
    if (!closureGoal) {
      return (
        <View style={styles.container}>
        <StepHeader />
          <Text style={styles.title}>Ropa en el cuarto ✨</Text>
          <Text style={styles.subtitle}>El tendedero ya está libre. Elige tu meta honesta para doblar hoy:</Text>

          <View style={styles.buttonGroup}>
            <PhysicalButton 
              label="🔹 Mini: Doblado express (1 pliegue a la silla)" 
              variant="secondary" 
              onPress={() => setClosureGoal('MINI')} 
            />
            <PhysicalButton 
              label="🔸 Plus: Doblar solo lo urgente / visible" 
              variant="secondary" 
              onPress={() => setClosureGoal('PLUS')} 
            />
            <PhysicalButton 
              label="⭐ Elite: Todo doblado y al clóset" 
              variant="primary" 
              onPress={() => setClosureGoal('ELITE')} 
            />
            <PhysicalButton 
              label="Doblar más tarde (Volver al Dashboard)" 
              variant="secondary" 
              onPress={() => router.replace('/')} 
            />
          </View>
        </View>
      );
    }

    // PASO 2: Ejecución de la Acción (Ponte audífonos, dobla y registra solo cuando tus manos terminen)
    const goalTitle = 
      closureGoal === 'MINI' ? '🔹 Meta Mini: Doblado Express' :
      closureGoal === 'PLUS' ? '🔸 Meta Plus: Lo Urgente' :
      '⭐ Meta Elite: Clóset Completo';

    const goalDesc = 
      closureGoal === 'MINI' ? 'Dobla cada prenda a la mitad (un pliegue rápido) y apílala en la silla limpia o cama. ¡Toma 2 minutos!' :
      closureGoal === 'PLUS' ? 'Dobla solo las 3-5 prendas que vas a usar esta semana. El resto déjalo apilado prolijo.' :
      'Dobla cada prenda y colócala en sus 4 estanterías correspondientes en el clóset.';

    return (
      <View style={styles.container}>
        <StepHeader />
        <Text style={styles.title}>{goalTitle}</Text>
        <Text style={styles.subtitle}>🎧 Ponte audífonos con música o un podcast para vencer el tedio del movimiento repetitivo.</Text>
        
        <View style={{ backgroundColor: '#262626', padding: 20, borderRadius: 16, marginBottom: 32 }}>
          <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Definición de Hecho (DoD):</Text>
          <Text style={{ color: '#e5e5e5', fontSize: 16, lineHeight: 22 }}>{goalDesc}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <PhysicalButton 
            label="¡Listo, ya terminé de doblar! 🎉" 
            variant="primary" 
            onPress={() => {
              // Ahora sí: la acción física fue completada en el mundo real. Registramos en la BD.
              updateBatchStatus('DONE');
              setFlowStep('DONE' as any);
            }} 
          />
          <PhysicalButton 
            label="Cambiar meta de cierre" 
            variant="secondary" 
            onPress={() => setClosureGoal(null)} 
          />
        </View>
      </View>
    );
  }

  if (flowStep === ('DONE' as any)) {
    return (
      <View style={styles.container}>
        <StepHeader />
        <Text style={styles.title}>¡Ritual Completado! 🎉</Text>
        <Text style={styles.subtitle}>Un paso más hacia el orden sin culpa. Disfruta tu ropa limpia.</Text>
        <View style={styles.buttonGroup}>
          <PhysicalButton label="Volver al Dashboard" variant="primary" onPress={() => router.replace('/')} />
          <PhysicalButton label="Iniciar Nueva Tanda" variant="secondary" onPress={() => router.replace('/batch/new')} />
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171717', padding: 24, justifyContent: 'center' },
  center: { flex: 1, backgroundColor: '#171717', justifyContent: 'center', alignItems: 'center' },
  
  stepHeader: {
    position: 'absolute',
    top: 40,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingBottom: 16,
  },
  stepHeaderText: { color: '#737373', fontSize: 14, fontWeight: 'bold' },
  stepHeaderSub: { color: '#10b981', fontSize: 14, fontWeight: 'bold' },

  title: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', marginTop: 40 },
  subtitle: { color: '#a3a3a3', fontSize: 18, marginBottom: 48, textAlign: 'center' },
  buttonGroup: { gap: 16 },
  abortBtn: { marginTop: 32 }
});
