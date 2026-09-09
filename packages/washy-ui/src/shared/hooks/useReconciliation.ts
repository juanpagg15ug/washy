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
        // TODO: En el futuro, leer la duración de washRules vinculada a la tanda
        const DEFAULT_CYCLE_MS = 30 * 60 * 1000; // 30 minutos por defecto (Express)

        for (const batch of activeBatches) {
          // Si estamos usando el Mock de web, evitamos crash por fechas inválidas
          if (!batch || !batch.createdAt) continue;
          
          // FILTRO DEFENSIVO para el Mock Web (ya que el mock devuelve TODAS las tandas)
          if (batch.status !== 'WASHING' && batch.status !== 'SOAKING') continue;
          
          const batchTime = new Date(batch.createdAt).getTime();

          // 2. Comprobar si el tiempo estimado ya expiró
          if (now - batchTime > DEFAULT_CYCLE_MS) {
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
