// ==========================================
// MOCK DATA PARA PRUEBAS (Desarrollo y UI)
// ==========================================
// Estos datos simulan un ecosistema ya vivo para poder probar la interfaz
// sin tener que esperar días reales para ver los cambios de estado.

import { v4 as uuidv4 } from 'uuid';

// 1. USUARIOS (Para probar Handoff y Multiusuario)
export const mockUsers = [
  { id: 'user-1', name: 'Propietario', householdId: 'house-a', createdAt: new Date() },
  { id: 'user-2', name: 'Roomie / Pareja', householdId: 'house-a', createdAt: new Date() }
];

export const mockSettings = [
  {
    userId: 'user-1',
    defaultWasherMins: 30,
    autoDoneDaysThreshold: 3,
    naggingProfile: 'MEDIUM'
  }
];

// 2. REGLAS Y CATEGORÍAS (Patric Richardson Style)
export const mockWashRules = [
  { id: 'rule-express', name: 'Express Tibio (Default)', waterTemp: 'WARM', cycleType: 'EXPRESS', baseDurationMins: 30 },
  { id: 'rule-delicate', name: 'Delicado Frío', waterTemp: 'COLD', cycleType: 'DELICATE', baseDurationMins: 20 },
  { id: 'rule-heavy', name: 'Pesado Tibio', waterTemp: 'WARM', cycleType: 'HEAVY', baseDurationMins: 45 }
];

export const mockCategories = [
  { id: 'cat-tech', name: 'Tech (Deporte)', colorHex: '#00D1B2', defaultWashRuleId: 'rule-express' },
  { id: 'cat-soft', name: 'Soft (Delicado)', colorHex: '#B8E986', defaultWashRuleId: 'rule-delicate' },
  { id: 'cat-armor', name: 'Armor (Jeans/Pesado)', colorHex: '#4A90E2', defaultWashRuleId: 'rule-heavy' }
];

// 3. PRENDAS (El Diccionario)
export const mockGarments = [
  { id: 'g-1', categoryId: 'cat-tech', photoUri: '/mocks/shirt1.jpg', hasPrint: true, isDelicateBlend: false }, // Trigger: Voltear
  { id: 'g-2', categoryId: 'cat-soft', photoUri: '/mocks/sweater.jpg', hasPrint: false, isDelicateBlend: true }, // Trigger: Eslabón débil
  { id: 'g-3', categoryId: 'cat-armor', photoUri: '/mocks/jeans.jpg', hasPrint: false, isDelicateBlend: false }
];

// 4. EL FUNNEL DE TANDAS (Para probar la UI inmediatamente)
// Simulamos fechas pasadas para forzar a la UI a reaccionar (Ej. Auto-Done)
const now = new Date();
const tresDiasAtras = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
const unaHoraAtras = new Date(now.getTime() - (60 * 60 * 1000));

export const mockBatches = [
  {
    id: 'batch-1-backlog',
    status: 'BACKLOG',
    priorityScore: 50,
    ownerId: 'user-1',
    handlerId: 'user-1',
    createdAt: unaHoraAtras,
    _notes: 'Tanda normal esperando a ser lavada'
  },
  {
    id: 'batch-2-washing',
    status: 'WASHING',
    priorityScore: 0,
    ownerId: 'user-1',
    handlerId: 'user-1',
    createdAt: unaHoraAtras,
    _notes: 'En la lavadora. El timer debería estar a punto de sonar.'
  },
  {
    id: 'batch-3-silla-closet',
    status: 'READY_TO_FOLD',
    priorityScore: 0,
    ownerId: 'user-1',
    handlerId: 'user-1',
    createdAt: tresDiasAtras, // Lleva 3 días limpia!
    _notes: 'Esta tanda debe disparar la lógica de AUTO-DONE apenas se abra la app'
  },
  {
    id: 'batch-4-handoff',
    status: 'DRYING',
    priorityScore: 0,
    ownerId: 'user-1',
    handlerId: 'user-2', // El Roomie colgó la ropa de User-1
    createdAt: now,
    _notes: 'Simula que alguien más te hizo el favor. El UI debe mostrar el "Pase Mágico"'
  }
];
