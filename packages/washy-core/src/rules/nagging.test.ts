import { describe, it, expect } from 'vitest';
import { getNaggingDecision } from './nagging';

describe('Nagging Engine (Washy Core)', () => {
  it('respeta el perfil SOFT enviando solo 1 notificación empática y silenciando después', () => {
    const decision1 = getNaggingDecision('SOFT', 0, 0);
    expect(decision1.shouldNotify).toBe(true);
    expect(decision1.title).toContain('🌸');

    const decision2 = getNaggingDecision('SOFT', 60, 1);
    expect(decision2.shouldNotify).toBe(false);
  });

  it('el perfil MEDIUM envía recordatorios equilibrados a los 0 y 45 minutos', () => {
    const initial = getNaggingDecision('MEDIUM', 0, 0);
    expect(initial.shouldNotify).toBe(true);
    expect(initial.severity).toBe('INFO');

    const warning = getNaggingDecision('MEDIUM', 45, 1);
    expect(warning.shouldNotify).toBe(true);
    expect(warning.severity).toBe('WARNING');
    expect(warning.repeatIntervalMins).toBe(45);
  });

  it('el perfil HARD escala la urgencia a CRÍTICA a los 45 minutos si la ropa sigue mojada', () => {
    const critical = getNaggingDecision('HARD', 45, 2);
    expect(critical.shouldNotify).toBe(true);
    expect(critical.severity).toBe('CRITICAL');
    expect(critical.title).toContain('⚠️ PELIGRO');
    expect(critical.repeatIntervalMins).toBe(15);
  });
});
