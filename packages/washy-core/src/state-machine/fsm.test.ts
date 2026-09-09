import { describe, it, expect } from 'vitest';
import { canTransition } from './fsm';

describe('Washy FSM (Finite State Machine)', () => {
  it('Debería permitir avanzar del BACKLOG al TIME_CHECK', () => {
    expect(canTransition('BACKLOG', 'TIME_CHECK')).toBe(true);
  });

  it('Debería bloquear un salto directo de BACKLOG a WASHING (prevenir saltarse pasos)', () => {
    expect(canTransition('BACKLOG', 'WASHING')).toBe(false);
  });

  it('Debería permitir hacer Undo (Deshacer) de WASHING a CLASSIFICATION', () => {
    expect(canTransition('WASHING', 'CLASSIFICATION')).toBe(true);
  });

  it('Debería soportar la transición de Remojo Nocturno (SOAKING)', () => {
    // Del triage se puede ir a remojo
    expect(canTransition('CLASSIFICATION', 'SOAKING')).toBe(true);
    // Del remojo se debe poder pasar a lavar al día siguiente
    expect(canTransition('SOAKING', 'WASHING')).toBe(true);
  });
});
