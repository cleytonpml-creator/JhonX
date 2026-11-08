import React, { useState } from 'react';
import { sounds } from '../../utils/audio';
import { safeGetItem, safeSetItem } from '../../utils/database';
import { Sparkles, Star, Lock, Check, ArrowLeft, PartyPopper } from 'lucide-react';

export interface StickerItem {
  id: string;
  name: string;
  emoji: string;
  location: string;
  isUnlocked: boolean;
  cost: number;
  funFact: string;
}

interface KidsStickerBookProps {
  starsCount: number;
  onSpendStars: (amount: number) => boolean;
  onBackToGame: () => void;
}

export const INITIAL_STICKERS: StickerItem[] = [
  {
    id: '1',
    name: 'Cap-Wearing Pigeon',
    emoji: '🐦🧢',
    location: 'London Streets',
    isUnlocked: true,
    cost: 0,
    funFact: 'The most stylish pigeon in London flying over Westminster streets!',
  },
  {
    id: '2',
    name: 'Clever Fox with Glasses',
    emoji: '🦊🕶️',
    location: 'Hackney Canal',
    isUnlocked: true,
    cost: 0,
    funFact: 'This clever fox loves listening to phonics beats by Hackney Canal!',
  },
  {
    id: '3',
    name: 'Skater Bulldog',
    emoji: '🐶🛹',
    location: 'Camden Town',
    isUnlocked: false,
    cost: 40,
    funFact: 'Skateboarding through Camden Market listening to rock and roll!',
  },
  {
    id: '4',
    name: 'Neon Boombox',
    emoji: '📻⚡',
    location: 'Camden Town',
    isUnlocked: false,
    cost: 60,
    funFact: 'Plays hip hop beats with British vowel sounds!',
  },
  {
    id: '5',
    name: 'Mango DJ',
    emoji: '🥭🎧',
    location: 'Brixton Market',
    isUnlocked: false,
    cost: 80,
    funFact: 'The most musical mango in Brixton Market throwing a street party!',
  },
  {
    id: '6',
    name: 'Breakdance Royal Guard',
    emoji: '💂🕺',
    location: 'Buckingham Palace',
    isUnlocked: false,
    cost: 100,
    funFact: 'The royal palace guard who dances breakdance when nobody is looking!',
  },
];

const STICKERS_STORAGE_KEY = 'jhonx_unlocked_stickers';

const loadSavedStickers = (): StickerItem[] => {
  try {
    const saved = safeGetItem(STICKERS_STORAGE_KEY);
    if (!saved) return INITIAL_STICKERS;
    const unlockedIds: string[] = JSON.parse(saved);
    return INITIAL_STICKERS.map((s) => ({
      ...s,
      isUnlocked: s.isUnlocked || unlockedIds.includes(s.id),
    }));
  } catch {
    return INITIAL_STICKERS;
  }
};

