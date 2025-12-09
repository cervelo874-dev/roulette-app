import { useState } from 'react';
import RouletteCanvas from './components/RouletteCanvas';
import ConfigPanel from './components/ConfigPanel';
import { DEFAULT_SECTORS, type Sector } from './types';

function App() {
  const [sectors, setSectors] = useState<Sector[]>(DEFAULT_SECTORS);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Sector | null>(null);

  const handleStart = () => {
    if (sectors.length === 0) return;
    setWinner(null);
    setSpinning(true);
  };

  const handleFinished = (winningSector: Sector | null) => {
    setSpinning(false);
    setWinner(winningSector);
  };

  return (
    // Container: Fixed height (viewport) to enable internal scrolling
    <div className="h-[100dvh] bg-gray-100 flex flex-col md:flex-row font-sans overflow-hidden">

      {/* 
         Mobile Layout Strategy: Split View
         - Top: Roulette Preview using Main (order-1)
         - Bottom: Config Panel using Aside (order-2)
      */}

      {/* Main Content (Roulette Preview) */}
      <main className="order-1 md:order-2 flex-none md:flex-1 h-[45vh] md:h-full flex flex-col items-center justify-center p-2 md:p-4 relative bg-slate-50 shadow-md md:shadow-none z-10">

        <div className="scale-75 md:scale-100 transition-transform">
          <RouletteCanvas
            sectors={sectors}
            spinning={spinning}
            onFinished={handleFinished}
          />
        </div>

        <div className="flex flex-col items-center gap-2 md:gap-4 z-10 absolute bottom-4 md:static md:mt-8">
          {/* Start Button - Compact on mobile */}
          <button
            onClick={handleStart}
            disabled={spinning || sectors.length === 0}
            className={`
              px-8 py-2 md:px-12 md:py-4 rounded-full text-xl md:text-2xl font-bold shadow-lg transition transform active:scale-95
              ${spinning
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-xl hover:-translate-y-1'
              }
            `}
          >
            {spinning ? 'Spinning...' : 'START'}
          </button>

          {winner && !spinning && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:static md:transform-none md:mt-8 p-4 md:p-6 bg-white rounded-xl shadow-2xl text-center animate-bounce-short border-2 border-yellow-400 min-w-[200px]">
              <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-1">Result</p>
              <div className="text-2xl md:text-3xl font-extrabold text-gray-800">
                {winner.type === 'text' ? winner.value : 'Image Selected!'}
              </div>
              {winner.type === 'image' && winner.value && (
                <img src={winner.value} alt="Winner" className="w-24 h-24 md:w-32 md:h-32 object-contain mt-2 mx-auto rounded-lg border" />
              )}
            </div>
          )}
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 md:w-64 md:h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-10 w-32 h-32 md:w-64 md:h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-32 h-32 md:w-64 md:h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </main>

      {/* Sidebar / Config Panel (Scrollable Area) */}
      <aside className="order-2 md:order-1 flex-1 md:w-96 border-r border-gray-200 overflow-y-auto bg-white z-20">
        <ConfigPanel sectors={sectors} onUpdate={setSectors} />
      </aside>

    </div>
  );
}

export default App;
