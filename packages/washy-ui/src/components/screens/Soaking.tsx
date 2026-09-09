import React from 'react';
import { Droplets } from 'lucide-react';

export function Soaking({ onNext, onUndo }) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-6">
        <Droplets size={64} className="mx-auto text-blue-500 animate-pulse" />
        <h2 className="text-3xl font-bold">Remojo Nocturno</h2>
        <div className="bg-neutral-800 rounded-3xl p-6 max-w-sm mx-auto text-left space-y-4">
          <p className="text-lg font-medium">Es tarde para secar.</p>
          <p className="text-neutral-400">
            Deja la ropa remojando en la lavadora o en un balde con jabón. Mañana en la mañana solo tendrás que presionar el botón de lavado.
          </p>
        </div>
      </div>

      <div className="w-full space-y-4">
        <button onClick={onNext} className="w-full py-5 rounded-2xl text-xl font-bold bg-blue-500 text-neutral-900 active:scale-95 transition-all">
          Ropa en Remojo (Pausar)
        </button>
        <button onClick={onUndo} className="w-full py-4 text-neutral-500 font-medium active:scale-95 transition-all">
          Deshacer
        </button>
      </div>
    </div>
  );
}
