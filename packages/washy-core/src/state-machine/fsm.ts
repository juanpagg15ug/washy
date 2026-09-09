export type BatchState =
  | 'BACKLOG'
  | 'TIME_CHECK'
  | 'ANCHOR'
  | 'CLASSIFICATION'
  | 'SOAKING'
  | 'WASHING'
  | 'DRYING'
  | 'CLOSURE'
  | 'DONE';

export type ClosureLevel = 'MINI' | 'PLUS' | 'ELITE';
export type ClothesCategory = 'SOFT' | 'TECH' | 'ARMOR';

export interface LaundryBatch {
  id: string;
  state: BatchState;
  createdAt: Date;
  updatedAt: Date;
  category?: ClothesCategory;
  closureLevel?: ClosureLevel;
}

/**
 * Máquina de Estados Finitos (FSM)
 * Define las transiciones permitidas. Incluye lógica de "Deshacer" (volver al paso anterior)
 * para mitigar el error humano sin corromper el estado.
 */
const validTransitions: Record<BatchState, BatchState[]> = {
  BACKLOG: ['TIME_CHECK'],
  TIME_CHECK: ['ANCHOR', 'BACKLOG'], 
  ANCHOR: ['CLASSIFICATION', 'TIME_CHECK'], 
  CLASSIFICATION: ['WASHING', 'SOAKING', 'ANCHOR'],
  SOAKING: ['WASHING', 'CLASSIFICATION'],
  WASHING: ['DRYING', 'CLASSIFICATION', 'SOAKING'], 
  DRYING: ['CLOSURE', 'WASHING'],
  CLOSURE: ['DONE', 'DRYING'],
  DONE: ['CLOSURE'], 
};

/**
 * Verifica si una transición es válida (previene saltarse pasos)
 */
export function canTransition(currentState: BatchState, nextState: BatchState): boolean {
  const allowed = validTransitions[currentState];
  return allowed ? allowed.includes(nextState) : false;
}

/**
 * Obtiene el tiempo sugerido de lavado (en minutos) según la categoría elegida,
 * reduciendo fricción y clicks para el usuario.
 */
export function getTimerPresetForCategory(category: ClothesCategory): number {
  switch (category) {
    case 'SOFT':
      return 45; // Ciclo delicado/normal
    case 'TECH':
      return 30; // Ciclo rápido para sintéticos
    case 'ARMOR':
      return 60; // Ciclo largo para toallas/jeans
    default:
      return 45;
  }
}
