export type NaggingProfile = 'SOFT' | 'MEDIUM' | 'HARD';
export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface NaggingDecision {
  shouldNotify: boolean;
  repeatIntervalMins: number;
  severity: NotificationSeverity;
  title: string;
  body: string;
}

/**
 * Nagging Engine (Washy Core):
 * Determina la frecuencia, intensidad y microcopy de las alertas según el nivel de energía / perfil del usuario.
 */
export function getNaggingDecision(
  profile: NaggingProfile = 'MEDIUM',
  elapsedMinsSinceFinished: number = 0,
  notificationsSent: number = 0
): NaggingDecision {
  // 1. MODO SOFT: Empático, baja energía. 1 sola notificación y silencio absoluto.
  if (profile === 'SOFT') {
    if (notificationsSent >= 1) {
      return {
        shouldNotify: false,
        repeatIntervalMins: 0,
        severity: 'INFO',
        title: '🌸 Lavadora Lista',
        body: 'Tu ropa te espera cuando estés listo. Sin prisas hoy.',
      };
    }
    return {
      shouldNotify: true,
      repeatIntervalMins: 0,
      severity: 'INFO',
      title: '🌸 Lavadora Finalizada',
      body: 'Tu ropa terminó de lavarse. Ve a sacarla cuando tengas un momento.',
    };
  }

  // 2. MODO MEDIUM: Recordatorio periódico equilibrado (cada 45 minutos)
  if (profile === 'MEDIUM') {
    if (elapsedMinsSinceFinished >= 90 || notificationsSent >= 3) {
      return {
        shouldNotify: false,
        repeatIntervalMins: 45,
        severity: 'WARNING',
        title: '🌀 Ropa esperando',
        body: 'La ropa sigue en la lavadora. Tómate un tiempo para colgarla.',
      };
    }
    
    if (elapsedMinsSinceFinished >= 45) {
      return {
        shouldNotify: true,
        repeatIntervalMins: 45,
        severity: 'WARNING',
        title: '🚨 Recordatorio de Lavado',
        body: 'La ropa lleva 45 minutos húmeda en el tambor. Ve a sacarla para evitar olor.',
      };
    }

    return {
      shouldNotify: true,
      repeatIntervalMins: 45,
      severity: 'INFO',
      title: '✅ Lavadora Terminada',
      body: 'Ciclo completo. Tu ropa está lista para extenderse en el tendedero.',
    };
  }

  // 3. MODO HARD: Anti-Avoidance Asertivo. Alertas cada 15 minutos en riesgo de humedad.
  if (elapsedMinsSinceFinished >= 45) {
    return {
      shouldNotify: true,
      repeatIntervalMins: 15,
      severity: 'CRITICAL',
      title: '⚠️ PELIGRO: Olor a Humedad',
      body: 'Saca la ropa AHORA de la lavadora o tendrás que lavarla de nuevo.',
    };
  }

  if (elapsedMinsSinceFinished >= 15) {
    return {
      shouldNotify: true,
      repeatIntervalMins: 15,
      severity: 'WARNING',
      title: '🚨 Lavadora esperando',
      body: 'La ropa lleva 15 minutos mojada encerrada en la máquina.',
    };
  }

  return {
    shouldNotify: true,
    repeatIntervalMins: 15,
    severity: 'INFO',
    title: '🌀 Lavadora Lista',
    body: '¡La lavadora terminó! Ve a sacarla de inmediato.',
  };
}
