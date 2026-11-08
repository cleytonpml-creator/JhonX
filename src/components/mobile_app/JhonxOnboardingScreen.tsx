import React, { useState } from 'react';
import { sounds } from '../../utils/audio';
import { Badge, Check, Train, Sparkles } from 'lucide-react';

interface JhonxOnboardingScreenProps {
  onComplete: (explorerName: string, routeId: number) => void;
  initialName?: string;
  initialRoute?: number;
}

interface StationRoute {
  id: number;
  title: string;
  subtitle: string;
  borderColor: string;
}

const STATIONS: StationRoute[] = [
  {
    id: 1,
    title: 'ROUTE 1 • Phonics Pioneer',
    subtitle: 'Ages 3-4 • Letter sounds & rhymes 🚀',
    borderColor: '#ffaa00', // Laranja
  },
  {
    id: 2,
    title: 'ROUTE 2 • Word Explorer',
    subtitle: 'Ages 5-6 • Blending short words 🎒',
    borderColor: '#00e5ff', // Azul
  },
  {
    id: 3,
    title: 'ROUTE 3 • Story Teller',
    subtitle: 'Ages 7-8 • AI custom stories 🏆',
    borderColor: '#00ff66', // Verde
  },
];

export const JhonxOnboardingScreen: React.FC<JhonxOnboardingScreenProps> = ({
  onComplete,
  initialName = '',
  initialRoute = 0,
}) => {
  const [name, setName] = useState<string>(initialName);
  const [selectedRoute, setSelectedRoute] = useState<number>(initialRoute);
  const [snackBar, setSnackBar] = useState<{ message: string; color: string; textColor?: string } | null>(null);

  const showSnackBar = (message: string, color: string, textColor: string = 'text-white') => {
    setSnackBar({ message, color, textColor });
    setTimeout(() => {
      setSnackBar(null);
    }, 2800);
  };

  const handleStartAdventure = () => {
    sounds.playTap();
    const trimmed = name.trim();

    if (!trimmed) {
      sounds.playTap();
      showSnackBar('Please enter your name explorer! 👤🎒', '#ff0055');
      return;
    }

    if (selectedRoute === 0) {
      sounds.playTap();
      showSnackBar('Choose your Underground Station to catch the train! 🚇', '#ffaa00');
      return;
    }

    // Success flow
    sounds.playBusHorn();
    sounds.playSuccess();
    showSnackBar(`Welcome aboard, ${trimmed}! Next stop: London! 🎫🇬🇧`, '#00ff66', 'text-black');

    setTimeout(() => {
      onComplete(trimmed, selectedRoute);
    }, 1200);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#121212] text-white select-none overflow-y-auto font-sans">
      <div className="p-6 flex-1 flex flex-col justify-between max-w-sm mx-auto w-full">
        <div className="space-y-6">
          <div className="pt-2 text-center">
            {/* LOGO E BOAS-VINDAS */}
            <h1
              className="text-5xl font-black text-[#ff0055] tracking-widest leading-none select-none"
              style={{
                textShadow: '0 0 20px rgba(255, 0, 85, 0.7)',
                letterSpacing: '3px',
              }}
            >
              JHONX
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              London Phonics Adventure
            </p>
          </div>

          {/* CAIXA DE TEXTO DO NOME (Estilizada como Placa de Rua) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#00e5ff] tracking-wider uppercase font-mono">
              WHAT'S YOUR NAME, EXPLORER?
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#00e5ff] pointer-events-none">
                <Badge className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name here..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#1e1e1e] border-2 border-[#333333] focus:border-[#00e5ff] rounded-2xl text-base font-bold text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* SELEÇÃO DE IDADE (As Estações de Metrô) */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">
              CHOOSE YOUR UNDERGROUND STATION:
            </span>

            <div className="space-y-2.5">
              {STATIONS.map((station) => {
                const isSelected = selectedRoute === station.id;
                return (
                  <div
                    key={station.id}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedRoute(station.id);
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3.5 transform active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#1e1e1e]'
                        : 'bg-black/30 border-[#333333] hover:border-slate-700'
                    }`}
                    style={{
                      borderColor: isSelected ? station.borderColor : '#333333',
                      borderWidth: isSelected ? '3px' : '2px',
                      boxShadow: isSelected
                        ? `0 0 15px ${station.borderColor}30`
                        : 'none',
                    }}
                  >
                    <Train
                      className="w-7 h-7 shrink-0 transition-colors"
                      style={{ color: isSelected ? station.borderColor : '#9ca3af' }}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold truncate ${
                          isSelected ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {station.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">
                        {station.subtitle}
                      </p>
                    </div>

                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{
                        borderColor: isSelected ? station.borderColor : '#6b7280',
                        backgroundColor: isSelected ? station.borderColor : 'transparent',
                      }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-black stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTÃO GRANDE DE INICIAR A JORNADA */}
        <div className="pt-6 pb-2">
          <button
            onClick={handleStartAdventure}
            className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-all duration-150 transform active:scale-95 cursor-pointer tracking-wider"
            style={{
              backgroundColor: '#ff0055',
              boxShadow: '0 8px 25px rgba(255, 0, 85, 0.45)',
            }}
          >
            LET'S GO! 🚌💨
          </button>
        </div>
      </div>

      {/* Flutter ScaffoldMessenger SnackBar Simulation */}
      {snackBar && (
        <div className="absolute bottom-5 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`p-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-2 border border-white/10 ${snackBar.textColor}`}
            style={{ backgroundColor: snackBar.color }}
          >
            <span className="text-xs font-bold tracking-tight">
              {snackBar.message}
            </span>
            <button
              onClick={() => setSnackBar(null)}
              className="text-black/70 hover:text-black font-bold text-xs p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
