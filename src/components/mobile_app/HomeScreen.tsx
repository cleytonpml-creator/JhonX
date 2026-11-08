import React, { useState } from 'react';
import { Plus, RotateCcw, CheckCircle2, Flame, Sparkles, ArrowRight, Zap, Target } from 'lucide-react';
import { TaskItem } from '../../types/flutter';
import { sounds } from '../../utils/audio';

interface HomeScreenProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onNavigateTab: (tabIndex: number) => void;
  primaryColor: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tasks,
  onToggleTask,
  onNavigateTab,
  primaryColor,
}) => {
  const [counter, setCounter] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [lastTapTime, setLastTapTime] = useState<number>(0);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleIncrement = () => {
    const now = Date.now();
    sounds.playTap();
    if (now - lastTapTime < 800) {
      setCombo((c) => c + 1);
    } else {
      setCombo(1);
    }
    setLastTapTime(now);
    setCounter((c) => c + 1);
  };

  const handleReset = () => {
    sounds.playTap();
    setCounter(0);
    setCombo(0);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-slate-100">
      {/* Welcome Banner Card */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/60 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flutter M3 Runtime</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Welcome, JhonX
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your mobile productivity hub is live & hot-reload ready.
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            JX
          </div>
        </div>

        {/* Metric stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/50 text-center">
          <div className="bg-slate-950/40 rounded-lg p-2">
            <span className="text-xs text-slate-400 block">Pending</span>
            <span className="text-sm font-bold text-white tabular-nums">{pendingTasks.length}</span>
          </div>
          <div className="bg-slate-950/40 rounded-lg p-2">
            <span className="text-xs text-slate-400 block">Completed</span>
            <span className="text-sm font-bold text-emerald-400 tabular-nums">{completedTasks.length}</span>
          </div>
          <div className="bg-slate-950/40 rounded-lg p-2">
            <span className="text-xs text-slate-400 block">Streak</span>
            <span className="text-sm font-bold text-amber-400 tabular-nums">7 Days</span>
          </div>
        </div>
      </div>

      {/* Flutter Signature Counter Widget (Material 3 style) */}
      <div className="rounded-2xl p-4 bg-slate-800/60 border border-slate-700/60 shadow-sm text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Flutter State Demo</span>
        </div>
        <p className="text-xs text-slate-300">
          You have pushed the button this many times:
        </p>
        <div className="my-3 flex items-center justify-center gap-2">
          <span
            className="text-4xl font-extrabold tabular-nums tracking-tight transition-transform"
            style={{ color: primaryColor }}
          >
            {counter}
          </span>
          {combo > 2 && (
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-bounce">
              <Flame className="w-3 h-3 text-amber-400" />
              {combo}x
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleIncrement}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tap Flutter</span>
          </button>
        </div>
      </div>

      {/* Quick Launch Shortcuts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </h3>
          <button
            onClick={() => onNavigateTab(2)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            All Tools <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigateTab(1)}
            className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 text-left transition-colors flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Tasks Board</span>
              <span className="text-[10px] text-slate-400">{pendingTasks.length} pending</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab(2)}
            className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 text-left transition-colors flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Focus Timer</span>
              <span className="text-[10px] text-slate-400">Pomodoro 25m</span>
            </div>
          </button>
        </div>
      </div>

      {/* Priority Tasks List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Priority Workspace Tasks
          </h3>
          <button
            onClick={() => onNavigateTab(1)}
            className="text-xs text-slate-400 hover:text-white"
          >
            View all ({tasks.length})
          </button>
        </div>

        <div className="space-y-1.5">
          {tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}}
                  className="rounded text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer bg-slate-900 border-slate-600"
                />
                <span
                  className={`text-xs truncate ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
                  }`}
                >
                  {task.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900/60 shrink-0">
                {task.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
