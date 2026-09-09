# Washy: Project Handoff Document v2 (Fase Móvil & Omnicanal)
**Proyecto:** Local-First ADHD Laundry Ritual OS
**Estado Actual:** Transición de prototipo web (Vite) a aplicación omnicanal (Expo Router) completada.

## 1. Lo que se ha construido en la Fase 2
La arquitectura se ha consolidado. Ya no dependemos de un estado efímero (`useState`); ahora tenemos una app lista para compilarse en iOS, Android y Web con persistencia real.

*   **Infraestructura Omnicanal (Expo Router):** Se eliminó Vite. La navegación ahora es basada en archivos (`app/(tabs)/index.tsx`, `app/batch/[id].tsx`).
*   **Base de Datos Local (SQLite + Drizzle):** La UI ahora consume directamente el esquema alojado en `washy-core` gracias a la integración de pnpm workspaces. Las transiciones de estado hacen `UPDATE` en la tabla `batches` e `INSERT` inmutables en `batch_events`.
*   **Feature-Sliced Design + Atomic Design:** El código UI ahora respeta dominios. Los componentes puramente visuales viven en `src/shared/ui/` (ej. `PhysicalButton.tsx`), garantizando consistencia y obedeciendo a la Ley de Fitts (botones masivos).
*   **Máquina de Estados Restrictiva:** 
    *   **Límite Físico:** El Dashboard lee la DB y bloquea el botón "Iniciar Ritual" si la lavadora está en `WASHING` o `SOAKING`.
    *   **Single Screen Focus:** El flujo de la tanda (`app/batch/[id].tsx`) atrapa al usuario en una sola pantalla, forzándolo a completar la fase actual (Anclaje -> Clasificación -> Lavado) sin distracciones de navegación.

## 2. Mapa del Código Base Actualizado (`packages/washy-ui`)
*   `app/_layout.tsx`: Layout raíz. Inicializa el motor de reconciliación y el ErrorBoundary.
*   `app/(tabs)/index.tsx`: El Dashboard. Controla el semáforo, el límite de WIP (2/2) y las ranuras físicas de lavadora y tendedero.
*   `app/batch/new.tsx`: Orquestador invisible. Genera el ID UUID, inserta en `BACKLOG` y redirige.
*   `app/batch/[id].tsx`: Controlador principal de la FSM (Time Check -> Anchor -> Classification -> Washing -> Hanging -> Drying -> Closure [Intención -> Acción -> Registro]).
*   `src/shared/lib/db.ts`: Conexión de `expo-sqlite` y Drizzle ORM (con Mock de seguridad en memoria para web local).
*   `src/shared/hooks/useReconciliation.ts`: Motor de seguridad (Safety Net) para rescatar timers de la zona ciega.
*   `src/shared/ui/PhysicalButton.tsx`: Átomo de diseño principal (Botones Chunky con Ley de Fitts).
*   `decisiones_diseno_ux.md`: **Lectura obligatoria.** Documento con las decisiones de psicología conductual, prevención de autoengaño, la teoría de las ventanas rotas y la simetría de fases activas/pasivas.

## 3. Próximos Pasos Inmediatos para el Siguiente Agente/Desarrollador

Si acabas de tomar este proyecto, debes priorizar lo siguiente:

### A. Completar el Motor de Reconciliación (`useReconciliation.ts`)
Actualmente el hook es un cascarón que se ejecuta al arrancar la app. 
*   **Tarea:** Escribir la consulta Drizzle que seleccione todas las tandas en estado `WASHING`. 
*   Comparar su `createdAt` (más los minutos de duración del ciclo) contra el tiempo actual `Date.now()`.
*   Si expiró, ejecutar el `UPDATE` a `READY_TO_FOLD` y disparar una notificación local (ej. `expo-notifications`).

### B. El Diccionario de Prendas (Inventario)
La máquina de estados actual asume la categoría (Soft/Tech/Armor) mediante los botones en pantalla. 
*   **Tarea:** Crear la interfaz para consultar la tabla `garments` y sugerir el "Default Seguro" en caso de duda (evitando la parálisis por análisis del TDAH).

### C. Fase 3: Sincronización y Multitenancy (Railway / Turso)
La app actualmente vive aislada en el celular.
*   **Tarea:** Extender la configuración en `src/shared/lib/db.ts` para habilitar la sincronización de libSQL (Turso) en background con un servidor PostgreSQL en Railway.
*   **Tarea:** Implementar autenticación simple (Supabase Auth o similar) para inyectar el `user_id` en todas las consultas y habilitar la escalabilidad a los 1,000+ usuarios previstos.

## 4. Reglas Intocables (Recordatorio)
*   **No destruir la Omnicanalidad:** El código debe seguir funcionando con `pnpm run web`. No usar librerías nativas que rompan el soporte web sin proveer un fallback.
*   **Cero Matemáticas:** Nunca mostrar cuentas regresivas exactas, usar horas absolutas.
*   **No hay castigos:** Las notificaciones perdidas o las tandas abortadas no generan rayas rojas ni afectan el "puntaje". Todo evento debe registrarse en la BD con neutralidad clínica.
