import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Filter, X } from 'lucide-react';
import { TaskItem } from '../../types/flutter';
import { sounds } from '../../utils/audio';

interface TasksScreenProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onDeleteTask: (id: string) => void;
  primaryColor: string;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  primaryColor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<TaskItem['category']>('Engineering');
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('medium');

  const categories = ['All', 'Engineering', 'Design', 'Mobile', 'AI'];

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category === selectedCategory;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
      priority: newPriority,
    });
    sounds.playSuccess();
    setNewTitle('');
    setIsAdding(false);
  };

  const handleToggle = (id: string) => {
    sounds.playTap();
    onToggleTask(id);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-slate-100">
      {/* Category selector row */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sounds.playTap();
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No tasks in this category</p>
            <p className="text-xs text-slate-500 mt-1">Tap the plus button below to create one.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                task.completed
                  ? 'bg-slate-900/50 border-slate-800/80 opacity-60'
                  : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600 shadow-sm'
              }`}
            >
              <button
                onClick={() => handleToggle(task.id)}
                className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium leading-relaxed ${
                    task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                  }`}
                >
                  {task.title}
                </p>
                {/* Clean unboxed metadata with bullet separators (anti-slop rule) */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                  <span>{task.category}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      task.priority === 'high'
                        ? 'text-rose-400 font-semibold'
                        : task.priority === 'medium'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }
                  >
                    {task.priority.toUpperCase()}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{task.createdAt}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playTap();
                  onDeleteTask(task.id);
                }}
                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Floating Add Task Trigger */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-sm shrink-0 flex items-center justify-between">
        <span className="text-xs text-slate-400 tabular-nums">
          {filteredTasks.filter((t) => t.completed).length} of {filteredTasks.length} done
        </span>
        <button
          onClick={() => {
            sounds.playTap();
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-md transition-transform active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* New Task Sheet Modal */}
      {isAdding && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Create JhonX Task</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement Flutter Riverpod state provider..."
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskItem['category'])}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Mobile">Mobile</option>
                    <option value="AI">AI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskItem['priority'])}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: primaryColor }}
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
