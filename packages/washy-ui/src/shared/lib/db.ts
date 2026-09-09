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
      from: () => ({
        where: () => {
          const allBatches = Object.values(memoryDb);
          
          // Hack para el Mock: Si estamos en la ruta de una tanda específica,
          // devolvemos solo esa tanda para no mezclar los estados.
          if (typeof window !== 'undefined' && window.location.pathname.includes('/batch/')) {
            const parts = window.location.pathname.split('/');
            const urlId = parts[parts.length - 1];
            if (memoryDb[urlId]) {
              return [memoryDb[urlId]];
            }
          }
          
          // Si estamos en el Dashboard consultando WIP o Backlog,
          // filtramos las terminadas para que no sigan apareciendo.
          return allBatches.filter(b => b.status !== 'DONE' && b.status !== 'BACKLOG');
        },
      }),
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
