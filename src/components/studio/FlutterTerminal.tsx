import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, CheckCircle2 } from 'lucide-react';
import { TerminalEntry } from '../../types/flutter';
import { sounds } from '../../utils/audio';

interface FlutterTerminalProps {
  onHotReload: () => void;
  onHotRestart: () => void;
}

export const FlutterTerminal: React.FC<FlutterTerminalProps> = ({
  onHotReload,
  onHotRestart,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      type: 'input',
      text: '$ cd jhonx_app',
      timestamp: '10:00:01',
    },
    {
      id: 'init-2',
      type: 'output',
      text: 'Working directory: /app/applet/jhonx_app',
      timestamp: '10:00:01',
    },
    {
      id: 'init-3',
      type: 'input',
      text: '$ code lib/screens/parent_audio_player_screen.dart',
      timestamp: '10:00:04',
    },
    {
      id: 'init-4',
      type: 'output',
      text: 'Loaded ParentAudioPlayerScreen ("KIDS VOICES 🎧") into jhonx_app:\n• ParentAudioRecording model (id, word, dateString, duration, wasPerfect)\n• 52x52 animated circular play/pause buttons (#00ff66)\n• "PERFECT" badge with neon green border\n• Pulling offline recordings from table_history\n• Audioplayers playback integration ready',
      timestamp: '10:00:06',
    },
    {
      id: 'init-5',
      type: 'success',
      text: '⚡ Performing hot reload for Kids Voices Audio Player...\nReloaded in 92ms. Offline voice player active.',
      timestamp: '10:00:08',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    sounds.playTap();
    const newEntry: TerminalEntry = {
      id: `cmd-${Date.now()}`,
      type: 'input',
      text: `$ ${cmd}`,
      timestamp: new Date().toLocaleTimeString(),
    };

    let reply: TerminalEntry | null = null;
    const lower = cmd.toLowerCase();

    if (lower === 'r' || lower === 'hot reload') {
      onHotReload();
      reply = {
        id: `reply-${Date.now()}`,
        type: 'success',
        text: '⚡ Performing hot reload for Jhonx London...\nReloaded in 96ms. Audio player state synchronized.',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (lower === 'r' || lower === 'hot restart') {
      onHotRestart();
      reply = {
        id: `reply-${Date.now()}`,
        type: 'info',
        text: '🔄 Performing hot restart...\nResetting audio player queue.',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (lower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (lower.includes('play') || lower.includes('audio') || lower.includes('cat')) {
      sounds.speakBritish('CAT');
      reply = {
        id: `reply-${Date.now()}`,
        type: 'success',
        text: '[Audioplayer] Playing offline recording: /data/user/0/.../rec_cat.m4a\nDuration: 0:02 | Status: PERFECT (was_perfect: 1)',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (lower === 'flutter test') {
      reply = {
        id: `reply-${Date.now()}`,
        type: 'success',
        text: '00:01 +1: Audio player test - Renders Kids Voices list [PASS]\n00:02 +2: Play button test - Toggles play and pause state [PASS]\n00:03 +3: Perfect badge test - Displays only when wasPerfect is true [PASS]\n✓ All tests passed!',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (lower === 'help' || lower === 'h') {
      reply = {
        id: `reply-${Date.now()}`,
        type: 'info',
        text: 'Commands:\n  r               - Hot reload\n  R               - Hot restart\n  play            - Simulate offline voice playback\n  flutter test    - Run widget test suite\n  clear           - Clear terminal',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else {
      reply = {
        id: `reply-${Date.now()}`,
        type: 'output',
        text: `Executing: ${cmd}\nCommand processed in jhonx_app audio engine. Type "help" for options.`,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    setHistory((prev) => [...prev, newEntry, ...(reply ? [reply] : [])]);
    setInputVal('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-mono">
      {/* Terminal Title Bar */}
      <div className="h-10 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">Flutter CLI · Kids Voices Audio Player (jhonx_app)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistory([])}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Audioplayer Ready</span>
          </div>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs leading-relaxed">
        {history.map((entry) => (
          <div key={entry.id} className="space-y-0.5">
            {entry.type === 'input' ? (
              <div className="text-cyan-400 font-bold">{entry.text}</div>
            ) : entry.type === 'success' ? (
              <div className="text-emerald-400 whitespace-pre-wrap">{entry.text}</div>
            ) : entry.type === 'info' ? (
              <div className="text-amber-300 whitespace-pre-wrap">{entry.text}</div>
            ) : (
              <div className="text-slate-300 whitespace-pre-wrap">{entry.text}</div>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Command Input */}
      <form
        onSubmit={handleCommand}
        className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <span className="text-cyan-400 font-bold text-xs select-none pl-2">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Try: 'play', 'r' (hot reload), 'flutter test', 'help'..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Send command"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
