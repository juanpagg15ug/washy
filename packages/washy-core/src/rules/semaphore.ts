export type SemaphoreColor = 'GREEN' | 'YELLOW' | 'RED';

export interface SemaphoreStatus {
  color: SemaphoreColor;
  sunlightHoursRemaining: number;
  message: string;
}

/**
 * Módulo Semáforo:
 * Evalúa si es viable iniciar una nueva tanda basándose en las horas de sol restantes.
 * Asume un atardecer promedio (ej. 18:30) si no se provee por geolocalización.
 */
export function checkSemaphore(
  currentDate: Date = new Date(),
  sunsetHour: number = 18.5 // 18:30
): SemaphoreStatus {
  const currentHour = currentDate.getHours() + currentDate.getMinutes() / 60;
  const remainingHours = sunsetHour - currentHour;

  if (remainingHours >= 4) {
    return {
      color: 'GREEN',
      sunlightHoursRemaining: remainingHours,
      message: 'Óptimo. Tienes sol suficiente para secar la ropa.',
    };
  }

  if (remainingHours >= 2) {
    return {
      color: 'YELLOW',
      sunlightHoursRemaining: remainingHours,
      message: 'Precaución. Queda poco sol, riesgo de humedad nocturna.',
    };
  }

  return {
    color: 'RED',
    sunlightHoursRemaining: remainingHours > 0 ? remainingHours : 0,
    message: 'Muy tarde. Bloqueo de lavado normal. Guardar para mañana o Remojo Nocturno.',
  };
}
