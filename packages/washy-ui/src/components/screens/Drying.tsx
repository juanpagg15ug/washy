import React from 'react';
import { Wind } from 'lucide-react';

export function Drying({ onNext, onUndo }) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-6">
        <Wind size={64} className="mx-auto text-cyan-400" />
        <h2 className="text-3xl font-bold">A Secar</h2>
        <div className="bg-neutral-800 rounded-3xl p-6 max-w-sm mx-auto text-left space-y-4">
          <p className="text-lg font-medium">Instrucciones clave:</p>
          <ul className="space-y-2 text-neutral-300">
            <li>1. Colgar del revés (protege color).</li>
            <li>2. Sacudida técnica (cero arrugas).</li>
          </ul>
        </div>
      </div>

      <div className="w-full space-y-4">
        <button onClick={onNext} className="w-full py-5 rounded-2xl text-xl font-bold bg-cyan-500 text-neutral-900 active:scale-95 transition-all">
          Ropa colgada
        </button>
        <button onClick={onUndo} className="w-full py-4 text-neutral-500 font-medium active:scale-95 transition-all">
          Deshacer
        </button>
      </div>
    </div>
  );
}
