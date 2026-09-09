# Washy - Handoff 3 (Phase 3 Complete) 🚀

## 1. Lo que logramos en esta sesión
Hemos completado con éxito la **Fase 3: Sincronización en la Nube y Base de Datos**, dando el salto de un prototipo local a una aplicación con un backend robusto de grado de producción.

* **Migración a Turso (LibSQL):** Destruimos el "Mock" en memoria que causaba colisiones de IDs y conectamos la app a una base de datos distribuida en Turso usando `drizzle-orm` y `@libsql/client/web`.
* **Entorno de Pruebas Seguro:** Configuraste exitosamente una rama (branch) `washytest` en la nube para separar desarrollo de producción. La app lee las credenciales del `.env` local.
* **Diccionario Base en la Nube:** Creamos y ejecutamos un script de *Seed* (con corrección de codificación UTF-8) para guardar las categorías de lavado (⚡ Tech, ☁️ Soft, 🛡️ Armor) y sus reglas de tiempo (Express, Delicado, Pesado).
* **UI Dinámica (Cero Hardcoding):** La pantalla de `Clasificación` ahora hace un `SELECT` a la base de datos para dibujar las opciones. Tu selección se guarda correctamente en la tabla relacional `batch_categories`.
* **Motor de Reconciliación Inteligente:** El motor `useReconciliation.ts` dejó de usar 30 minutos fijos. Ahora cruza tres tablas en tiempo real para saber exactamente cuántos minutos dura el ciclo de la ropa que metiste a la lavadora y despierta la alerta en el tiempo correcto.
* **Indicadores Globales en FSM:** Añadimos tu contador global (`Backlog: 0 | WIP: 2/2`) a la cabecera del flujo paso a paso, arreglando en el camino una colisión de hooks de React.

## 2. Estado Actual de la Arquitectura
* **Frontend:** Expo (React Native Web corriendo en `localhost:8081`).
* **Backend:** Lógica embebida en el cliente + Base de datos en Turso (`washytest`).
* **Reglas de Negocio Validadas:** 
  * El bloqueo de *WIP* (límite de 2) está funcionando perfectamente.
  * El *Semáforo del Sol* (cálculo de atardecer a las 18:00) funciona correctamente indicando Luz Verde a mediodía.
  * Las transiciones de estados (Backlog -> Washing -> Drying) son inmutables y no se sobreescriben al abrir nuevas tandas.

## 3. Siguientes Pasos (Para tu próxima sesión)
Puedes elegir atacar cualquiera de estos frentes la próxima vez que te sientes a codear:

1. **Decisión de Diseño Abierta (UX de Clasificación):**
   - *El Gran Debate:* ¿Debe la clasificación ser un paso obligatorio del flujo Kanban, un módulo separado (Inventario de Clóset), o una herramienta contextual "solo para dudas"?
   - *Riesgo:* Si obligamos al usuario a clasificar prenda por prenda en cada lavado, rompemos la filosofía "Anti-Avoidance" agregando demasiada fricción cognitiva.
   - *Posibles enfoques a explorar:* 
     1) Clasificación en cubetas amplias (como está ahora: Tech, Soft). 
     2) Escáner de dudas: Usar el diccionario de prendas solo cuando el usuario no sabe cómo lavar una pieza específica (ej. seda).
     3) Creación de una vista UI (CRUD) separada del flujo de lavado para administrar el Diccionario de Categorías y Prendas (`garments`) con calma, permitiendo advertencias de "choque de telas".
2. **Notificaciones Push Nativas (Expo Notifications):** Conectar el motor de reconciliación para que en vez de imprimir un `console.log` a los 30/45 minutos, te envíe una alerta real al celular.
3. **Autenticación y Multitenancy:** Agregar un login (Clerk, Supabase Auth o Firebase) para que la app sepa qué usuario eres, permitiendo que tu pareja/roomie use la app de la casa sin mezclar sus tandas con las tuyas.
4. **Despliegue a Producción (Deploy):** Subir la rama web a Vercel, o empaquetar el APK/iOS app usando *Expo EAS Build* para que la instales permanentemente en tu teléfono.
5. **Pantalla de Ajustes (Nagging Profile):** Crear la UI para que puedas editar tu "Perfil de Nagging" (Soft/Medium/Hard) o los tiempos de lavado sin tocar la base de datos.

---
**Nota para el Agente que retome:**
* Lee la estructura en `washy-core/src/db/schema.ts` para entender las tablas.
* El entorno actual apunta a la base de datos `washytest`.
* Corre `pnpm run web` (o `npx expo start --web`) dentro de `packages/washy-ui` para iniciar.
