import React, { useState, useEffect } from 'react';
import { jhonxDb, PhonicsProgressRecord, ReadingHistoryRecord } from '../../utils/database';
import { ParentAudioPlayerScreen } from './ParentAudioPlayerScreen';
import { sounds } from '../../utils/audio';
import { Volume2, Play, CheckCircle2, AlertCircle, Database, Shield, RotateCcw, Headphones, BarChart3 } from 'lucide-react';

interface ParentDashboardScreenProps {
  explorerName?: string;
  onBackToApp?: () => void;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  explorerName = 'Alex',
  onBackToApp,
}) => {
  const [activeTab, setActiveTab] = useState<'voices' | 'fluency' | 'sqlite'>('voices');
  const [selectedGroup, setSelectedGroup] = useState<number>(1);
  const [progressData, setProgressData] = useState<PhonicsProgressRecord[]>([]);
  const [historyData, setHistoryData] = useState<ReadingHistoryRecord[]>([]);

  const loadData = () => {
    setProgressData(jhonxDb.getProgress());
    setHistoryData(jhonxDb.getParentDashboardData());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProgress = progressData.filter(
    (item) => item.phonics_group === selectedGroup
  );

  const averageMastery = Math.round(
    progressData.reduce((acc, curr) => acc + curr.mastery_percentage, 0) /
      (progressData.length || 1)
  );

  return (
    <div className="relative w-full h-full flex flex-col bg-[#121212] text-white select-none overflow-hidden font-sans">
      {/* Top Parents Navigation Bar */}
      <div className="px-3 py-2 bg-[#1a1a1a] border-b border-slate-800 flex items-center justify-between shrink-0 text-xs">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('voices');
          }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-colors text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'voices'
              ? 'bg-[#00ff66]/15 text-[#00ff66] font-bold border border-[#00ff66]/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Kids Voices 🎧</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('fluency');
          }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-colors text-center flex items-center justify-center gap-1.5 mx-1 ${
            activeTab === 'fluency'
              ? 'bg-[#00e5ff]/15 text-[#00e5ff] font-bold border border-[#00e5ff]/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Termômetro</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('sqlite');
          }}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-colors text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'sqlite'
              ? 'bg-[#ff0055]/15 text-[#ff0055] font-bold border border-[#ff0055]/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>SQLite</span>
        </button>
      </div>

      {/* Screen Body */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* TAB 1: KIDS VOICES 🎧 (ParentAudioPlayerScreen from user's code) */}
        {activeTab === 'voices' && (
          <ParentAudioPlayerScreen onBack={onBackToApp} />
        )}

        {/* TAB 2: TERMÔMETRO DA FLUÊNCIA (table_progress) */}
        {activeTab === 'fluency' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Explorer stats banner */}
            <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#00ff66] font-mono">Fluency Thermometer</p>
                <h3 className="text-base font-bold text-white mt-0.5">Explorer: {explorerName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Average Mastery: <span className="text-[#00ff66] font-bold font-mono">{averageMastery}%</span></p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-400">
                #1
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Phonics Groups
              </span>
              <div className="flex items-center gap-1 bg-[#1e1e1e] p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => {
                    sounds.playTap();
                    setSelectedGroup(1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    selectedGroup === 1
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Group 1 (SATPIN)
                </button>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setSelectedGroup(2);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    selectedGroup === 2
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Group 2 (CKEHRMD)
                </button>
              </div>
            </div>

            {/* Letter Mastery Cards */}
            <div className="grid grid-cols-2 gap-3">
              {filteredProgress.map((item) => {
                const isHigh = item.mastery_percentage >= 85;
                const isMed = item.mastery_percentage >= 70 && item.mastery_percentage < 85;
                const accentColor = isHigh ? '#00ff66' : isMed ? '#00e5ff' : '#ffaa00';

                return (
                  <div
                    key={item.id}
                    onClick={() => sounds.speakBritish(item.letter.toLowerCase())}
                    className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer transform active:scale-98"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl font-black text-white font-mono leading-none">
                        {item.letter}
                      </span>
                      <span
                        className="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${accentColor}20`,
                          color: accentColor,
                          border: `1px solid ${accentColor}40`,
                        }}
                      >
                        {item.mastery_percentage}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#2a2a2a] rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.mastery_percentage}%`,
                          backgroundColor: accentColor,
                          boxShadow: `0 0 8px ${accentColor}80`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2">
                      <span>{isHigh ? 'Mastered 🎯' : isMed ? 'Good Pace 👍' : 'Practice ⚡'}</span>
                      <Volume2 className="w-3 h-3 text-slate-400 hover:text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SQLITE RAW */}
        {activeTab === 'sqlite' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
            <div className="p-3 bg-[#1e1e1e] rounded-xl border border-slate-800 space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Database className="w-4 h-4" />
                <span>jhonx_london.db (SQLite v1)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pulls real offline voice recordings into <code className="text-[#00ff66]">table_history</code>.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 font-bold block">
                table_history (Palavras Campeãs & Áudio)
              </span>
              <pre className="p-3 bg-black rounded-xl border border-slate-800 text-[10px] text-cyan-400 overflow-x-auto leading-relaxed">
{`CREATE TABLE table_history (
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
                  loadData();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-[11px] text-slate-400 hover:text-white border border-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Database to Defaults</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
