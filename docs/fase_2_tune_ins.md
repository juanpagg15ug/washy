# Washy - Tune-Ins Pendientes de la Fase 2 🎛️

La **Fase 2** construyó el "Cerebro" de Washy: las reglas anti-avoidance, los límites WIP, el semáforo del clima y el motor de reconciliación. Aunque la lógica base funciona y cumple su propósito, existen tres afinaciones (*tune-ins*) críticas de diseño y arquitectura que deben abordarse en iteraciones futuras para llevar el producto a nivel *premium*.

---

## 1. Independencia del Motor de Reconciliación (Background Tasks)
**Estado Actual:**
El motor `useReconciliation.ts` depende del ciclo de vida de React. Utiliza un `useEffect` para calcular si los 30/45 minutos de la lavadora ya expiraron.
**El Problema:**
Si el usuario cierra la aplicación o la pestaña web completamente, el motor "se duerme". La tanda queda congelada en la zona ciega hasta que el usuario vuelva a abrir la app de forma manual.
**El Tune-In Faltante:**
*   Migrar la lógica del temporizador a un proceso de fondo. 
*   **Implementación ideal:** Al iniciar el lavado, programar un cron job o utilizar un Worker/Background Task nativo (o depender del servidor de Notificaciones Push) que despierte al dispositivo pasado el tiempo de la categoría seleccionada, sin depender de que la UI esté viva.

## 2. Semáforo Meteorológico Real (Weather API)
**Estado Actual:**
El indicador de Luz Verde/Amarilla/Roja del Dashboard está basado en un cálculo matemático duro: asume que el sol se oculta exactamente a las 18:00 (6:00 PM) todos los días.
**El Problema:**
No toma en cuenta la latitud del usuario, los cambios de estación (horario de verano/invierno) ni el estado climático actual (lluvia, tormenta, alta humedad).
**El Tune-In Faltante:**
*   Integrar una API meteorológica gratuita (ej. *OpenWeatherMap API*).
*   **Lógica a agregar:** Si el pronóstico indica lluvia en las próximas 3 horas, el semáforo debe cambiar a gris/rojo con el mensaje *"Lluvia inminente. Solo secado en interiores"*. Si es invierno, debe ajustar la hora del atardecer automáticamente basándose en las coordenadas del dispositivo.

## 3. Comportamiento Agresivo vs. Pasivo (Nagging Profile)
**Estado Actual:**
En la base de datos (tabla `userSettings`) existe un campo `naggingProfile` (`SOFT`, `MEDIUM`, `HARD`), y en la UI se le pregunta al usuario su meta de cierre (`MINI`, `PLUS`, `ELITE`). Sin embargo, estas variables son meramente decorativas en este momento.
**El Problema:**
El sistema trata a todos los usuarios de la misma forma, independientemente de si están en un día de baja energía o si configuraron su perfil para ser estrictos.
**El Tune-In Faltante:**
*   Vincular el perfil de insistencia con la frecuencia de las Notificaciones Push.
*   **Ejemplo Hard:** Si el perfil es `HARD`, enviar recordatorios cada 15 minutos si la ropa se queda húmeda en la lavadora (fase `HANGING` evadida).
*   **Ejemplo Soft:** Si el perfil es `SOFT`, enviar una única notificación amistosa al terminar el lavado y no volver a molestar en todo el día, respetando la baja energía del usuario.

## 4. Priorización Automática del Backlog (`priorityScore`)
**Estado Actual:**
En la tabla `batches`, existe un campo `priorityScore` que se inicializa en `0` por defecto cuando el usuario anota una nueva intención de lavado. No hay interfaz para ver el backlog ordenado ni algoritmos que modifiquen este puntaje.
**El Problema:**
El usuario aún tiene que decidir qué lavar primero (Parálisis por Análisis / Disfunción Ejecutiva). Si hay 4 tandas en el backlog, decidir cuál es la más urgente consume fricción cognitiva que la app debería resolver.
**El Tune-In Faltante:**
*   **Motor de Priorización:** Desarrollar un algoritmo que eleve el `priorityScore` de forma dinámica. Por ejemplo, si un usuario indica que el cesto tiene ropa interior (prendas críticas), el puntaje sube a 100. Si las sábanas llevan 3 semanas sin lavarse, el puntaje escala.
*   **UI del Backlog:** Crear una vista de lista (List View) para el Backlog donde Washy dicte exactamente *"Esta es la tanda #1 que debes agarrar"*, ordenando automáticamente los registros de mayor a menor `priorityScore`.

## 5. Tablas de Fundación (El Puente a la Fase 4 y 5)
Existen varias tablas en el esquema (`schema.ts`) que fueron creadas como cimientos arquitectónicos pero que actualmente están huérfanas (no tienen integración con la Interfaz de Usuario). Su propósito es el siguiente:

*   **`activityLogs` (Motor de Proactividad y Zero-Friction):** Diseñada para rastrear el estilo de vida del usuario. **Estrategia Android/Google:** Dado que el ecosistema objetivo es Windows/Android, el *tune-in* ideal no es una UI manual, sino integrar **Health Connect API** (para leer automáticamente cuando el usuario detecta un Workout/Gym desde su smartwatch) o exponer un Webhook para **Samsung Routines/Tasker**. Esto permite que Washy registre actividades en silencio e incremente el `priorityScore` de la ropa *Tech* de forma mágica, eliminando por completo la fricción de captura.
*   **`notificationLogs` (Despachador Asíncrono):** Esta tabla funcionará como la cola de mensajes (Message Queue) del sistema. El motor de reconciliación no disparará alertas directas, sino que escribirá registros con status `PENDING` y un `scheduled_for`. Un Worker nativo consumirá esta tabla para enviar las Push Notifications reales. Esto es el corazón técnico del *Nagging Profile*.
*   **`users` y `userSettings` (Autenticación y Ajustes):** Actualmente la app opera en un modelo "Single Player Local". Al integrar autenticación (ej. Supabase Auth), se activarán estas tablas para permitir configuraciones globales (agresividad del sistema, tolerancias de días para el "Auto-Done") y habilitará el soporte para múltiples personas en el mismo hogar sin cruzar estados de lavado.

---
**Objetivo de este documento:** 
Asegurar que el equipo técnico (o el próximo agente IA) entienda que la lógica matemática actual es un *placeholder* funcional, pero el diseño final de producto exige estas integraciones para ser una herramienta verdaderamente empática y proactiva.
