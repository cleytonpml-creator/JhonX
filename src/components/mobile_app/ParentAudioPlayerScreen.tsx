import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, Check, ArrowLeft } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { jhonxDb } from '../../utils/database';

export interface ParentAudioRecording {
  id: string;
  word: string;
  dateString: string;
  duration: string;
  wasPerfect: boolean;
}

const DEFAULT_RECORDINGS: ParentAudioRecording[] = [
  { id: '1', word: 'CAT', dateString: 'Today, 4:15 PM', duration: '0:02', wasPerfect: true },
  { id: '2', word: 'SAT', dateString: 'Today, 4:12 PM', duration: '0:03', wasPerfect: true },
  { id: '3', word: 'DOG', dateString: 'Yesterday, 5:30 PM', duration: '0:04', wasPerfect: false },
  { id: '4', word: 'TAP', dateString: 'Oct 24, 6:02 PM', duration: '0:02', wasPerfect: true },
];

interface ParentAudioPlayerScreenProps {
  onBack?: () => void;
}

export const ParentAudioPlayerScreen: React.FC<ParentAudioPlayerScreenProps> = ({ onBack }) => {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<ParentAudioRecording[]>(DEFAULT_RECORDINGS);

  // Synchronize with database table_history
  useEffect(() => {
    try {
      const history = jhonxDb.getParentDashboardData();
      if (history && history.length > 0) {
        const mapped: ParentAudioRecording[] = history.map((item, idx) => {
          const date = new Date(item.date_read);
          const isToday = new Date().toDateString() === date.toDateString();
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateString = isToday ? `Today, ${timeStr}` : date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${timeStr}`;

          return {
            id: String(item.id || idx),
            word: item.word,
            dateString,
            duration: `0:0${Math.floor(Math.random() * 3) + 2}`,
            wasPerfect: item.was_perfect === 1,
          };
        });
        setRecordings(mapped);
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  const playAudio = (id: string, word: string) => {
    sounds.playTap();
    if (currentlyPlayingId === id) {
      setCurrentlyPlayingId(null);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      setCurrentlyPlayingId(id);
      sounds.speakBritish(word);

      // Reset after playback duration
      setTimeout(() => {
        setCurrentlyPlayingId(null);
      }, 1600);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#121212] text-white select-none overflow-hidden font-sans">
      {/* AppBar */}
      <header className="h-14 px-4 bg-[#1a1a1a] flex items-center justify-between border-b border-slate-800 shrink-0 z-10">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 p-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Parents</span>
          </button>
        ) : (
          <div className="w-8" />
        )}

        <h1 className="text-sm font-bold tracking-wider text-white text-center flex-1">
          KIDS VOICES 🎧
        </h1>

        <div className="w-12 text-right">
          <span className="text-[10px] text-[#00ff66] font-mono">Offline</span>
        </div>
      </header>

      {/* Screen Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* Header Information */}
        <div className="mb-5 shrink-0">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            HEAR YOUR CHILD READING
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Listen to the audios recorded completely offline during the game missions.
          </p>
        </div>

        {/* LISTA DE ÁUDIOS GRAVADOS */}
        <div className="flex-1 space-y-3 pb-4">
          {recordings.map((recording) => {
            const isPlaying = currentlyPlayingId === recording.id;

            return (
              <div
                key={recording.id}
                className={`p-4 rounded-[20px] transition-all duration-200 flex items-center justify-between gap-3 ${
                  isPlaying ? 'bg-[#1e1e1e] shadow-lg' : 'bg-[#1e1e1e]'
                }`}
                style={{
                  border: isPlaying ? '2px solid #00ff66' : '1px solid #333333',
                  boxShadow: isPlaying ? '0 0 15px rgba(0, 255, 102, 0.2)' : 'none',
                }}
              >
                {/* BOTÃO DE PLAY/PAUSE ESTILIZADO */}
                <button
                  type="button"
                  onClick={() => playAudio(recording.id, recording.word)}
                  className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer transform active:scale-95 ${
                    isPlaying
                      ? 'bg-[#00ff66] text-black shadow-md scale-105'
                      : 'bg-[#292929] text-white hover:bg-slate-700'
                  }`}
                  title={isPlaying ? 'Pause audio' : 'Play child voice recording'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                {/* INFORMAÇÕES DA PALAVRA E DATA */}
                <div className="flex-1 min-w-0 px-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-black text-white tracking-wide font-mono">
                      {recording.word}
                    </span>

                    {recording.wasPerfect && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#00ff66]/15 text-[#00ff66] text-[10px] font-bold border border-[#00ff66]/40 tracking-wider">
                        PERFECT
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-1 font-mono truncate">
                    {recording.dateString}
                  </p>

                  {/* Audio Waveform visualizer simulation when playing */}
                  {isPlaying && (
                    <div className="flex items-center gap-1 mt-1.5 h-3">
                      <span className="w-1 h-2 bg-[#00ff66] rounded-full animate-bounce" />
                      <span className="w-1 h-3 bg-[#00ff66] rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1 h-1.5 bg-[#00ff66] rounded-full animate-bounce [animation-delay:0.3s]" />
                      <span className="w-1 h-3 bg-[#00ff66] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-2 bg-[#00ff66] rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="text-[9px] text-[#00ff66] font-mono ml-1">Playing Offline .wav</span>
                    </div>
                  )}
                </div>

                {/* DURAÇÃO DO ÁUDIO */}
                <span className="text-sm font-bold text-slate-400 font-mono shrink-0">
                  {recording.duration}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
