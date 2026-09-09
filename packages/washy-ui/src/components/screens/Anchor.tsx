import React from 'react';
import { Headphones, Coffee } from 'lucide-react';

export function Anchor({ onNext, onUndo }) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-4">
        <div className="flex justify-center gap-4 text-emerald-400">
          <Headphones size={56} />
          <Coffee size={56} />
        </div>
        <h2 className="text-3xl font-bold">El Ritual</h2>
        <p className="text-neutral-400 max-w-xs mx-auto text-lg leading-relaxed">
          Ponte tus audífonos, pon buena música y sírvete algo de tomar.<br/>
          <span className="text-white font-medium">Solo somos tú, la música y las fibras.</span>
        </p>
      </div>

      <div className="w-full space-y-4 pt-8">
        <button onClick={onNext} className="w-full py-5 rounded-2xl text-xl font-bold bg-emerald-500 text-neutral-900 active:scale-95 transition-all">
          Sí, estoy en la zona
        </button>
        <button onClick={onUndo} className="w-full py-4 text-neutral-500 font-medium active:scale-95 transition-all">
          Espera, volver atrás
        </button>
      </div>
    </div>
  );
}
