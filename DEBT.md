# Registro de Deuda Técnica (Washy)

Este documento rastrea los atajos temporales (`TODOs`) y configuraciones "hardcodeadas" que deben resolverse para llevar el sistema a producción.

## 1. Persistencia y Sincronización (Prioridad Crítica)
- **Estado Actual:** En dispositivos nativos (iOS/Android), `expo-sqlite` guarda en disco. Sin embargo, en la Web (sin *Cross-Origin Isolation*), el archivo `db.ts` tiene un *fallback* a un objeto en memoria RAM (`memoryDb`). Esto causa que **al refrescar la página, todo el progreso se borre**.
- **Solución (Fase 3):** Sustituir el mock de memoria integrando **Turso (libSQL)** u otro driver remoto (ej. Supabase) en `src/shared/lib/db.ts` para que exista una capa de persistencia real en la nube que sobreviva a la recarga de pestañas y permita sincronizar múltiples dispositivos.

## 2. Motor de Reconciliación (Tiempos Hardcodeados)
- **Estado Actual:** En `useReconciliation.ts`, el tiempo límite para rescatar una tanda está "quemado" estáticamente en código a 30 minutos (`DEFAULT_CYCLE_MS = 30 * 60 * 1000`).
- **Solución:** Reemplazar este valor realizando un `LEFT JOIN` a través de `batchCategories` para obtener el ID de la categoría, y luego otro cruce con `washRules` para extraer dinámicamente la columna `baseDurationMins` específica a esa tanda (ej. 45 minutos si es *Heavy*).

## 3. Notificaciones Push (Alertas Reales)
- **Estado Actual:** El sistema de auto-rescate y los recordatorios de estado solo ejecutan un `console.log()` simulando la campana de alerta.
- **Solución:** Instalar y configurar `expo-notifications`. Pedir permisos al sistema operativo en el arranque y disparar notificaciones locales reales (que hagan vibrar o sonar el teléfono) cuando cambie el estado de la máquina o el Motor de Reconciliación detecte una fuga.

## 4. Dependencias del Monorepo (Hoisting)
- **Estado Actual:** El paquete `washy-core` depende de `drizzle-orm` en sus esquemas (`schema.ts`), pero la dependencia no está declarada en `packages/washy-core/package.json`. Actualmente funciona por casualidad porque `washy-ui` lo instala y el gestor `pnpm` lo eleva (hoisting) a la raíz.
- **Solución:** Correr `pnpm add drizzle-orm` directamente dentro del directorio de `washy-core` para que sea un paquete verdaderamente autónomo.

## 5. UI de Flujos Incompletos
- **Estado Actual:** El paso del "Semáforo" asume clima/hora hardcodeada en `index.tsx` (restando horas desde las 18:00).
- **Solución:** Integrar una API de clima ligera o permitir que el usuario parametrice su propio umbral de horas de sol según su país/zona horaria desde los `userSettings`.
