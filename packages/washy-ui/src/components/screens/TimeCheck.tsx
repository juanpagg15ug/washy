import React, { useState } from 'react';
import { Sun, CheckCircle, Flame } from 'lucide-react';

export function TimeCheck({ onNext, onAbort }) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-4">
        <Sun size={64} className="mx-auto text-amber-400" />
        <h2 className="text-3xl font-bold">¿Cuánta energía tienes hoy?</h2>
        <p className="text-neutral-400 max-w-xs mx-auto">
          Sé honesto contigo mismo. No hay respuestas incorrectas.
        </p>
      </div>

      <div className="w-full space-y-4">
        <button onClick={onNext} className="w-full py-5 rounded-2xl text-lg font-bold bg-white text-neutral-900 active:scale-95 transition-all">
          Alta (¡Vamos con todo!)
        </button>
        <button onClick={onNext} className="w-full py-5 rounded-2xl text-lg font-bold bg-neutral-800 text-white active:scale-95 transition-all">
          Media (Lo justo y necesario)
        </button>
        <button onClick={onAbort} className="w-full py-5 rounded-2xl text-lg font-bold bg-neutral-800 text-rose-400 border border-rose-500/20 active:scale-95 transition-all">
          Baja (Guardar en backlog)
        </button>
      </div>
    </div>
  );
}
