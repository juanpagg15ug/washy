import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from 'washy-core/src/db/schema'; // Ensure washy-core exports this correctly, or adjust path

// Inicializamos la base de datos local SQLite de Expo
// En el futuro, esto se conectará a un driver de Turso para la sincronización (Omnicanal)
import { Platform } from 'react-native';

let sqliteDb;
let dbInstance;

if (Platform.OS === 'web' && typeof SharedArrayBuffer === 'undefined') {
  console.warn('⚠️ Web environment detected without Cross-Origin Isolation (SharedArrayBuffer). Database is MOCKED and will not save data.');
  
  // Simple in-memory mock to allow UI testing on Web without crashing
  const memoryDb: Record<string, any> = {};

  sqliteDb = {};
  dbInstance = {
    select: () => ({
      from: () => {
        const allBatches = Object.values(memoryDb);
        const queryObj = {
          where: (condition?: any) => {
            // Hack para el Mock de rutas específicas
            if (typeof window !== 'undefined' && window.location.pathname.includes('/batch/')) {
              const parts = window.location.pathname.split('/');
              const urlId = parts[parts.length - 1];
              if (memoryDb[urlId]) {
                return [memoryDb[urlId]];
              }
            }
            
            // Si la consulta viene del semáforo/dashboard y busca omitir BACKLOG (simulado)
            // Aquí en un caso real se evaluaría 'condition', pero es un mock simple.
            if (!condition) {
              return allBatches;
            }
            // Para simplificar, devolvemos todo y dejamos que se filtre en memoria
            return allBatches;
          },
          then: (resolve: any) => resolve(allBatches),
          filter: (cb: any) => allBatches.filter(cb)
        };
        return queryObj;
      },
    }),
    insert: () => ({
      values: (data: any) => {
        if (data && data.id) memoryDb[data.id] = data;
        return Promise.resolve();
      },
    }),
    update: () => ({
      set: (newData: any) => ({
        where: () => {
          if (typeof window !== 'undefined' && window.location.pathname.includes('/batch/')) {
            const parts = window.location.pathname.split('/');
            const urlId = parts[parts.length - 1];
            if (memoryDb[urlId]) {
              memoryDb[urlId] = { ...memoryDb[urlId], ...newData };
            }
          } else {
             // Fallback
             if (Object.keys(memoryDb).length > 0) {
               const key = Object.keys(memoryDb)[0];
               memoryDb[key] = { ...memoryDb[key], ...newData };
             }
          }
          return Promise.resolve();
        },
      }),
    }),
  } as any;
} else {
  sqliteDb = openDatabaseSync('washy.db');
  dbInstance = drizzle(sqliteDb, { schema });
}

export { sqliteDb };
export const db = dbInstance;
