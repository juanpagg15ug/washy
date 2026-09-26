# Registro de Deuda Técnica (Washy)

Este documento rastrea las configuraciones, parches y decisiones arquitectónicas de Washy.

---

## 1. Persistencia y Sincronización (Fase 3 - Resuelto)
- **Estado:** ✅ **RESUELTO.**
- **Solución Aplicada:** Se integró la base de datos distribuida en la nube **Turso (libSQL)** con `drizzle-orm` en `src/shared/lib/db.ts`, operando sobre la rama `washytest` con credenciales seguras en `.env`. Persiste todos los estados entre dispositivos y recargas de navegador.

---

## 2. Motor de Reconciliación con Tiempos Dinámicos (Fase 3 - Resuelto)
- **Estado:** ✅ **RESUELTO.**
- **Solución Aplicada:** En `useReconciliation.ts`, la consulta realiza un `INNER JOIN` entre `batchCategories`, `categories` y `washRules` para extraer dinámicamente la columna `baseDurationMins` específica a cada tanda (ej. 45m para Heavy, 20m para Delicate, 30m para Express).

---

## 3. Notificaciones Locales Nativas (Fase 3 - Resuelto)
- **Estado:** ✅ **RESUELTO.**
- **Solución Aplicada:** Integrado `expo-notifications` en `useReconciliation.ts` y `batch/[id].tsx` para solicitar permisos y programar alertas nativas cuando expira el ciclo de lavado.

---

## 4. Declaración de Dependencias del Monorepo (Fase 3 - Resuelto)
- **Estado:** ✅ **RESUELTO.**
- **Solución Aplicada:** La dependencia `drizzle-orm` se declaró e instaló explícitamente en [`packages/washy-core/package.json`](file:///c:/JP_Workplace/03_CORE3_Tech/DEV_proyects/Washy/packages/washy-core/package.json).

---

## 5. Módulo del Semáforo en Washy Core (Fase 4 - Resuelto)
- **Estado:** ✅ **RESUELTO.**
- **Solución Aplicada:** Se extrajo la función `checkSemaphore` fuera de los componentes React y se integró en [`packages/washy-core/src/rules/semaphore.ts`](file:///c:/JP_Workplace/03_CORE3_Tech/DEV_proyects/Washy/packages/washy-core/src/rules/semaphore.ts), agregando cálculo de hora exacta de reloj y 3 pruebas unitarias en Vitest.

---

## 6. Nagging Engine Puro en Washy Core (Fase 4 - Resuelto)
- **Estado:** ✅ **RESUELTO.**
- **Solución Aplicada:** Creado el motor [`packages/washy-core/src/rules/nagging.ts`](file:///c:/JP_Workplace/03_CORE3_Tech/DEV_proyects/Washy/packages/washy-core/src/rules/nagging.ts) para calcular la frecuencia y severidad de notificaciones según el perfil del usuario (`SOFT`, `MEDIUM`, `HARD`), validado con 3 pruebas unitarias en Vitest.

---

## 7. Próximos Desafíos Técnicos (Roadmap Futuro)
1. **Background Tasks nativos en móvil:** Programar Workers nativos con `expo-task-manager` para la ejecucion pasiva cuando la app está suspendida en Android/iOS.
2. **Offline-First Fallback:** Almacenamiento local secundario en `IndexedDB` para sesiones sin conexión a internet.
3. **Autenticación Multi-usuario:** Integración con Clerk / Supabase Auth para multitenancy de roomies/parejas.
