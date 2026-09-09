import { LaundryBatch, BatchState } from '../state-machine/fsm';

export const MAX_WIP_LIMIT = 2;

/**
 * Gestor de Kanban Personal (WIP Limits)
 * Evalúa cuántas tandas activas hay para prevenir sobrecarga cognitiva.
 */
export function getActiveWipCount(batches: LaundryBatch[]): number {
  const activeStates: BatchState[] = [
    'TIME_CHECK',
    'ANCHOR',
    'CLASSIFICATION',
    'WASHING',
    'DRYING',
    'CLOSURE',
  ];

  return batches.filter(batch => activeStates.includes(batch.state)).length;
}

export function canStartNewBatch(batches: LaundryBatch[]): boolean {
  return getActiveWipCount(batches) < MAX_WIP_LIMIT;
}

/**
 * Crea una intención "ciega" en el backlog. Cero detalles, cero fricción.
 */
export function createBlindImpulse(): Omit<LaundryBatch, 'id'> {
  const now = new Date();
  return {
    state: 'BACKLOG',
    createdAt: now,
    updatedAt: now,
  };
}
