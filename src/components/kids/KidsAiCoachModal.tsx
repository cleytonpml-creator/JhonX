import React from 'react';
import { Volume2, Sparkles, Check, RotateCcw, ArrowRight, Star, AlertTriangle, HelpCircle } from 'lucide-react';
import { AiCoachEvaluation } from '../../utils/aiCoach';
import { sounds } from '../../utils/audio';

interface KidsAiCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSkip?: () => void;
  targetText: string;
  spokenText: string;
  evaluation: AiCoachEvaluation | null;
  category: 'word' | 'sentence' | 'story';
  streakCount?: number;
  accuracy?: number;
}

export const KidsAiCoachModal: React.FC<KidsAiCoachModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  onSkip,
  targetText,
  spokenText,
  evaluation,
  category,
  streakCount,
  accuracy,
}) => {
  if (!isOpen || !evaluation) return null;

  const safeString = (val: any, fallback: string = ''): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object' && val !== null) {
      return val.text || val.tip || val.message || val.phoneme || fallback;
    }
    return fallback;
  };

  const isPassed =
    evaluation.status === 'perfect' ||
    evaluation.canAutoAdvance === true ||
    (typeof evaluation.score === 'number' && evaluation.score >= 70);
  const isAlmost = evaluation.status === 'almost' && !isPassed;
  const hasError = !isPassed;
  const isPerfect = isPassed;

  const safeTitle = safeString(evaluation.celebrationTitle, isPerfect ? 'Brilliant Reading!' : 'Nice Try!');
  const safeScore = typeof evaluation.score === 'number' ? evaluation.score : (isPerfect ? 100 : 50);
  const safeStars = typeof evaluation.starsEarned === 'number' ? evaluation.starsEarned : 15;
  const safeCoachTip = safeString(evaluation.coachTip, 'Keep practicing your clear British pronunciation!');
  const safeMouthTip = safeString(evaluation.mouthTip, '');
  const safeErrorHighlight = safeString(evaluation.errorHighlight, '');
  const safeSoundCorrection = safeString(evaluation.soundCorrection, '');

  const phonemeList = Array.isArray(evaluation.phonemeFeedback)
    ? evaluation.phonemeFeedback.map((pf) => {
        if (typeof pf === 'string') {
          return { phoneme: pf, status: 'correct' as const };
        }
        return {
          phoneme: safeString(pf?.phoneme || (pf as any)?.sound || (pf as any)?.letter, '?'),
          status: pf?.status === 'correct' ? ('correct' as const) : ('needs_work' as const),
        };
      })
    : [];

  const handleHearNative = () => {
    sounds.playTap();
    sounds.speakBritish(targetText);
  };

  const handleContinue = () => {
    sounds.playSuccess();
    onClose();
  };

  const handleRetryClick = () => {
    sounds.playTap();
    onRetry();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 font-['Fredoka'] select-none">
      <div
        className={`w-full max-w-xl rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isPerfect
            ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/95 border-emerald-400 shadow-emerald-500/30'
            : isAlmost
            ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/95 border-amber-400 shadow-amber-500/30'
            : 'bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/95 border-rose-500 shadow-rose-500/30'
        }`}
      >
        {/* HEADER: LONDON MASCOT & SCORE */}
        <div className="p-5 sm:p-6 pb-3 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            {/* Animated London Mascot Face */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl border-3 flex items-center justify-center text-3xl sm:text-4xl shadow-xl ${
                isPerfect
                  ? 'bg-gradient-to-br from-emerald-400 to-green-600 border-white animate-bounce'
                  : isAlmost
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-white'
                  : 'bg-gradient-to-br from-rose-500 to-pink-600 border-white animate-pulse'
              }`}
            >
              {isPerfect ? '🐶🛹' : isAlmost ? '🦁🇬🇧' : '🦊💡'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                    isPerfect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isAlmost
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  AI Phonics Coach
                </span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1 font-mono">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  +{safeStars} Stars
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mt-0.5">
                {safeTitle}
              </h3>
            </div>
          </div>

          {/* Score Badge */}
          <div
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black border-2 shadow-inner ${
              isPerfect
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : isAlmost
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-rose-500/20 border-rose-400 text-rose-300'
            }`}
          >
            <span className="text-xl sm:text-2xl leading-none">{safeScore}</span>
            <span className="text-[9px] uppercase tracking-wider opacity-80">Score</span>
          </div>
        </div>

        {/* MIDDLE CONTENT: WHAT WAS SPOKEN VS TARGET */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Target comparison */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Target British {category}:
              </span>
              <button
                onClick={handleHearNative}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-black border border-sky-500/40 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Hear Native UK 🇬🇧</span>
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                "{targetText}"
              </span>
              {spokenText && (
                <span className="text-xs sm:text-sm font-semibold text-slate-400 font-mono">
                  (You said: <strong className={isPerfect ? 'text-emerald-400' : 'text-rose-400'}>"{spokenText}"</strong>)
                </span>
              )}
            </div>

            {/* Phonics Sound Breakdown with Visual Correct vs Mistake indicators */}
            {phonemeList.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  Phoneme Breakdown (Sound Analysis):
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {phonemeList.map((pf, idx) => {
                    const isSoundCorrect = pf.status === 'correct';
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                          isSoundCorrect
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                        }`}
                      >
                        <span className="font-mono text-sm">{pf.phoneme}</span>
                        {isSoundCorrect ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span className="text-xs bg-rose-500 text-white rounded px-1 py-0.2">Fix</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ERROR HIGHLIGHT & WHERE THE CHILD ERRED (When pronunciation needs practice) */}
          {hasError && safeErrorHighlight && (
            <div className="bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl p-4 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 fill-rose-500/20" />
                <h4 className="text-sm font-black uppercase tracking-wider">
                  Where to Improve:
                </h4>
              </div>
              <p className="text-sm font-bold text-rose-200 leading-snug">
                {safeErrorHighlight}
              </p>
              {safeSoundCorrection && (
                <div className="pt-2 border-t border-rose-500/20 text-xs font-semibold text-rose-300">
                  💡 <strong>How to pronounce it:</strong> {safeSoundCorrection}
                </div>
              )}
            </div>
          )}

          {/* STREAK & ACCURACY PROGRESS BAR */}
          {typeof streakCount === 'number' && (
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border-2 border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Streak: {streakCount} / 5
                    </span>
                    {typeof accuracy === 'number' && (
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        · 🎯 {accuracy}% Accuracy
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    {streakCount >= 5
                      ? '🎉 5 in a row! Difficulty Level Up!'
                      : `${5 - streakCount} more correct words to level up! 🚀`}
                  </span>
                </div>
              </div>

              {/* 5 Streak Pips */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((pip) => (
                  <div
                    key={pip}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${
                      pip <= streakCount
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm shadow-amber-400/50 scale-105'
                        : 'bg-slate-800 text-slate-600 border-slate-700'
                    }`}
                  >
                    {pip <= streakCount ? '⭐' : '○'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COACH PEDAGOGICAL TIP */}
          <div className="bg-gradient-to-r from-cyan-400/10 via-sky-400/10 to-indigo-400/10 border-2 border-cyan-400/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-4 h-4 fill-current" />
              <h4 className="text-sm font-black uppercase tracking-wider">
                AI Phonics Coach Tip:
              </h4>
            </div>
            <p className="text-sm font-bold text-slate-200 leading-relaxed">
              {safeCoachTip}
            </p>
            {safeMouthTip && (
              <p className="text-xs font-semibold text-cyan-300/90 pt-1 border-t border-cyan-400/20">
                👄 <strong className="text-white">Mouth & Tongue Position:</strong> {safeMouthTip}
              </p>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS: Clear Distinction for Correct vs Mistake */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          {hasError ? (
            <>
              {/* PRIMARY ACTION WHEN INCORRECT: TRY AGAIN */}
              <button
                onClick={handleRetryClick}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl border-2 border-white transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 animate-bounce uppercase tracking-wider"
              >
                <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                <span>Try Again 🔄</span>
              </button>

              {/* SECONDARY ACTION: SKIP TO NEXT */}
              <button
                onClick={onSkip || handleContinue}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Next Stop</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* PRIMARY ACTION WHEN CORRECT: ADVANCE TO NEXT STOP */
            <button
              onClick={handleContinue}
              className="w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-2 border-white bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 shadow-emerald-500/40 uppercase tracking-wider"
            >
              <span>Next London Stop 🚌💨 (+40 ⭐)</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
