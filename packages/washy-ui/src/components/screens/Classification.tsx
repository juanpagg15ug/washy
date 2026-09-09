import React, { useState, useEffect } from 'react';
import { Cloud, Zap, Shield, HelpCircle, BookOpen } from 'lucide-react';
import { db } from '../../shared/lib/db';
import { garments, categories } from 'washy-core/src/db/schema';
import { eq } from 'drizzle-orm';

export function Classification({ onNext, onUndo }) {
  const [showHelp, setShowHelp] = useState(false);
  const [dictionary, setDictionary] = useState([]);

  useEffect(() => {
    async function loadDictionary() {
      try {
        // En un caso real, esto cruzaría garments con categories
        // const items = await db.select().from(garments).leftJoin(categories, eq(garments.categoryId, categories.id));
        // Pero para el prototipo/mock simplificado:
        const items = await db.select().from(garments);
        setDictionary(items || []);
      } catch (err) {
        console.error("Error loading dictionary:", err);
      }
    }
    if (showHelp) {
      loadDictionary();
    }
  }, [showHelp]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-2 mt-4">
        <h2 className="text-3xl font-bold">Clasificación</h2>
        <p className="text-neutral-400">Separa tus prendas. Elige la categoría de esta tanda.</p>
      </div>

      {showHelp ? (
        <div className="flex-1 bg-neutral-800 rounded-3xl p-6 flex flex-col space-y-6 overflow-y-auto">
          <div className="text-center">
            <h3 className="text-xl font-bold text-emerald-400">¿Dudas? Guía rápida:</h3>
            <p className="text-sm mt-2">¿Estira mucho o es sintético? ➔ <strong>Tech</strong></p>
            <p className="text-sm">¿Es pesado o rasposo? ➔ <strong>Armor</strong></p>
            <p className="text-sm">¿Algodón, lino, suave? ➔ <strong>Soft</strong></p>
          </div>
          
          <div className="pt-4 border-t border-neutral-700">
            <h4 className="text-lg font-semibold flex items-center gap-2 mb-3 text-neutral-300">
              <BookOpen size={18} /> Diccionario Personal
            </h4>
            
            {dictionary.length > 0 ? (
              <div className="space-y-2">
                {dictionary.map((item: any, i) => (
                  <div key={item.id || i} className="flex justify-between p-3 bg-neutral-700 rounded-lg text-sm">
                    <span>{item.metadata?.name || 'Prenda ' + (i+1)}</span>
                    <span className="text-emerald-400 font-bold">{item.categoryId?.replace('cat-', '').toUpperCase()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm italic text-center py-2">
                Tu diccionario está vacío. Las prendas que guardes aparecerán aquí.
              </p>
            )}
          </div>
          
          <div className="pt-4 border-t border-neutral-700 text-center">
            <p className="text-neutral-400 mb-4 text-sm">Si aún tienes duda y miedo a arruinarla:</p>
            <button onClick={() => onNext('SOFT')} className="w-full py-4 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/50">
              Usar Default Seguro (Agua fría, delicado)
            </button>
          </div>
          
          <button onClick={() => setShowHelp(false)} className="py-4 text-neutral-400 mt-auto text-center">
            Cerrar guía
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center gap-4">
          <button onClick={() => onNext('SOFT')} className="flex items-center gap-6 p-6 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all">
            <div className="p-4 rounded-full bg-blue-500/20 text-blue-400">
              <Cloud size={32} />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold">Soft & Personal</h3>
              <p className="text-neutral-400">Algodones, ropa interior, linos.</p>
            </div>
          </button>

          <button onClick={() => onNext('TECH')} className="flex items-center gap-6 p-6 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all">
            <div className="p-4 rounded-full bg-amber-500/20 text-amber-400">
              <Zap size={32} />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold">Performance & Tech</h3>
              <p className="text-neutral-400">Sintéticos, gym, elásticos. (Sin suavizante)</p>
            </div>
          </button>

          <button onClick={() => onNext('ARMOR')} className="flex items-center gap-6 p-6 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all">
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400">
              <Shield size={32} />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold">Armor & Home</h3>
              <p className="text-neutral-400">Jeans, toallas, sábanas, pesados.</p>
            </div>
          </button>
        </div>
      )}

      {!showHelp && (
        <div className="flex justify-between items-center pt-4">
          <button onClick={onUndo} className="px-6 py-4 text-neutral-500 font-medium">
            Atrás
          </button>
          <button onClick={() => setShowHelp(true)} className="flex items-center gap-2 px-6 py-4 text-emerald-400 font-medium">
            <HelpCircle size={20} />
            ¿Dudas?
          </button>
        </div>
      )}
    </div>
  );
}
