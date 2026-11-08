import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/audio';
import {
  jhonxDb,
  PhonicsProgressRecord,
  ReadingHistoryRecord,
  PhonicsChallengeStats,
} from '../../utils/database';
import { getLevelData } from '../../utils/phonicsLevels';
import { downloadFlutterProjectZip } from '../../utils/flutterCode';
import {
  ShieldCheck,
  X,
  Headphones,
  BarChart3,
  Database,
  Download,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Volume2,
  RotateCcw,
  Sparkles,
  Lock,
  Flame,
  Target,
  Trophy,
} from 'lucide-react';

interface KidsParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  explorerName: string;
}

export const KidsParentModal: React.FC<KidsParentModalProps> = ({
  isOpen,
  onClose,
  explorerName,
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [gateNum1, setGateNum1] = useState<number>(4);
  const [gateNum2, setGateNum2] = useState<number>(3);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [gateError, setGateError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'voices' | 'fluency' | 'sqlite' | 'flutter'>('voices');
  const [selectedGroup, setSelectedGroup] = useState<number>(1);
  const [progressData, setProgressData] = useState<PhonicsProgressRecord[]>([]);
  const [historyData, setHistoryData] = useState<ReadingHistoryRecord[]>([]);
  const [challengeStats, setChallengeStats] = useState<PhonicsChallengeStats>(() =>
    jhonxDb.getChallengeStats()
  );
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Generate simple maths challenge for parent gate
      const n1 = Math.floor(Math.random() * 5) + 3;
      const n2 = Math.floor(Math.random() * 5) + 2;
      setGateNum1(n1);
      setGateNum2(n2);
      setUserAnswer('');
      setGateError(null);
      loadDbData();
    }
  }, [isOpen]);

  const loadDbData = () => {
    setProgressData(jhonxDb.getProgress());
    setHistoryData(jhonxDb.getParentDashboardData());
    setChallengeStats(jhonxDb.getChallengeStats());
  };

  if (!isOpen) return null;

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = gateNum1 + gateNum2;
    if (parseInt(userAnswer.trim(), 10) === sum) {
      sounds.playSuccess();
      setIsUnlocked(true);
      setGateError(null);
    } else {
      sounds.playTap();
      setGateError('Incorrect answer. Please try again!');
    }
  };

  const handlePlayAudio = (record: ReadingHistoryRecord) => {
    if (currentlyPlayingId === record.id) {
      setCurrentlyPlayingId(null);
      window.speechSynthesis?.cancel();
    } else {
      sounds.playTap();
      setCurrentlyPlayingId(record.id);
      sounds.speakBritish(record.word);
      setTimeout(() => {
        setCurrentlyPlayingId(null);
      }, 1500);
    }
  };

  const filteredProgress = progressData.filter(
    (item) => item.phonics_group === selectedGroup
  );

  const averageMastery = Math.round(
    progressData.reduce((acc, curr) => acc + curr.mastery_percentage, 0) /
      (progressData.length || 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 font-['Fredoka']">
      <div className="relative w-full max-w-3xl bg-slate-900 border-4 border-emerald-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-slate-950 border-b-2 border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>Parents & Educators Portal</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SQLite v1
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Track {explorerName}'s learning journey through British phonics routes
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT: ADULT MATHS GATE VS UNLOCKED PORTAL */}
        {!isUnlocked ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/20 text-amber-400 border-2 border-amber-400/40 flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-black text-white">Adult Security Verification</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                To ensure this portal is only accessed by adults, please solve this quick maths sum:
              </p>
            </div>

            <form onSubmit={handleVerifyGate} className="space-y-4 max-w-xs w-full">
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-700 text-2xl font-black text-amber-400">
                {gateNum1} + {gateNum2} = ?
              </div>

              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 focus:border-emerald-400 rounded-2xl text-center text-xl font-black text-white outline-none"
                autoFocus
              />

              {gateError && (
                <p className="text-xs font-bold text-rose-400">{gateError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-base shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Enter Portal 🔓
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* PORTAL NAVIGATION TABS */}
            <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('voices');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'voices'
                    ? 'bg-emerald-500 text-slate-950 shadow-md scale-102'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>KIDS VOICES 🎧</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('fluency');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'fluency'
                    ? 'bg-sky-500 text-white shadow-md scale-102'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Fluency Thermometer</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('sqlite');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'sqlite'
                    ? 'bg-pink-500 text-white shadow-md scale-102'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>SQLite Database</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('flutter');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'flutter'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Flutter Project (.zip)</span>
              </button>
            </div>

            {/* TAB CONTENT BODY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* TAB 1: KIDS VOICES */}
              {activeTab === 'voices' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white">
                        AI Speech Evaluations & Word History
                      </h4>
                      <p className="text-xs text-slate-400">
                        Evaluated live in real-time with Jhonx London AI Phonics Coach (Privacy-first: No audio files saved on disk)
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {historyData.length} Evaluations
                    </span>
                  </div>

                  <div className="space-y-2">
                    {historyData.map((rec) => {
                      const isPlaying = currentlyPlayingId === rec.id;

                      return (
                        <div
                          key={rec.id}
                          className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handlePlayAudio(rec)}
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform active:scale-90 ${
                                isPlaying
                                  ? 'bg-emerald-500 text-slate-950 animate-pulse'
                                  : 'bg-slate-800 hover:bg-slate-700 text-white'
                              }`}
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-black text-white font-mono">
                                  {rec.word}
                                </span>
                                {rec.was_perfect ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> Perfect
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    <AlertCircle className="w-3 h-3" /> Practising
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {rec.date_read} · 0:03
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                              {rec.audio_path}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: FLUENCY THERMOMETER */}
              {activeTab === 'fluency' && (
                <div className="space-y-4">
                  {/* Phonics Challenge & Accuracy Progression Card */}
                  <div className="p-4 rounded-2xl bg-slate-950 border-2 border-amber-400/50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-black text-white">
                          Live Challenge Accuracy & Difficulty Tracker
                        </h4>
                      </div>
                      <span className="px-3 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950">
                        {getLevelData(challengeStats.currentLevel).badge}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Overall Accuracy
                        </span>
                        <span className="text-xl font-black text-sky-400 font-mono mt-0.5">
                          {challengeStats.accuracy}%
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {challengeStats.correctAttempts} / {challengeStats.totalAttempts} words
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Current Streak
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                          <span className="text-xl font-black text-amber-400 font-mono">
                            {challengeStats.currentStreak}/5
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                          {5 - challengeStats.currentStreak} to level up
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Best Streak
                        </span>
                        <span className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                          {challengeStats.bestStreak}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Consecutive words
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Difficulty Tier
                        </span>
                        <span className="text-base font-black text-purple-400 font-mono mt-0.5">
                          Lvl {challengeStats.currentLevel}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                          {getLevelData(challengeStats.currentLevel).name}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        💡 <strong>Adaptive Rule:</strong> Pronouncing 5 consecutive words correctly
                        automatically increases the difficulty and unlocks the next London phonics
                        tier.
                      </span>
                    </div>
                  </div>

                  {/* Gemini Adaptive Phonics Engine Insights */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-900 border border-purple-400/40 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h4 className="text-sm font-black text-white">
                          Gemini Adaptive Phonics Engine Insights
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        Zero-Repetition &bull; British IPA
                      </span>
                    </div>

                    <p className="text-xs text-purple-200/80 leading-relaxed">
                      Sequences are generated dynamically by Gemini according to {explorerName}&apos;s live performance profile. Words previously completed are excluded to guarantee constant engagement without repetition loops.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Current Focus Phonemes
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {progressData.filter((p) => p.mastery_percentage < 80).length > 0 ? (
                            progressData
                              .filter((p) => p.mastery_percentage < 80)
                              .slice(0, 5)
                              .map((p) => (
                                <span
                                  key={p.letter}
                                  className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-black"
                                >
                                  {p.letter} ({p.mastery_percentage}%)
                                </span>
                              ))
                          ) : (
                            <span className="text-emerald-400 font-bold">
                              All initial letters mastered! Expanding to vowel blends.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Adaptive Engine Status
                        </span>
                        <div className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Gemini Active &bull; Tier {challengeStats.currentLevel} ({getLevelData(challengeStats.currentLevel).name})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-500/40 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-sky-400 uppercase">
                        Average Phonics Mastery
                      </p>
                      <h4 className="text-2xl font-black text-white mt-0.5">
                        {averageMastery}% Mastery
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-700">
                      <button
                        onClick={() => setSelectedGroup(1)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          selectedGroup === 1 ? 'bg-sky-500 text-white' : 'text-slate-400'
                        }`}
                      >
                        Group 1 (SATPIN)
                      </button>
                      <button
                        onClick={() => setSelectedGroup(2)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          selectedGroup === 2 ? 'bg-sky-500 text-white' : 'text-slate-400'
                        }`}
                      >
                        Group 2 (CKEHRMD)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredProgress.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => sounds.speakBritish(item.letter.toLowerCase())}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-4xl font-black text-white font-mono">
                            {item.letter}
                          </span>
                          <span className="text-xs font-black text-emerald-400 font-mono">
                            {item.mastery_percentage}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${item.mastery_percentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono flex items-center justify-between">
                          <span>Tap to hear sound</span>
                          <Volume2 className="w-3 h-3" />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SQLITE */}
              {activeTab === 'sqlite' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <p className="text-emerald-400 font-bold">
                      Local SQLite 3 Database Schema:
                    </p>
                    <pre className="text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
{`-- 1. Fluency Thermometer (Letter/Sound Mastery)
CREATE TABLE table_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phonics_group INTEGER NOT NULL,    -- 1 (SATPIN), 2 (CKEHRMD)
  letter TEXT NOT NULL,              -- 'S', 'A', 'C'
  mastery_percentage INTEGER NOT NULL
);

-- 2. Star Words & Recorded Child Audio
CREATE TABLE table_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  date_read TEXT NOT NULL,
  audio_path TEXT NOT NULL,
  was_perfect INTEGER NOT NULL
);`}
                    </pre>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => {
                        sounds.playTap();
                        jhonxDb.resetDatabase();
                        loadDbData();
                      }}
                      className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors inline-flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Defaults</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: FLUTTER CODE & EXPORT */}
              {activeTab === 'flutter' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-base font-black text-white">
                      Export Official Flutter Project
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      You can download the complete Jhonx London Flutter Dart source code in a single zip archive to run in Android Studio or VS Code.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      sounds.playSuccess();
                      await downloadFlutterProjectZip('jhonx_app');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <Download className="w-5 h-5 stroke-[2.5]" />
                    <span>Download jhonx_app.zip (Full Flutter Project)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
