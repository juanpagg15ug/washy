# Washy: Arquitectura y Decisiones de Diseño (v1)

Basado en el marco de diseño (ADHD Laundry Ritual OS), este documento define las reglas inquebrantables de arquitectura técnica, modelo de datos y UX para Washy.

## 1. Principios Fundamentales (El Contrato UX)
- **Local-First:** La app escribe/lee de una base de datos local (ej. SQLite, WatermelonDB) para garantizar latencia cero y funcionamiento offline.
- **La App como Prótesis (No como Mascota):** La app asume la carga cognitiva (timers). Solo interrumpe al usuario cuando hay riesgo de fuga en el flujo.
- **Backlog Invisible:** Para evitar el Efecto Zeigarnik, el listado de pendientes está oculto. Solo se muestra la Tanda Activa (Límite WIP = 1).
- **Cierre sin Culpa (Elastic Habits):** El guardado ofrece 3 niveles equivalentes (Mini, Plus, Elite) que cierran el ciclo exitosamente.
- **Filosofía Patric Richardson (Laundry Evangelist):** 
  - El enemigo es la *fricción*, no el color. Agrupamos por peso (Heavy/Armor vs Light/Soft).
  - Ciclos por defecto: **Express (30 mins)** con **Agua Tibia**. Minimiza daño y tiempo en "Zona Ciega".
  - Cero suavizantes (atrapan olores).

## 2. Salvaguardas Técnicas (Prevención de pérdida de WIP)
- **Timers a Nivel Sistema Operativo:** Toda transición a "Zona Ciega" programa un *Worker* o *Local Scheduled Notification* nativo.
- **Visibilidad Pasiva (Anclas):** Uso de *Live Activities* (iOS) o *Persistent Notifications* (Android) para mantener el WIP en la pantalla de bloqueo.
- **Red de Escalado (Nagging):** Si se ignora una transición crítica (ej. ropa mojada), la app escala la urgencia de las alertas cada 15 minutos.

## 3. Diseño Guiado por Dominio (DDD)
### A. Dominio de Inventario (El Diccionario)
Conocimiento estático. Identifica excepciones, no el 100% del clóset.
- **Entidades:** `Garment` (Prenda), `Category` (Tech, Soft, Armor), `WashRule`.
- **Reglas Richardson integradas:** 
  - **Telas Mixtas (Blends):** Toggle rápido `is_delicate_blend`. Si la prenda tiene un 1% de seda/lana, hereda la regla frágil (Regla del Eslabón Débil molecular).
  - **Estampados:** Toggle `has_print`. Desencadena un recordatorio UX pre-lavado: *"Voltear al revés"*.

### B. Dominio de Flujo (El Kanban / WIP)
Gestiona el movimiento físico.
- **Entidades:** `Batch` (Tanda física), `BatchEvent`.
- **Estados del Funnel:** `BACKLOG` -> `SOAKING` (Opcional) -> `WASHING` -> `DRYING` -> `READY_TO_FOLD` -> `DONE`.
- **Lógica de Remojo (Soaking):** 
  - Ofrece temporizadores largos (Ej. 2h Corto o 12h Toda la Noche).
  - *Mutex Variable:* Si el remojo es "En Lavadora", bloquea el semáforo. Si es "En Cubeta", la lavadora sigue libre.

### C. Dominio de Contexto (El Impulso y Restricciones)
- **Entidades:** `ActivityLog` (Gym, Fiesta, etc.), `Constraints` (Hora, Clima, Ocupación de máquina).
- **Regla:** Sugiere prioridades en el Backlog y alimenta el Semáforo.

### D. Dominio de Ejecución (El Motor)
La capa técnica que habla con el OS del teléfono. (Ver sección 8 para resiliencia).

## 4. Estrategia de Datos (Memoria vs. Registros)
- **Memoria (Event Sourcing - Inmutable):**
  - `batch_events`: Registra cada transición (Wash -> Hang -> Fold). *Nuevo:* Incluye `actor_id` para saber si el cambio lo hizo el Usuario, el Roomie, o el Sistema (Auto-Done).
  - `activity_logs`: Registro histórico de eventos de vida (Gym).
- **Registros (CRUD - Sobrescribibles):**
  - Estado actual del `Batch` (El WIP). Configuración del diccionario de prendas.
