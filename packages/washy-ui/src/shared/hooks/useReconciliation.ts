import { useEffect } from 'react';
import { db } from '../lib/db';
import { batches, batchEvents } from 'washy-core/src/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export function useReconciliation() {
  useEffect(() => {
    async function reconcileTimers() {
      try {
        console.log('Ejecutando motor de reconciliación...');
        
        // 1. Buscar tandas en WASHING o SOAKING
        const activeBatches = await db.select().from(batches).where(
          inArray(batches.status, ['WASHING', 'SOAKING'])
        );
        
        if (!activeBatches || activeBatches.length === 0) {
          console.log('No hay tandas en la zona ciega.');
          return;
        }

        const now = Date.now();

        for (const batch of activeBatches) {
          if (!batch || !batch.createdAt) continue;
          if (batch.status !== 'WASHING' && batch.status !== 'SOAKING') continue;
          
          const batchTime = new Date(batch.createdAt).getTime();

          // 2. Obtener el tiempo dinámico desde la BD (washRules)
          let cycleMs = 30 * 60 * 1000; // 30 mins fallback
          try {
            const { batchCategories, categories, washRules } = require('washy-core/src/db/schema');
            const ruleResult = await db.select({ duration: washRules.baseDurationMins })
              .from(batchCategories)
              .innerJoin(categories, eq(batchCategories.categoryId, categories.id))
              .innerJoin(washRules, eq(categories.defaultWashRuleId, washRules.id))
              .where(eq(batchCategories.batchId, batch.id))
              .limit(1);
            
            if (ruleResult.length > 0 && ruleResult[0].duration) {
              cycleMs = ruleResult[0].duration * 60 * 1000;
              console.log(`Regla dinámica aplicada para tanda ${batch.id}: ${ruleResult[0].duration} mins`);
            }
          } catch (e) {
            console.warn('Usando fallback. No se pudo obtener la regla dinámica:', e);
          }

          // 3. Comprobar si el tiempo estimado ya expiró
          if (now - batchTime > cycleMs) {
            console.log(`Rescatando tanda ${batch.id} de la zona ciega (tiempo expirado)...`);
            
            // 3. Rescatarlas pasando a READY_TO_FOLD
            await db.update(batches)
              .set({ status: 'READY_TO_FOLD' })
              .where(eq(batches.id, batch.id));
              
            // 4. Loggear el evento para trazabilidad inmutable
            await db.insert(batchEvents).values({
              id: uuidv4(),
              batchId: batch.id,
              eventType: 'SYSTEM_AUTO_DONE',
              fromStatus: batch.status,
              toStatus: 'READY_TO_FOLD',
              actorId: null, // Evento del sistema
              createdAt: new Date(),
              metadata: { note: 'Recuperado por el Reconciliation Engine' }
            });
            
            // TODO: Integrar expo-notifications para alertar visualmente al usuario
            console.log(`🔔 Tanda lista: ¡Tu ropa está lista para tender! (${batch.id})`);
          }
        }
      } catch (error) {
        console.error('Error en reconciliación:', error);
      }
    }
    
    reconcileTimers();
  }, []);
}
