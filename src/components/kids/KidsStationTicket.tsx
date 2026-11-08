import React, { useState } from 'react';
import { sounds } from '../../utils/audio';
import { Train, Check, Sparkles, User, ArrowLeft, Ticket } from 'lucide-react';

interface KidsStationTicketProps {
  explorerName: string;
  selectedRoute: number;
  onUpdateExplorer: (name: string, routeId: number) => void;
  onBackToGame: () => void;
}

interface StationRoute {
  id: number;
  line: string;
  title: string;
  age: string;
  description: string;
  accentColor: string;
  badge: string;
}

const TUBE_ROUTES: StationRoute[] = [
  {
    id: 1,
    line: 'Bakerloo Line (Brown)',
    title: 'ROUTE 1 · Phonics Pioneer',
    age: 'Ages 3 to 4',
    description: 'First letter sounds (SATPIN) with lively British rhymes! 🧸',
    accentColor: '#ffaa00',
    badge: '🦁 EASY',
  },
  {
    id: 2,
    line: 'Northern Line (Camden & Soho)',
    title: 'ROUTE 2 · Word Explorer',
    age: 'Ages 5 to 6',
    description: 'Blending sounds to read words like CAT, DOG and BUS! 🛹',
    accentColor: '#00e5ff',
    badge: '⚡ RECOMMENDED',
  },
  {
    id: 3,
    line: 'Piccadilly Line (Royal Blue)',
    title: 'ROUTE 3 · Storyteller',
    age: 'Ages 7 to 8',
    description: 'Full sentences and urban adventures through London streets! 🏰',
    accentColor: '#00ff66',
    badge: '🏆 ADVANCED',
  },
];

const AVATAR_OPTIONS = ['🦁', '🦊', '🐶', '🐼', '🤖', '👑', '🚀', '🛹'];

export const KidsStationTicket: React.FC<KidsStationTicketProps> = ({
  explorerName,
  selectedRoute,
  onUpdateExplorer,
  onBackToGame,
}) => {
  const [name, setName] = useState<string>(explorerName || 'Alex');
  const [currentRoute, setCurrentRoute] = useState<number>(selectedRoute || 2);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🐶');
  const [snackBar, setSnackBar] = useState<string | null>(null);

  const handleSaveAndBoard = () => {
    sounds.playTap();
    const cleanName = name.trim();

    if (!cleanName) {
      sounds.playTap();
      setSnackBar('Please enter your explorer name! 🎒');
      setTimeout(() => setSnackBar(null), 2500);
      return;
    }

    sounds.playBusHorn();
    sounds.playCorrectWord();
    sounds.speakBritish(`Welcome aboard the London Underground, explorer ${cleanName}! Next stop Camden Town! Mind the gap!`);

    onUpdateExplorer(cleanName, currentRoute);
    setSnackBar(`🎫 Ticket Issued! Welcome aboard, ${cleanName}! Mind the gap!`);

    setTimeout(() => {
      onBackToGame();
    }, 1200);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-x-hidden select-none font-['Fredoka'] p-4 md:p-8">
      {/* MAGICAL LONDON BACKDROP: Underground Station */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/src/assets/images/cartoon_london_backdrop_1793964364409.jpg"
          alt="London City Background"
          className="w-full h-full object-cover object-center opacity-25 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full space-y-6">
        {/* STATION HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/10 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border-3 border-amber-400 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playTap();
                onBackToGame();
              }}
              className="w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Return to adventure"
            >
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
                <span>LONDON UNDERGROUND STATION</span>
                <span className="text-2xl animate-spin [animation-duration:10s]">🚇</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-300">
                Issue your Explorer Passport and Choose your Tube Line!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-2xl border border-slate-700">
            <Ticket className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase">
              Official London Oyster Ticket
            </span>
          </div>
        </div>

        {/* EXPLORER PASSPORT CARD */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-4 border-sky-400 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Choice */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-400 to-indigo-500 border-4 border-white shadow-xl flex items-center justify-center text-5xl">
                {selectedAvatar}
              </div>
              <span className="text-[11px] font-bold text-sky-300 uppercase">Your Avatar</span>
              {/* Avatar Options */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[200px]">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedAvatar(av);
                    }}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm transition-transform ${
                      selectedAvatar === av
                        ? 'bg-amber-400 scale-120 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 opacity-80'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Explorer Name Input */}
            <div className="flex-1 w-full space-y-2">
              <label className="block text-sm font-black text-sky-400 uppercase tracking-wider">
                WHAT IS YOUR NAME, EXPLORER?
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Type your name here..."
                  className="w-full px-5 py-4 bg-slate-800/90 border-3 border-sky-400/60 focus:border-amber-400 rounded-2xl text-xl font-black text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                />
              </div>
              <p className="text-xs font-semibold text-slate-400">
                Your name will be announced on the London station loudspeakers!
              </p>
            </div>
          </div>

          {/* TUBE ROUTES SELECTION */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="block text-sm font-black text-amber-400 uppercase tracking-wider">
              CHOOSE YOUR TUBE LINE (AGE LEVEL):
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TUBE_ROUTES.map((route) => {
                const isSelected = currentRoute === route.id;

                return (
                  <div
                    key={route.id}
                    onClick={() => {
                      sounds.playTap();
                      setCurrentRoute(route.id);
                      sounds.speakBritish(route.title);
                    }}
                    className={`p-4 rounded-3xl border-4 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 transform active:scale-95 ${
                      isSelected
                        ? 'bg-slate-800/95 shadow-xl scale-102'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-85'
                    }`}
                    style={{
                      borderColor: isSelected ? route.accentColor : '#334155',
                      boxShadow: isSelected ? `0 0 20px ${route.accentColor}40` : 'none',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-slate-950"
                          style={{ backgroundColor: route.accentColor }}
                        >
                          {route.badge}
                        </span>
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: route.accentColor,
                            backgroundColor: isSelected ? route.accentColor : 'transparent',
                          }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                        </div>
                      </div>

                      <h4 className="text-base font-black text-white">{route.title}</h4>
                      <span className="text-xs font-bold text-amber-300 block mt-0.5">
                        {route.age}
                      </span>
                      <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed">
                        {route.description}
                      </p>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800 flex items-center gap-1.5">
                      <Train className="w-3.5 h-3.5" style={{ color: route.accentColor }} />
                      <span>{route.line}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BIG BOARDING BUTTON */}
          <div className="pt-4 text-center">
            <button
              onClick={handleSaveAndBoard}
              className="w-full sm:w-auto px-10 py-4 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xl shadow-[0_10px_30px_rgba(255,0,85,0.5)] transition-all transform active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-3 mx-auto border-3 border-white"
            >
              <span>BOARD THE TUBE TRAIN! 🚇✨</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS SNACKBAR */}
      {snackBar && (
        <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 p-4 px-6 rounded-3xl shadow-2xl border-4 border-white flex items-center gap-3">
            <span className="text-3xl">🎫🚇</span>
            <p className="text-sm font-black tracking-tight leading-snug">
              {snackBar}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
