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
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar / Config Panel */}
      <aside className="order-2 md:order-1 w-full md:w-96 border-r border-gray-200 md:h-screen overflow-y-auto flex-shrink-0 bg-white z-20 pb-10 md:pb-0">
        <ConfigPanel sectors={sectors} onUpdate={setSectors} />
      </aside>

      {/* Main Content */}
      <main className="order-1 md:order-2 flex-1 flex flex-col items-center justify-center p-4 relative bg-slate-50 min-h-[50vh] md:h-screen md:overflow-hidden">

        <div className="mb-8">
          <RouletteCanvas
            sectors={sectors}
            spinning={spinning}
            onFinished={handleFinished}
          />
        </div>

        <div className="flex flex-col items-center gap-4 z-10">
          <button
            onClick={handleStart}
            disabled={spinning || sectors.length === 0}
            className={`
              px-12 py-4 rounded-full text-2xl font-bold shadow-lg transition transform active:scale-95
              ${spinning
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-xl hover:-translate-y-1'
              }
            `}
          >
            {spinning ? 'Spinning...' : 'START'}
          </button>

          {winner && !spinning && (
            <div className="mt-8 p-6 bg-white rounded-xl shadow-2xl text-center animate-bounce-short border-2 border-yellow-400">
              <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-1">Result</p>
              <div className="text-3xl font-extrabold text-gray-800">
                {winner.type === 'text' ? winner.value : 'Image Selected!'}
              </div>
              {winner.type === 'image' && (
                <img src={winner.value} alt="Winner" className="w-32 h-32 object-contain mt-2 mx-auto rounded-lg border" />
              )}
            </div>
          )}
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </main>
    </div>
  );
}

export default App;
