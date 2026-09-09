# Washy UI - Arquitectura del Frontend (React Native / Expo)

Dado que Washy es una app que busca reducir la carga cognitiva (TDAH), la interfaz no puede ser un laberinto de menús. Se basa en una arquitectura **Domain-Driven UX** (Experiencia guiada por dominios) y enrutamiento basado en archivos (tipo Expo Router).

## 1. Estructura de Carpetas (Feature-Sliced Design)

\`\`\`text
packages/washy-ui/src/
├── app/                        # Rutas de la aplicación (Expo Router)
│   ├── (tabs)/                 # Navegación principal oculta
│   │   ├── index.tsx           # Dashboard Central (El Semáforo + WIP)
│   │   ├── backlog.tsx         # El agujero negro (Oculto por defecto)
│   │   └── settings.tsx        # Perfil de Nagging y Hardware
│   ├── batch/
│   │   ├── [id].tsx            # Controlador de Flujo (Washing -> Drying)
│   │   └── new.tsx             # Creación (Tanda Frankenstein)
│   └── inventory/
│       └── add-garment.tsx     # Diccionario (Toggles de Richardson)
│
├── features/                   # Componentes acoplados a la lógica de negocio
│   ├── dashboard/
│   │   ├── TrafficLight.tsx    # Semáforo de disponibilidad de máquina
│   │   ├── ActiveWipCard.tsx   # Tarjeta expansiva de la tanda actual
│   │   └── NudgeWidget.tsx     # Tarjeta de incentivo (Clima, Gym, Roomies)
│   ├── batch-flow/
│   │   ├── PipelineStepper.tsx # Mapa visual (Dónde estoy en el proceso)
│   │   ├── TimerDisplay.tsx    # Temporizador (Hora absoluta de finalización)
│   │   ├── MeshBagWarning.tsx  # Alerta para tandas Frankenstein
│   │   └── HandoffButton.tsx   # Botón del "Pase Mágico"
│   └── inventory/
│       └── GarmentCard.tsx     # Muestra la prenda con iconos de alertas
│
├── shared/                     # Componentes tontos (UI Kit) y utilidades
│   ├── ui/
│   │   ├── PhysicalButton.tsx  # Botones con micro-copy físico ("Ya saqué la ropa")
│   │   ├── PanicButton.tsx     # Botón rojo para abortar tandas
│   │   ├── ElasticButton.tsx   # Botones de Cierre (Mini, Plus, Elite)
│   │   └── Badge.tsx           # Etiquetas de Categorías (Tech, Soft)
│   ├── hooks/
│   │   ├── useReconciliation.ts# Hook que corre al abrir la app (Busca timers muertos)
│   │   └── useLiveBatch.ts     # Hook reactivo a SQLite (Drizzle)
│   └── lib/
│       └── timeUtils.ts        # Formateo de fechas
\`\`\`

## 2. Decisiones Clave de UI/UX

### A. El Patrón "Single Screen Focus" (Cero Zeigarnik)
El usuario entra a la app y **solo ve una cosa**: La pantalla `index.tsx` (Dashboard). Todo lo demás está oculto.

### B. El Componente \`ActiveWipCard\`
Mutante según estado (SOAKING, WASHING, DRYING, READY_TO_FOLD).

### C. El Hook \`useReconciliation()\`
Corre al abrir la app para rescatar timers huérfanos.

## 3. Wayfinding y Función Ejecutiva (Saber qué hacer)
1. **Mapa Físico:** Stepper visual del flujo.
2. **Cero Matemáticas:** Muestra la hora absoluta de finalización.
3. **Micro-copy físico:** Botones que describen acciones reales ("Ya saqué la ropa").

## 4. Sistema de Nudges (Incentivos sin Culpa)
Para vencer la "Procrastinación por Demanda" típica del TDAH, la app evita los recordatorios culpabilizadores ("¡Tienes 10 playeras sucias!"). En su lugar, usa un componente `<NudgeWidget />` en el Dashboard que lanza sugerencias positivas y de baja fricción basadas en el **Dominio de Contexto**:

- **A. Nudge Predictivo (Por Actividad):** Basado en los `activityLogs` (Ej. Google Calendar).
  - *Mensaje:* "Llevas 3 días yendo al Gym. ¿Qué tal si echamos una tanda Express (30 min) solo de ropa deportiva para que no te quedes sin reservas?"
- **B. Nudge Climático (Oportunidad):** Conectado a una API de clima simple.
  - *Mensaje:* "Hace muchísimo sol afuera ☀️. Si lavas las sábanas ahora, se secarán solas en un par de horas." (Aprovecha el hyperfocus de la oportunidad perfecta).
- **C. Nudge de Ventana de Oportunidad (Roomies):**
  - *Mensaje:* "La lavadora acaba de desocuparse. ¡Tienes vía libre para una tanda rápida antes de que alguien más la use!"
- **D. Nudge de Fricción Cero (Micro-paso):** Cuando el Backlog está muy lleno.
  - *Mensaje:* "No laves todo hoy. Solo mete la ropa oscura, literal te tomará 2 minutos cargar la máquina."
