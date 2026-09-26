import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
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
  const [backlogCount, setBacklogCount] = useState(0);
  const [wipCount, setWipCount] = useState(0);

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

  useEffect(() => {
    async function fetchStats() {
      try {
        const all = await db.select().from(batches);
        setBacklogCount(all.filter((b: any) => b.status === 'BACKLOG').length);
        setWipCount(all.filter((b: any) => ['SOAKING', 'WASHING', 'DRYING', 'READY_TO_FOLD'].includes(b.status)).length);
      } catch (e) {}
    }
    fetchStats();
  }, [flowStep]); // Se recalcula si avanzamos de paso

  const updateBatchStatus = async (newStatus: string, metadataUpdates?: any) => {
    try {
      // 1. Cancelación Inteligente: Si hay una notificación pendiente para este paso, la cancelamos
      if (batch?.metadata?.pendingNotificationId) {
        try {
          const Notifications = require('expo-notifications');
          await Notifications.cancelScheduledNotificationAsync(batch.metadata.pendingNotificationId);
          console.log("Cancelada notificación huérfana inteligente:", batch.metadata.pendingNotificationId);
        } catch (e) { console.warn("Error cancelando notificación", e); }
      }

      // 2. Mezclamos la nueva metadata y limpiamos el ID anterior a menos que el update traiga uno nuevo
      const newMetadata = {
        ...(batch?.metadata || {}),
        ...(metadataUpdates || {}),
      };
      if (!metadataUpdates?.pendingNotificationId) {
        delete newMetadata.pendingNotificationId;
      }

      await db.update(batches).set({ status: newStatus as any, metadata: newMetadata }).where(eq(batches.id, id));
      await db.insert(batchEvents).values({
        id: crypto.randomUUID(),
        batchId: id,
        eventType: 'STATE_CHANGE',
        fromStatus: batch.status,
        toStatus: newStatus as any,
        createdAt: new Date(),
      });
      setBatch({ ...batch, status: newStatus, metadata: newMetadata });
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
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Text style={styles.stepHeaderStat}>Backlog: <Text style={{ color: '#ffffff' }}>{backlogCount}</Text></Text>
        <Text style={styles.stepHeaderStat}>WIP: <Text style={{ color: '#ffffff' }}>{wipCount}/2</Text></Text>
      </View>
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
                const { batchCategories, washRules } = require('washy-core/src/db/schema');
                // Guardamos qué categoría eligió para esta tanda
                await db.insert(batchCategories).values({
                  batchId: id,
                  categoryId: cat.id
                }).onConflictDoNothing();
                
                // 1. Obtener la duración de la regla para el Timer "Live"
                let durationMins = 30; // fallback
                try {
                  const ruleQuery = await db.select({ duration: washRules.baseDurationMins })
                    .from(washRules).where(eq(washRules.id, cat.defaultWashRuleId)).limit(1);
                  if (ruleQuery.length > 0 && ruleQuery[0].duration) {
                    durationMins = ruleQuery[0].duration;
                  }
                } catch (e) {
                  console.warn("No se pudo obtener la duración de la regla", e);
                }

                // 2. Programar Notificación Push a nivel OS (Temporizador Live)
                const Notifications = require('expo-notifications');
                const { status } = await Notifications.getPermissionsAsync();
                let pushId = null;
                
                // Fallback para Web Local (Si el navegador bloquea las notificaciones push)
                if (Platform.OS === 'web') {
                  console.log(`[Web Mock] Simulando Push local en 5 segundos (Modo Prueba)...`);
                  setTimeout(() => {
                    if (typeof window !== 'undefined') {
                      document.title = "🔴 ¡LAVADORA LISTA!";
                      alert("¡Lavadora Terminada! 🌀\nTu ropa está lista para tender. ¡Rescátala del tambor!");
                    }
                  }, 5000); // 5 SEGUNDOS PARA PODER PROBARLO RÁPIDO
                } else if (status === 'granted') {
                  pushId = await Notifications.scheduleNotificationAsync({
                    content: {
                      title: "¡Lavadora Terminada! 🌀",
                      body: "Tu ropa está lista para tender. ¡Rescátala del tambor!",
                      sound: true,
                      data: { batchId: id },
                    },
                    trigger: { seconds: durationMins * 60 },
                  });
                }

                // 3. Calcular Initiation Delay (Procrastinación vs Intención)
                let initiationDelayMins: number | null = null;
                const intentionType = batch?.metadata?.intentionType || 'DEFERRED'; // Fallback
                
                if (intentionType === 'IMMEDIATE') {
                  // Si fue un impulso espontáneo, no hubo procrastinación real aplicable.
                  console.log(`[ML Log] Intención INMEDIATA. Ignorando métrica de Initiation Delay para no ensuciar el promedio.`);
                } else if (batch?.createdAt) {
                  // Si viene de Google Calendar, respetamos la hora bloqueada en la agenda. 
                  // Si es manual (Anotar Intención), usamos la hora en la que se creó el ticket en Backlog.
                  const intentionTimeStr = batch?.metadata?.calendarScheduledAt || batch.createdAt;
                  const intentionTime = new Date(intentionTimeStr).getTime();
                  
                  // Si se adelantó al evento del calendario, el delay es 0
                  initiationDelayMins = Math.max(0, Math.round((Date.now() - intentionTime) / 60000));
                  console.log(`[ML Log] Initiation Delay (Agenda vs Arranque real): ${initiationDelayMins} minutos.`);
                }

                // 4. Físicamente arranca la lavadora
                updateBatchStatus('WASHING', { 
                  pendingNotificationId: pushId,
                  expectedMachineFinishAt: Date.now() + (durationMins * 60000),
                  ...(initiationDelayMins !== null && { initiationDelayMins }) // Solo se guarda si aplica
                });
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
            onPress={async () => {
              // 1. Calcular tiempo de secado estimado según el clima actual
              const { fetchDryingEstimate } = require('../../src/shared/lib/weather');
              const { dryingHours } = await fetchDryingEstimate();

              // 2. Calcular Fricción Humana (ADHD Tax): ¿Cuánto tardó en pararse a sacar la ropa?
              const expectedFinish = batch?.metadata?.expectedMachineFinishAt;
              let hangingReactionMins = 0;
              if (expectedFinish) {
                // Si lo saca antes o exacto, es 0. Si se tarda, guardamos los minutos de inercia.
                hangingReactionMins = Math.max(0, Math.round((Date.now() - expectedFinish) / 60000));
                console.log(`[ML Log] Inercia Humana (Lavadora a Tendedero): ${hangingReactionMins} minutos de retraso.`);
              }

              // 3. Programar Alerta de Secado Dinámica
              const Notifications = require('expo-notifications');
              const { status } = await Notifications.getPermissionsAsync();
              let pushId = null;

              if (Platform.OS === 'web') {
                console.log(`[Web Mock] Simulando Push local de Secado en 5 segundos (Modo Prueba)...`);
                setTimeout(() => {
                  if (typeof window !== 'undefined') {
                    document.title = "🔴 ¡ROPA SECA!";
                    alert("¡Secado Completo! ☀️\nTu ropa ya debe estar seca según el clima de hoy. ¡Métela antes de que caiga el sereno!");
                  }
                }, 5000); // 5 SEGUNDOS PARA PODER PROBARLO RÁPIDO
              } else if (status === 'granted') {
                pushId = await Notifications.scheduleNotificationAsync({
                  content: {
                    title: "¡Secado Completo! ☀️",
                    body: "Tu ropa ya debe estar seca según el clima de hoy. ¡Métela antes de que caiga el sereno!",
                    sound: true,
                    data: { batchId: id },
                  },
                  trigger: { seconds: dryingHours * 60 * 60 },
                });
              }

              // 4. Físicamente la ropa está en la cuerda y la lavadora queda libre
              updateBatchStatus('DRYING', { 
                pendingNotificationId: pushId,
                dryingStartedAt: Date.now(),
                estimatedDryingMins: dryingHours * 60,
                humanFrictionHangingMins: hangingReactionMins
              });
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
              // 1. Calcular tiempo real de secado con filtro de anomalías (Anti-trampas)
              const dryingStartedAt = batch?.metadata?.dryingStartedAt;
              const estimatedDryingMins = batch?.metadata?.estimatedDryingMins || (4 * 60);
              let mlDryingMinutes = estimatedDryingMins; // Default a estandar por si falla
              
              if (dryingStartedAt) {
                const realMinutes = Math.round((Date.now() - dryingStartedAt) / 60000);
                
                // Filtro de Anomalías: 
                // Si tardó menos de 30 mins (dio clics rápidos) o tardó más de 3 veces el tiempo esperado (se le olvidó la app)
                if (realMinutes < 30) {
                  console.log(`[ML Log] ⚠️ Anomalía (Speedrun de ${realMinutes}m). Ignorando tiempo real, guardando estimado: ${estimatedDryingMins}m`);
                  mlDryingMinutes = estimatedDryingMins;
                } else if (realMinutes > estimatedDryingMins * 3) {
                  console.log(`[ML Log] ⚠️ Anomalía (Olvido de ${realMinutes}m). Ignorando tiempo real, guardando estimado: ${estimatedDryingMins}m`);
                  mlDryingMinutes = estimatedDryingMins;
                } else {
                  console.log(`[ML Log] ✅ Tiempo real válido registrado: ${realMinutes} minutos.`);
                  mlDryingMinutes = realMinutes;
                }
              }

              // 2. Físicamente: libera el tendedero y la ropa entra al cuarto
              updateBatchStatus('READY_TO_FOLD', { 
                realDryingMinutes: mlDryingMinutes,
                isAnomalyFiltered: mlDryingMinutes !== (Math.round((Date.now() - dryingStartedAt) / 60000)),
                dryingFinishedAt: Date.now() 
              });
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
    const handleGoalSelect = async (goal: 'MINI' | 'PLUS' | 'ELITE') => {
      setClosureGoal(goal);
      // Silenciosamente guardamos a qué hora empezó a doblar para medir el tiempo de ejecución
      try {
        const newMeta = { ...(batch?.metadata || {}), foldingStartedAt: Date.now(), closureGoal: goal };
        await db.update(batches).set({ metadata: newMeta }).where(eq(batches.id, id));
        setBatch({ ...batch, metadata: newMeta });
      } catch(e) {}
    };

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
              onPress={() => handleGoalSelect('MINI')} 
            />
            <PhysicalButton 
              label="🔸 Plus: Doblar solo lo urgente / visible" 
              variant="secondary" 
              onPress={() => handleGoalSelect('PLUS')} 
            />
            <PhysicalButton 
              label="⭐ Elite: Todo doblado y al clóset" 
              variant="primary" 
              onPress={() => handleGoalSelect('ELITE')} 
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
              // 1. Calcular el tiempo real de ejecución del doblado
              const foldingStartedAt = batch?.metadata?.foldingStartedAt;
              let humanFrictionFoldingMins = 0;
              if (foldingStartedAt) {
                humanFrictionFoldingMins = Math.max(0, Math.round((Date.now() - foldingStartedAt) / 60000));
                console.log(`[ML Log] Velocidad de ejecución (Doblado): ${humanFrictionFoldingMins} minutos.`);
              }

              // 2. Ahora sí: la acción física fue completada en el mundo real. Registramos en la BD.
              updateBatchStatus('DONE', { humanFrictionFoldingMins });
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
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  stepHeaderText: { color: '#737373', fontSize: 14, fontWeight: 'bold' },
  stepHeaderStat: { color: '#737373', fontSize: 14, fontWeight: 'bold' },

  title: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', marginTop: 40 },
  subtitle: { color: '#a3a3a3', fontSize: 18, marginBottom: 48, textAlign: 'center' },
  buttonGroup: { gap: 16 },
  abortBtn: { marginTop: 32 }
});