export const KidsStickerBook: React.FC<KidsStickerBookProps> = ({
  starsCount,
  onSpendStars,
  onBackToGame,
}) => {
  const [stickers, setStickers] = useState<StickerItem[]>(() => loadSavedStickers());
  const [activeSticker, setActiveSticker] = useState<StickerItem | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const unlockedCount = stickers.filter((s) => s.isUnlocked).length;
  const progressRatio = unlockedCount / stickers.length;

  const handleStickerClick = (sticker: StickerItem) => {
    sounds.playTap();
    setActiveSticker(sticker);

    if (sticker.isUnlocked) {
      sounds.playCorrectWord();
      sounds.speakBritish(`${sticker.name} from ${sticker.location}`);
    } else {
      sounds.speakBritish(`Unlock ${sticker.name} for ${sticker.cost} stars!`);
    }
  };

  const handleUnlockWithStars = (sticker: StickerItem) => {
    if (sticker.isUnlocked) return;

    if (starsCount < sticker.cost) {
      sounds.playTap();
      setCelebrationMessage(`You need ${sticker.cost - starsCount} more stars! Speak words and sentences to earn stars! ⭐`);
      setTimeout(() => setCelebrationMessage(null), 2500);
      return;
    }

    const success = onSpendStars(sticker.cost);
    if (success) {
      sounds.playSuccess();
      sounds.playBusHorn();

      const updated = stickers.map((s) => (s.id === sticker.id ? { ...s, isUnlocked: true } : s));
      setStickers(updated);
      try {
        const unlockedIds = updated.filter((s) => s.isUnlocked).map((s) => s.id);
        safeSetItem(STICKERS_STORAGE_KEY, JSON.stringify(unlockedIds));
      } catch {
        // ignore
      }
      setActiveSticker((prev) => (prev ? { ...prev, isUnlocked: true } : null));

      setCelebrationMessage(`🎉 CONGRATULATIONS! You unlocked "${sticker.name}"!`);
      setTimeout(() => setCelebrationMessage(null), 3000);
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-x-hidden select-none font-['Fredoka'] p-4 md:p-8">
      {/* MAGICAL LONDON BACKDROP */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/src/assets/images/cartoon_london_backdrop_1793964364409.jpg"
          alt="London City Background"
          className="w-full h-full object-cover object-center opacity-20 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full space-y-6">
        {/* STICKER BOOK HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/10 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border-3 border-pink-500 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playTap();
                onBackToGame();
              }}
              className="w-12 h-12 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Return to adventure"
            >
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
                <span>MY STICKER BOOK</span>
                <span className="text-2xl animate-bounce">🎨</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-pink-300">
                British Graffiti Brick Wall · Collect all London characters!
              </p>
            </div>
          </div>

          {/* Album Progress Bar */}
          <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-2xl border-2 border-slate-700">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Collection</span>
              <span className="text-base font-black text-emerald-400 tabular-nums">
                {unlockedCount} / {stickers.length} Unlocked
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-400 flex items-center justify-center font-black text-sm text-white bg-emerald-950">
              {Math.round(progressRatio * 100)}%
            </div>
          </div>
        </div>

        {/* STICKERS GRID (London Brick Wall) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {stickers.map((sticker) => {
            const isSelected = activeSticker?.id === sticker.id;

            return (
              <div
                key={sticker.id}
                onClick={() => handleStickerClick(sticker)}
                className={`relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between transition-all duration-300 transform cursor-pointer active:scale-95 border-4 ${
                  sticker.isUnlocked
                    ? isSelected
                      ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 border-pink-400 shadow-[0_0_25px_rgba(255,0,85,0.6)] scale-105'
                      : 'bg-slate-900/90 border-pink-500/60 hover:border-pink-400 hover:scale-102 shadow-lg'
                    : isSelected
                    ? 'bg-slate-900/60 border-amber-400/80 scale-102'
                    : 'bg-slate-950/70 border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-700'
                }`}
                style={{ minHeight: '220px' }}
              >
                {/* Corner Badge */}
                <div className="w-full flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300">
                    {sticker.location}
                  </span>
                  {sticker.isUnlocked ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-[10px]">
                      <Lock className="w-3 h-3" />
                      <span>{sticker.cost} ⭐</span>
                    </span>
                  )}
                </div>

                {/* Main Sticker Emoji / Figure */}
                <div
                  className={`text-6xl sm:text-7xl my-3 transition-transform duration-300 ${
                    sticker.isUnlocked
                      ? 'filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] group-hover:scale-115'
                      : 'grayscale opacity-30 brightness-75'
                  } ${isSelected && sticker.isUnlocked ? 'animate-bounce' : ''}`}
                >
                  {sticker.emoji}
                </div>

                {/* Sticker Name */}
                <div className="w-full text-center">
                  <p
                    className={`text-base font-black truncate ${
                      sticker.isUnlocked ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {sticker.isUnlocked ? sticker.name : '??? Locked'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 truncate">
                    {sticker.isUnlocked ? 'Tap to hear voice!' : `Costs ${sticker.cost} stars`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* SELECTED STICKER DETAIL CARD */}
        {activeSticker && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-3 border-amber-400 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{activeSticker.emoji}</span>
              <div>
                <h4 className="text-xl font-black text-white">{activeSticker.name}</h4>
                <p className="text-xs text-amber-300 font-semibold">{activeSticker.funFact}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Origin: {activeSticker.location}
                </p>
              </div>
            </div>

            <div>
              {activeSticker.isUnlocked ? (
                <button
                  onClick={() => {
                    sounds.playTap();
                    sounds.speakBritish(`${activeSticker.name}! Brilliant!`);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Play British Voice 🇬🇧</span>
                </button>
              ) : (
                <button
                  onClick={() => handleUnlockWithStars(activeSticker)}
                  className={`px-6 py-2.5 rounded-2xl font-black text-sm shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-2 ${
                    starsCount >= activeSticker.cost
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-amber-300 shadow-amber-400/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span>
                    Unlock for {activeSticker.cost} Stars (You have {starsCount})
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CELEBRATION SNACKBAR */}
      {celebrationMessage && (
        <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-4 px-6 rounded-3xl shadow-2xl border-4 border-white flex items-center gap-3">
            <span className="text-3xl">🎨✨</span>
            <p className="text-sm font-black tracking-tight leading-snug">
              {celebrationMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
