import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Box, FileText, Check, Copy } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ToolsScreenProps {
  primaryColor: string;
}

export const ToolsScreen: React.FC<ToolsScreenProps> = ({ primaryColor }) => {
  const [activeSubTab, setActiveSubTab] = useState<'pomodoro' | 'playground' | 'notes'>('pomodoro');

  // Pomodoro state
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      sounds.playSuccess();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    sounds.playTap();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    sounds.playTap();
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressRatio = (25 * 60 - timeLeft) / (25 * 60);

  // Widget Playground state
  const [padding, setPadding] = useState<number>(16);
  const [borderRadius, setBorderRadius] = useState<number>(16);
  const [elevation, setElevation] = useState<number>(4);
  const [rotation, setRotation] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Quick Notes state
  const [noteContent, setNoteContent] = useState<string>(
    '# JhonX App Architecture Notes\n\n- Flutter 3.29.0 Material 3 foundation\n- Riverpod / StateNotifier pattern\n- SQLite / SharedPreferences local persistence\n- Ready for Android APK & iOS build'
  );
  const [noteSaved, setNoteSaved] = useState<boolean>(true);

  const handleNoteChange = (text: string) => {
    setNoteContent(text);
    setNoteSaved(false);
    setTimeout(() => setNoteSaved(true), 600);
  };

  const flutterContainerDart = `Container(
  padding: const EdgeInsets.all(${padding}.0),
  transform: Matrix4.rotationZ(${((rotation * Math.PI) / 180).toFixed(2)}),
  decoration: BoxDecoration(
    color: Theme.of(context).colorScheme.primaryContainer,
    borderRadius: BorderRadius.circular(${borderRadius}.0),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.2),
        blurRadius: ${elevation * 2}.0,
        offset: Offset(0, ${elevation}.0),
      ),
    ],
  ),
  child: const Text('JhonX Flutter Widget'),
)`;

  const copyDartSnippet = () => {
    navigator.clipboard.writeText(flutterContainerDart);
    sounds.playTap();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-slate-100">
      {/* Sub tabs: Pomodoro, Widget Lab, Notes */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800 bg-slate-900/60 shrink-0">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveSubTab('pomodoro');
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'pomodoro'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveSubTab('playground');
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'playground'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Widget Lab
        </button>
        <button
          onClick={() => {
            sounds.playTap();
            setActiveSubTab('notes');
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'notes'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dev Notes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Tab 1: Pomodoro Timer */}
        {activeSubTab === 'pomodoro' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800 stroke-[6] fill-none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[6] fill-none transition-all duration-500 ease-linear"
                  style={{
                    stroke: primaryColor,
                    strokeDasharray: 264,
                    strokeDashoffset: 264 * (1 - progressRatio),
                    strokeLinecap: 'round',
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold tabular-nums tracking-tight text-white font-mono">
                  {formattedTime}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">
                  {isRunning ? 'Focus Sprint' : 'Paused'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetTimer}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={toggleTimer}
                className="px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Focus</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center max-w-xs">
              Based on the 25-minute Pomodoro protocol for Flutter developer flow state.
            </p>
          </div>
        )}

        {/* Tab 2: Flutter Widget Playground */}
        {activeSubTab === 'playground' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                Live Container Widget
              </span>
              <button
                onClick={copyDartSnippet}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied Dart!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Visual Canvas */}
            <div className="h-36 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden p-4">
              <div
                style={{
                  padding: `${padding}px`,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: `0 ${elevation * 2}px ${elevation * 4}px rgba(0,0,0,0.4)`,
                  transform: `rotate(${rotation}deg)`,
                  backgroundColor: primaryColor,
                }}
                className="text-white text-xs font-semibold tracking-wide transition-all duration-150 select-none"
              >
                JhonX Flutter Widget
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Padding: {padding}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>BorderRadius: {borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="36"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Elevation: {elevation}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={elevation}
                  onChange={(e) => setElevation(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Rotation: {rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Generated Dart snippet */}
            <pre className="p-3 bg-slate-950 rounded-xl text-[10px] text-cyan-300 font-mono overflow-x-auto border border-slate-800 leading-relaxed">
              {flutterContainerDart}
            </pre>
          </div>
        )}

        {/* Tab 3: Dev Notes */}
        {activeSubTab === 'notes' && (
          <div className="flex flex-col h-full space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Persistent Scratchpad
              </span>
              <span className="text-[10px] text-emerald-400">
                {noteSaved ? '✓ Saved' : 'Saving...'}
              </span>
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Jot down Flutter architectural notes, state decisions..."
              className="flex-1 w-full h-80 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
};
