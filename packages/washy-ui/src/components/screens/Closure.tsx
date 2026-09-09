import React from 'react';
import { Package, Inbox, Archive } from 'lucide-react';

export function Closure({ onNext }) {
  return (
    <div className="flex flex-col h-full space-y-6 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-2 mt-4">
        <h2 className="text-3xl font-bold">Cierre (Elastic Habits)</h2>
        <p className="text-neutral-400">El paso más difícil. Elige tu nivel de cierre hoy:</p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <button onClick={() => onNext('MINI')} className="flex items-center gap-6 p-6 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all">
          <div className="p-4 rounded-full bg-blue-500/20 text-blue-400">
            <Package size={32} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold">Mini</h3>
            <p className="text-neutral-400">Dejar limpia en la silla (Sin culpa).</p>
          </div>
        </button>

        <button onClick={() => onNext('PLUS')} className="flex items-center gap-6 p-6 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all">
          <div className="p-4 rounded-full bg-amber-500/20 text-amber-400">
            <Inbox size={32} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold">Plus</h3>
            <p className="text-neutral-400">Doblar rápido lo urgente.</p>
          </div>
        </button>

        <button onClick={() => onNext('ELITE')} className="flex items-center gap-6 p-6 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all">
          <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400">
            <Archive size={32} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold">Elite</h3>
            <p className="text-neutral-400">Guardado vertical perfecto en el clóset.</p>
          </div>
        </button>
      </div>
    </div>
  );
}
