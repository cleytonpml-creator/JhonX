import React, { useState } from 'react';
import { sounds } from '../../utils/audio';
import { Sparkles, Check, Lock } from 'lucide-react';

export interface StickerItem {
  id: string;
  name: string;
  emoji: string;
  location: string;
  isUnlocked: boolean;
  soundName?: string;
}

interface StickerBookScreenProps {
  onBackToChallenge?: () => void;
  unlockedStickers?: string[];
}

export const INITIAL_STICKERS: StickerItem[] = [
  { id: '1', name: 'Pombo de Boné', emoji: '🐦🧢', location: 'London Streets', isUnlocked: true },
  { id: '2', name: 'Raposa de Óculos', emoji: '🦊🕶️', location: 'Hackney Canal', isUnlocked: true },
  { id: '3', name: 'Bulldog do Skate', emoji: '🐶🛹', location: 'Camden Town', isUnlocked: false },
  { id: '4', name: 'Boombox Neon', emoji: '📻⚡', location: 'Camden Town', isUnlocked: false },
  { id: '5', name: 'Mango DJ', emoji: '🥭🎧', location: 'Brixton Market', isUnlocked: false },
  { id: '6', name: 'Guarda Real Break', emoji: '💂🕺', location: 'Top Explorer', isUnlocked: false },
];

export const StickerBookScreen: React.FC<StickerBookScreenProps> = ({
  onBackToChallenge,
  unlockedStickers = ['1', '2'],
}) => {
  const [stickers, setStickers] = useState<StickerItem[]>(() =>
    INITIAL_STICKERS.map((s) => ({
      ...s,
      isUnlocked: s.isUnlocked || unlockedStickers.includes(s.id),
    }))
  );

  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

  const unlockedCount = stickers.filter((s) => s.isUnlocked).length;
  const progressRatio = unlockedCount / stickers.length;

  const handleStickerTap = (sticker: StickerItem) => {
    sounds.playTap();
    if (sticker.isUnlocked) {
      sounds.playCorrectWord();
      setActiveStickerId(sticker.id);
      setTimeout(() => setActiveStickerId(null), 1000);
    } else {
      sounds.speakBritish(`Complete more Camden phonics challenges to unlock ${sticker.name}!`);
    }
  };

  const unlockNextSticker = () => {
    sounds.playSuccess();
    setStickers((prev) => {
      const firstLocked = prev.find((s) => !s.isUnlocked);
      if (!firstLocked) return prev;
      return prev.map((s) => (s.id === firstLocked.id ? { ...s, isUnlocked: true } : s));
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#1a1a1a] text-white select-none overflow-hidden font-sans">
      {/* AppBar */}
      <header className="h-14 px-4 bg-[#121212] flex items-center justify-between border-b border-slate-800/80 shrink-0 z-10">
        {onBackToChallenge && (
          <button
            onClick={onBackToChallenge}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 p-1"
          >
            ← <span>Phonics</span>
          </button>
        )}
        <h1 className="text-sm font-bold tracking-wider text-white text-center flex-1">
          MY STICKER BOOK 🎨
        </h1>
        {onBackToChallenge && <div className="w-12" />}
      </header>

      {/* BARRA DE PROGRESSO DO ÁLBUM */}
      <div className="p-5 bg-[#121212] border-b border-slate-800 shrink-0 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-slate-400">London Brick Wall</p>
          <p className="text-lg font-bold text-[#00ff66] tracking-tight tabular-nums">
            {unlockedCount} / {stickers.length} Unlocked
          </p>
        </div>

        {/* CircularProgressIndicator */}
        <div className="relative w-11 h-11 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#262626] stroke-current"
              strokeWidth="3.5"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#00ff66] stroke-current transition-all duration-500 ease-out"
              strokeDasharray={`${progressRatio * 100}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-white tabular-nums font-mono">
            {Math.round(progressRatio * 100)}%
          </span>
        </div>
      </div>

      {/* O MURO DE TIJOLOS (A Grade de Stickers) */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#251c1c]">
        {/* Subtle London Brick wall mortar pattern */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          {stickers.map((sticker) => {
            const isPulsing = activeStickerId === sticker.id;
            return (
              <div
                key={sticker.id}
                onClick={() => handleStickerTap(sticker)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-200 cursor-pointer transform active:scale-95 ${
                  sticker.isUnlocked
                    ? 'bg-[#1e1e1e] border-[3px] border-[#ff0055]'
                    : 'bg-black/40 border border-slate-800'
                } ${isPulsing ? 'scale-105 shadow-2xl' : ''}`}
                style={{
                  boxShadow: sticker.isUnlocked
                    ? '0 0 16px 2px rgba(255, 0, 85, 0.25)'
                    : 'none',
                  aspectRatio: '0.85',
                }}
              >
                {/* Unlocked / Locked Badge in corner */}
                <div className="absolute top-2.5 right-2.5">
                  {sticker.isUnlocked ? (
                    <span className="w-5 h-5 rounded-full bg-[#ff0055]/20 text-[#ff0055] flex items-center justify-center text-[10px] border border-[#ff0055]/30">
                      ✓
                    </span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>

                {/* O STICKER (Colorido vs Opaco/Bloqueado via grayscale) */}
                <div
                  className={`text-5xl my-2 transition-all select-none ${
                    sticker.isUnlocked
                      ? 'opacity-100 filter-none hover:scale-110'
                      : 'opacity-25 grayscale brightness-75'
                  } ${isPulsing ? 'animate-bounce' : ''}`}
                >
                  {sticker.emoji}
                </div>

                {/* Sticker Name */}
                <p
                  className={`text-sm font-bold text-center mt-2 truncate w-full ${
                    sticker.isUnlocked ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {sticker.isUnlocked ? sticker.name : '???'}
                </p>

                {/* Sticker Location */}
                <p
                  className={`text-[11px] text-center mt-1 truncate w-full font-mono ${
                    sticker.isUnlocked ? 'text-[#00e5ff]' : 'text-slate-600'
                  }`}
                >
                  {sticker.isUnlocked ? sticker.location : 'Locked'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Simulator Tool: Unlock Next Sticker */}
        <div className="pt-2 pb-4 text-center">
          {unlockedCount < stickers.length ? (
            <button
              onClick={unlockNextSticker}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-[11px] font-mono text-cyan-300 border border-slate-700 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[#ff0055]" />
              <span>Simulate Word Clear Unlock</span>
            </button>
          ) : (
            <span className="text-xs text-[#00ff66] font-bold font-mono">
              🏆 All London Stickers Unlocked!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