- **Future-Proofing:** Las entidades core incluyen `metadata (JSONB)` para integraciones futuras (ej. APIs externas).

## 5. Lógica Multiusuario (Hogar y Recursos Compartidos)
- **El Pase Mágico (Handoff Cognitivo):** Un `Batch` tiene `owner_id` (dueño) y `handler_id` (operador actual). Si tu pareja saca tu ropa, toca *[ Entregar tanda ]*. El WIP y los timers saltan mágicamente a tu teléfono.
- **El "Usuario Fantasma":** Si un *roomie* que no usa la app está usando la máquina, tocas `[Máquina Ocupada]`. Cambia el semáforo a Rojo y activa un timer pasivo para recordarte revisar después. No se crea una tanda falsa.

## 6. Tratamiento de Edge Cases (Fricción Cero)
- **Lluvia / Fallas:** Botones rápidos de `[Retraso]` o `[Reiniciar Timer]` que ajustan alarmas sin pedir recálculos.
- **La "Silla-Clóset" (Auto-Done por TDAH):** Si una tanda pasa X días en "Lista para doblar", el sistema aplica Auto-Done (Nivel Mini) y limpia el WIP a 0 (Rompe Efecto Zeigarnik).
- **Tanda Frankenstein (Categorías Mezcladas):** 
  - Aplica la Regla de la prenda más delicada.
  - *UX Fallback Richardson:* Sugiere activamente usar **Bolsas de Lavado (Mesh Bags)** para las prendas delicadas dentro de la carga pesada.
- **Tanda Dividida:** No se permite dividir un Batch en la UI. La tanda avanza a la velocidad de su prenda más lenta.
- **Botón de Abortar (Pánico):** Destruye el WIP activo sin dejar registros de error para resetear la realidad.

## 7. Módulo de Configuración (Parametrización)
- **Hardware Profile:** Duración de ciclos reales de tu lavadora local (Ej. Express = 30m).
- **Tolerancia Cognitiva:** Umbral en días para detonar el Auto-Done de la "Silla-Clóset".
- **Perfiles de Notificación:** Suave, Medio, Duro (Critical Alerts que rompen modo silencio).

## 8. Ingeniería de Confiabilidad y Auditoría (Error Catching)
Para que el usuario confíe ciegamente en el sistema (Carga Cognitiva = 0), el Motor de Ejecución incluye:
- **Motor de Reconciliación (Reconciliation Engine):** Al abrir o reanudar la app, un script revisa la BD buscando tandas activas (`WASHING`, `SOAKING`) cuyos tiempos objetivo ya pasaron en el reloj real. Si el OS mató el timer en segundo plano o el teléfono se reinició, la app dispara una alerta de recuperación inmediata. Evita el "Hoyo Negro".
- **Log de Notificaciones (`notification_logs`):** Nueva tabla que registra cada intento de comunicación con el usuario (`batch_id`, `type`, `scheduled_for`, `delivered_at`, `status`). Sirve para depurar fallas de entrega y ajustar perfiles de *Nagging*.

## 9. Integraciones de Ecosistema (Google Calendar / Tasks)
La integración con herramientas externas de productividad evita que Washy sea un silo de información y permite predecir el comportamiento del usuario.

- **Google Calendar (Inbound / Contexto):**
  - *Alimentación de Demanda:* Escanea palabras clave (ej. "Gym", "Crossfit", "Fiesta") para crear automáticamente un `ActivityLog` e inyectar prioridad al Backlog sin que el usuario toque la app.
  - *Bloqueo Proactivo del Semáforo:* Si el sistema calcula que el lavado terminará exactamente en medio de una reunión de Zoom de 2 horas (leída del calendario), el Semáforo advierte: *"Tu lavadora terminará durante tu junta. ¿Podrás sacarla?"* para evitar que la ropa se quede mojada en la máquina.
- **Google Tasks (Outbound / Ejecución):**
  - *Unificación de Dashboards:* Para usuarios que viven en Google Tasks, Washy puede exportar la tarea "Ropa seca: Lista para guardar" a Google Tasks.
  - *Limpieza Automática (Zombies):* Si la regla de "Silla-Clóset" (Auto-Done) se detona en Washy, Washy debe mandar a borrar o marcar como completada la tarea en Google Tasks de forma silenciosa para evitar generar listas eternas de culpa en otros ecosistemas.
