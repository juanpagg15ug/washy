import React, { useState, useEffect } from 'react';
import { Sun, Moon, AlertTriangle, Plus } from 'lucide-react';
import { TimeCheck } from './components/screens/TimeCheck';
import { Anchor } from './components/screens/Anchor';
import { Classification } from './components/screens/Classification';
import { BlindZone } from './components/screens/BlindZone';
import { Drying } from './components/screens/Drying';
import { Closure } from './components/screens/Closure';
import { Soaking } from './components/screens/Soaking';

// Mocking the Core Semaphore
function checkSemaphore() {
  const currentHour = new Date().getHours();
  const remaining = 18 - currentHour;
  if (remaining >= 4) return { color: 'GREEN', message: 'Óptimo. Tienes sol suficiente para secar la ropa.' };
  if (remaining >= 2) return { color: 'YELLOW', message: 'Precaución. Queda poco sol.' };
  return { color: 'RED', message: 'Muy tarde. Solo remojo nocturno.' };
}

export default function App() {
  const [semaphore, setSemaphore] = useState(checkSemaphore());
  const [backlogCount, setBacklogCount] = useState(0);
  const [wipCount, setWipCount] = useState(0);
  
  // UI FSM State
  const [currentScreen, setCurrentScreen] = useState('DASHBOARD');
  const [currentCategory, setCurrentCategory] = useState('SOFT');

  useEffect(() => {
    const timer = setInterval(() => setSemaphore(checkSemaphore()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleBlindCapture = () => {
    setBacklogCount(prev => prev + 1);
  };

  const bgColor = 
    semaphore.color === 'GREEN' ? 'bg-emerald-500' : 
    semaphore.color === 'YELLOW' ? 'bg-amber-400' : 'bg-rose-500';

  return (
    <div className="min-h-[100dvh] bg-neutral-900 text-white font-sans flex flex-col selection:bg-emerald-500/30">
      
      <header className="p-6 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold tracking-tight text-neutral-200" onClick={() => setCurrentScreen('DASHBOARD')}>Washy</h1>
        <div className="flex gap-4 text-xs font-medium text-neutral-500">
          <div>Backlog: <span className="text-white">{backlogCount}</span></div>
          <div>WIP: <span className="text-white">{wipCount}/2</span></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 pb-8 max-w-md mx-auto w-full relative">
        
        {currentScreen === 'DASHBOARD' && (
          <div className="flex-1 flex flex-col justify-center space-y-12 animate-in fade-in">
            <div className="text-center space-y-6">
              <div className={`inline-flex p-6 rounded-full ${bgColor} text-neutral-900 shadow-[0_0_60px_rgba(0,0,0,0.2)] shadow-${bgColor}/20`}>
                {semaphore.color === 'GREEN' && <Sun size={56} />}
                {semaphore.color === 'YELLOW' && <AlertTriangle size={56} />}
                {semaphore.color === 'RED' && <Moon size={56} />}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-3">
                  {semaphore.color === 'GREEN' ? 'Luz Verde' : 
                   semaphore.color === 'YELLOW' ? 'Precaución' : 'Luz Roja'}
                </h2>
                <p className="text-neutral-400 leading-relaxed max-w-xs mx-auto">
                  {semaphore.message}
                </p>
              </div>
            </div>

            <div className="w-full space-y-4">
              <button 
                onClick={() => setCurrentScreen('TIME_CHECK')}
                disabled={wipCount >= 2}
                className={`w-full py-5 rounded-2xl text-xl font-bold transition-all
                  ${wipCount >= 2
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                    : semaphore.color === 'RED'
                      ? 'bg-blue-500 text-neutral-900 hover:scale-[1.02] active:scale-95'
                      : 'bg-white text-neutral-900 hover:scale-[1.02] active:scale-95'}`}
              >
                {semaphore.color === 'RED' ? 'Iniciar Remojo Nocturno' : 'Iniciar Ritual'}
              </button>
              
              <button 
                onClick={handleBlindCapture}
                className="w-full py-5 rounded-2xl text-lg font-bold bg-neutral-800 text-white active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={24} />
                Quiero lavar (Backlog)
              </button>
            </div>
          </div>
        )}

        {currentScreen === 'TIME_CHECK' && (
          <TimeCheck 
            onNext={() => setCurrentScreen('ANCHOR')}
            onAbort={() => { handleBlindCapture(); setCurrentScreen('DASHBOARD'); }}
          />
        )}

        {currentScreen === 'ANCHOR' && (
          <Anchor 
            onNext={() => setCurrentScreen('CLASSIFICATION')}
            onUndo={() => setCurrentScreen('DASHBOARD')}
          />
        )}

        {currentScreen === 'CLASSIFICATION' && (
          <Classification 
            onNext={(category) => {
              setCurrentCategory(category);
              setWipCount(prev => prev + 1); // WIP + 1
              if (semaphore.color === 'RED') {
                setCurrentScreen('SOAKING');
              } else {
                setCurrentScreen('WASHING');
              }
            }}
            onUndo={() => setCurrentScreen('ANCHOR')}
          />
        )}

        {currentScreen === 'SOAKING' && (
          <Soaking 
            onNext={() => setCurrentScreen('DASHBOARD')} // Pausa hasta el día siguiente
            onUndo={() => {
              setWipCount(prev => prev - 1);
              setCurrentScreen('CLASSIFICATION');
            }}
          />
        )}

        {currentScreen === 'WASHING' && (
          <BlindZone 
            timerMinutes={currentCategory === 'TECH' ? 30 : currentCategory === 'ARMOR' ? 60 : 45}
            onNext={() => setCurrentScreen('DRYING')}
            onUndo={() => {
              setWipCount(prev => prev - 1);
              setCurrentScreen('CLASSIFICATION');
            }}
          />
        )}

        {currentScreen === 'DRYING' && (
          <Drying 
            onNext={() => setCurrentScreen('CLOSURE')}
            onUndo={() => setCurrentScreen('WASHING')}
          />
        )}

        {currentScreen === 'CLOSURE' && (
          <Closure 
            onNext={(level) => {
              console.log('Terminado con nivel:', level);
              setWipCount(prev => prev - 1); // Liberar WIP
              setCurrentScreen('DASHBOARD');
            }}
          />
        )}

      </main>
    </div>
  );
}
