import React from 'react';
import { Sparkles, Trophy, ArrowRight, Star, Flame, CheckCircle2 } from 'lucide-react';
import { PhonicsLevel } from '../../utils/phonicsLevels';
import { sounds } from '../../utils/audio';

interface KidsLevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedLevel: PhonicsLevel;
  starsEarnedBonus: number;
}

export const KidsLevelUpModal: React.FC<KidsLevelUpModalProps> = ({
  isOpen,
  onClose,
  unlockedLevel,
  starsEarnedBonus,
}) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    sounds.playBusHorn();
    sounds.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 duration-200 font-['Fredoka'] select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-4 border-amber-400 rounded-3xl shadow-[0_0_60px_rgba(251,191,36,0.4)] overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center space-y-5 animate-in slide-in-from-bottom duration-300">
        {/* Floating Confetti / Bus Graphic */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 border-4 border-white shadow-2xl flex items-center justify-center text-5xl animate-bounce">
            🚀
          </div>
          <span className="absolute -top-3 -right-3 text-3xl animate-spin [animation-duration:6s]">
            ⭐
          </span>
          <span className="absolute -bottom-2 -left-3 text-3xl animate-pulse">
            🔥
          </span>
        </div>

        {/* Level Up Announcement */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-bounce" />
            <span>5 Consecutive Correct Words Streak!</span>
            <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-bounce" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-md">
            LEVEL UP! 🌟
          </h2>
          <p className="text-sm font-bold text-slate-300">
            You pronounced 5 words in a row with top British accuracy!
          </p>
        </div>

        {/* Unlocked Difficulty Card */}
        <div className="w-full bg-slate-950/80 p-4 rounded-2xl border-2 border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              New Difficulty Tier Unlocked
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-amber-400 text-slate-950">
              {unlockedLevel.badge}
            </span>
          </div>

          <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
            <span>{unlockedLevel.name}</span>
          </h3>

          <p className="text-xs font-medium text-slate-300">
            {unlockedLevel.description}
          </p>

          {/* Sample Words Pills */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400">New words:</span>
            {unlockedLevel.stops.slice(0, 4).map((s) => (
              <span
                key={s.id}
                className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-800 text-amber-300 border border-slate-700"
              >
                {s.word} {s.emoji}
              </span>
            ))}
            <span className="text-[11px] font-bold text-slate-400">...and more!</span>
          </div>
        </div>

        {/* Star Bonus Reward */}
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-400/20 px-5 py-2.5 rounded-2xl border border-amber-400/40">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400 animate-spin [animation-duration:8s]" />
          <span className="text-sm font-black text-amber-300">
            +{starsEarnedBonus} Explorer Level-Up Bonus Stars! ⭐
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-lg shadow-xl border-3 border-white transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-3 uppercase tracking-wider"
        >
          <span>Start Level {unlockedLevel.level} Words! 🚌💨</span>
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
