export type SemaphoreColor = 'GREEN' | 'YELLOW' | 'RED';

export interface SemaphoreStatus {
  color: SemaphoreColor;
  sunlightHoursRemaining: number;
  finishTimeString: string;
  message: string;
}

/**
 * Módulo Semáforo (Washy Core):
 * Evalúa si es viable iniciar una nueva tanda basándose en las horas de sol restantes y tiempo de secado estimados.
 * Calcula la hora exacta de finalización de secado en formato de reloj de 12 horas.
 */
export function checkSemaphore(
  currentDate: Date = new Date(),
  sunsetHour: number = 18,
  dryingHours: number = 4
): SemaphoreStatus {
  const currentHourDecimal = currentDate.getHours() + currentDate.getMinutes() / 60;
  const remainingHours = sunsetHour - currentHourDecimal;

  const finishDate = new Date(currentDate.getTime() + dryingHours * 60 * 60 * 1000);
  const finishTimeString = finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (remainingHours >= dryingHours) {
    return {
      color: 'GREEN',
      sunlightHoursRemaining: Math.max(0, remainingHours),
      finishTimeString,
      message: `☀️ Clima Óptimo. Si lavas AHORA, tu ropa estará seca a las ${finishTimeString} (a tiempo antes del atardecer ~${sunsetHour}:00).`,
    };
  }

  if (remainingHours >= (dryingHours / 2) && remainingHours > 0) {
    return {
      color: 'YELLOW',
      sunlightHoursRemaining: remainingHours,
      finishTimeString,
      message: `⚠️ Queda poco sol. Si lavas AHORA, terminarías a las ${finishTimeString} (cerca del atardecer ~${sunsetHour}:00).`,
    };
  }

  return {
    color: 'RED',
    sunlightHoursRemaining: remainingHours > 0 ? remainingHours : 0,
    finishTimeString,
    message: `🌙 Muy tarde para secar afuera. Terminarías a las ${finishTimeString} (después del sol). Solo secado interior o remojo nocturno.`,
  };
}
