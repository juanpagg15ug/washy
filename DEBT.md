# Registro de Deuda Técnica (Washy)

Este documento rastrea los atajos temporales (`TODOs`) y configuraciones "hardcodeadas" que deben resolverse para llevar el sistema a producción.

## 1. Persistencia y Sincronización (Prioridad Crítica)
- **Estado Actual:** En dispositivos nativos (iOS/Android), `expo-sqlite` guarda en disco. Sin embargo, en la Web (sin *Cross-Origin Isolation*), el archivo `db.ts` tiene un *fallback* a un objeto en memoria RAM (`memoryDb`). Esto causa que **al refrescar la página, todo el progreso se borre**.
- **Solución (Fase 3):** Sustituir el mock de memoria integrando **Turso (libSQL)** u otro driver remoto (ej. Supabase) en `src/shared/lib/db.ts` para que exista una capa de persistencia real en la nube que sobreviva a la recarga de pestañas y permita sincronizar múltiples dispositivos.

## 2. Motor de Reconciliación (Tiempos Hardcodeados)
- **Estado Actual:** En `useReconciliation.ts`, el tiempo límite para rescatar una tanda está "quemado" estáticamente en código a 30 minutos (`DEFAULT_CYCLE_MS = 30 * 60 * 1000`).
- **Solución:** Reemplazar este valor realizando un `LEFT JOIN` a través de `batchCategories` para obtener el ID de la categoría, y luego otro cruce con `washRules` para extraer dinámicamente la columna `baseDurationMins` específica a esa tanda (ej. 45 minutos si es *Heavy*).

## 3. Notificaciones Push (Alertas Reales)
- **Estado Actual:** ~~El sistema de auto-rescate... solo ejecuta un console.log().~~ (Resuelto)
- **Solución:** ~~Instalar y configurar expo-notifications...~~ Resuelto integrando `expo-notifications` en el hook `useReconciliation.ts` para solicitar permisos y disparar notificaciones locales que alertan al usuario cuando expira el ciclo de lavado.

## 4. Dependencias del Monorepo (Hoisting)
- **Estado Actual:** El paquete `washy-core` depende de `drizzle-orm` en sus esquemas (`schema.ts`), pero la dependencia no está declarada en `packages/washy-core/package.json`. Actualmente funciona por casualidad porque `washy-ui` lo instala y el gestor `pnpm` lo eleva (hoisting) a la raíz.
- **Solución:** Correr `pnpm add drizzle-orm` directamente dentro del directorio de `washy-core` para que sea un paquete verdaderamente autónomo.

## 5. UI de Flujos Incompletos
- **Estado Actual:** ~~El paso del "Semáforo" asume clima/hora hardcodeada en `index.tsx` (restando horas desde las 18:00).~~ (Resuelto)
- **Solución:** ~~Integrar una API de clima ligera...~~ Resuelto integrando `Open-Meteo` y `geojs.io` en `index.tsx` para obtener dinámicamente la hora del atardecer según la ubicación (IP) del usuario.
