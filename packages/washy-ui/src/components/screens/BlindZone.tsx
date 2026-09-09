import React, { useState, useEffect } from 'react';
import { Waves, BellRing } from 'lucide-react';

export function BlindZone({ timerMinutes, onNext, onUndo }) {
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60);
  const isFinished = timeLeft <= 0;

  // Simple countdown mock
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000); // Para test rápido, cuenta normal. En prod podríamos usar 10ms para debug
    return () => clearInterval(interval);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-4">
        <Waves size={56} className="mx-auto text-blue-400 animate-pulse" />
        <h2 className="text-3xl font-bold">En Lavadora</h2>
        <p className="text-neutral-400 text-lg">Regla de Oro: Solo 2 cucharadas de detergente.</p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center rounded-full border-8 border-neutral-800">
        <div className="text-5xl font-mono font-bold text-emerald-400">
          {mins}:{secs}
        </div>
      </div>

      <div className="w-full space-y-4">
        {isFinished ? (
          <div className="animate-in slide-in-from-bottom text-center space-y-6">
            <div className="flex justify-center text-rose-500 animate-bounce">
              <BellRing size={48} />
            </div>
            <h3 className="text-2xl font-bold text-white">¡Rescata tu ropa!</h3>
            <button onClick={onNext} className="w-full py-5 rounded-2xl text-xl font-bold bg-white text-neutral-900 active:scale-95 transition-all">
              Sacada de la lavadora
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => setTimeLeft(0)} className="w-full py-4 text-neutral-500 font-medium">
              (Debug: Forzar fin de timer)
            </button>
            <button onClick={onUndo} className="w-full py-4 text-neutral-500 font-medium active:scale-95 transition-all">
              Me equivoqué, deshacer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
