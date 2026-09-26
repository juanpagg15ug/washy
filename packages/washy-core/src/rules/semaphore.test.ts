import { describe, it, expect } from 'vitest';
import { checkSemaphore } from './semaphore';

describe('checkSemaphore (Washy Core)', () => {
  it('retorna VERDE si hay suficiente sol antes del atardecer', () => {
    // 10:00 AM, atardecer 18:00 (8 horas restantes, requiere 4h)
    const testDate = new Date('2026-09-26T10:00:00');
    const result = checkSemaphore(testDate, 18, 4);

    expect(result.color).toBe('GREEN');
    expect(result.message).toContain('☀️ Clima Óptimo');
    expect(result.finishTimeString).toBeDefined();
  });

  it('retorna AMARILLO si queda poco sol pero aún se puede secar parcialmente', () => {
    // 15:00 PM, atardecer 18:00 (3 horas restantes, requiere 4h)
    const testDate = new Date('2026-09-26T15:00:00');
    const result = checkSemaphore(testDate, 18, 4);

    expect(result.color).toBe('YELLOW');
    expect(result.message).toContain('⚠️ Queda poco sol');
  });

  it('retorna ROJO si se intenta lavar de noche o pasado el atardecer', () => {
    // 19:00 PM, atardecer 18:00
    const testDate = new Date('2026-09-26T19:00:00');
    const result = checkSemaphore(testDate, 18, 4);

    expect(result.color).toBe('RED');
    expect(result.message).toContain('🌙 Muy tarde');
  });
});
