import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../src/shared/lib/db';
import { batches, batchEvents } from 'washy-core/src/db/schema';

export default function NewBatchScreen() {
  const router = useRouter();

  useEffect(() => {
    async function initBatch() {
      try {
        // 1. Buscar si ya hay algo en el Backlog (consumir en lugar de duplicar)
        // const existingBacklog = await db.select().from(batches).where(eq(batches.status, 'BACKLOG'));
        // Mock de web no soporta bien eq/where complejo para selects específicos,
        // Haremos un select general y filtraremos en memoria para asegurar compatibilidad web/nativa:
        const allBatches = await db.select().from(batches);
        const existingBacklog = allBatches.filter((b: any) => b.status === 'BACKLOG');

        let targetBatchId;

        if (existingBacklog && existingBacklog.length > 0) {
          // Tomar el más antiguo o de mayor prioridad (Triage simplificado)
          targetBatchId = existingBacklog[0].id;
          console.log('Consumiendo tanda existente del backlog:', targetBatchId);
        } else {
          // 2. Si no hay backlog, creamos una nueva tanda "on the fly"
          targetBatchId = crypto.randomUUID();
          
          await db.insert(batches).values({
            id: targetBatchId,
            status: 'BACKLOG', 
            priorityScore: 0,
            createdAt: new Date(),
          });
          
          await db.insert(batchEvents).values({
            id: crypto.randomUUID(),
            batchId: targetBatchId,
            eventType: 'STATE_CHANGE',
            toStatus: 'BACKLOG',
            createdAt: new Date(),
          });
          console.log('Creada nueva tanda:', targetBatchId);
        }

        // Saltamos a la máquina de estados con el Batch ID (nuevo o existente)
        router.replace(`/batch/${targetBatchId}`);
      } catch (e) {
        console.error('Error inicializando tanda:', e);
        router.replace('/');
      }
    }
    initBatch();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
