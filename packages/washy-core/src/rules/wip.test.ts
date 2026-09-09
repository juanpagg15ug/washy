import { describe, it, expect } from 'vitest';
import { getActiveWipCount, canStartNewBatch, MAX_WIP_LIMIT } from './wip';
import { LaundryBatch } from '../state-machine/fsm';

describe('Gestor de WIP (Kanban Personal)', () => {
  const createMockBatch = (state: LaundryBatch['state']): LaundryBatch => ({
    id: 'test-uuid',
    state,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  it('No debería contar las tandas en BACKLOG o DONE como WIP', () => {
    const batches = [
      createMockBatch('BACKLOG'),
      createMockBatch('DONE'),
      createMockBatch('BACKLOG')
    ];
    expect(getActiveWipCount(batches)).toBe(0);
    expect(canStartNewBatch(batches)).toBe(true);
  });

  it('Debería bloquear nuevas tandas si el WIP llega al límite', () => {
    const batches = [
      createMockBatch('WASHING'),
      createMockBatch('DRYING')
    ];
    expect(getActiveWipCount(batches)).toBe(MAX_WIP_LIMIT); // 2
    expect(canStartNewBatch(batches)).toBe(false); // Bloqueado
  });
});
