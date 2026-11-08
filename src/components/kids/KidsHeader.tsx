import React from 'react';
import { Volume2, VolumeX, Sparkles, Star, Download, ShieldCheck, Palette, Mic, Train, MessageSquare, BookOpen } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface KidsHeaderProps {
  activeTab: 'phonics' | 'sentences' | 'stories' | 'stickers' | 'station' | 'parents';
  onSelectTab: (tab: 'phonics' | 'sentences' | 'stories' | 'stickers' | 'station' | 'parents') => void;
  starsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExportZip: () => void;
}

export const KidsHeader: React.FC<KidsHeaderProps> = ({
  activeTab,
  onSelectTab,
  starsCount,
  soundEnabled,
  onToggleSound,
  onExportZip,
}) => {
  return (
    <header className="relative z-30 px-4 py-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b-4 border-amber-400 shadow-lg select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* LOGO DA AVENTURA (Com o Ônibus Vermelho e Título Brincalhão) */}
        <div
          onClick={() => {
            sounds.playBusHorn();
            onSelectTab('phonics');
          }}
          className="flex items-center gap-3 cursor-pointer group transform hover:scale-105 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-md border-2 border-white flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">
            🚌
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-wider text-rose-500 drop-shadow-sm font-['Fredoka']">
                JHONX
              </span>
              <span className="text-2xl font-black tracking-wide text-sky-500 font-['Fredoka']">
                LONDON
              </span>
            </div>
            <p className="text-[11px] font-bold text-amber-500 tracking-wide -mt-1 font-['Fredoka']">
              Urban Phonics Adventure 🇬🇧✨
            </p>
          </div>
        </div>

        {/* FUN PLAYFUL NAVIGATION BUTTONS (UK English) */}
        <nav className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-inner flex-wrap justify-center">
          {/* 1. WORDS (PHONICS) */}
          <button
            onClick={() => {
              sounds.playTap();
              onSelectTab('phonics');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl font-['Fredoka'] font-bold text-xs sm:text-sm transition-all duration-200 transform active:scale-95 ${
              activeTab === 'phonics'
                ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-white shadow-md scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Words 🔤</span>
          </button>

          {/* 2. SHORT SENTENCES */}
          <button
            onClick={() => {
              sounds.playTap();
              onSelectTab('sentences');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl font-['Fredoka'] font-bold text-xs sm:text-sm transition-all duration-200 transform active:scale-95 ${
              activeTab === 'sentences'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Sentences 💬</span>
          </button>

          {/* 3. SHORT STORIES */}
          <button
            onClick={() => {
              sounds.playTap();
              onSelectTab('stories');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl font-['Fredoka'] font-bold text-xs sm:text-sm transition-all duration-200 transform active:scale-95 ${
              activeTab === 'stories'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:text-purple-500'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Stories 📖</span>
          </button>

          {/* 4. STICKER BOOK */}
          <button
            onClick={() => {
              sounds.playTap();
              onSelectTab('stickers');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-2xl font-['Fredoka'] font-bold text-xs sm:text-sm transition-all duration-200 transform active:scale-95 ${
              activeTab === 'stickers'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:text-pink-500'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Stickers 🎨</span>
          </button>

          {/* 5. UNDERGROUND */}
          <button
            onClick={() => {
              sounds.playTap();
              onSelectTab('station');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-2xl font-['Fredoka'] font-bold text-xs sm:text-sm transition-all duration-200 transform active:scale-95 ${
              activeTab === 'station'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>Underground 🚇</span>
          </button>

          {/* 6. PARENTS */}
          <button
            onClick={() => {
              sounds.playTap();
              onSelectTab('parents');
            }}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-2xl font-['Fredoka'] font-semibold text-xs transition-all duration-200 ${
              activeTab === 'parents'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-500 hover:text-emerald-500'
            }`}
            title="Parents & Educators Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Parents 🛡️</span>
          </button>
        </nav>

        {/* TOP CONTROLS: STARS BANK, SOUND TOGGLE & EXPORT */}
        <div className="flex items-center gap-3">
          {/* Child's Gold Star Bank */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 text-slate-900 rounded-2xl font-['Fredoka'] font-black text-sm shadow-md border-2 border-amber-300 animate-pulse">
            <Star className="w-4 h-4 fill-amber-900 text-amber-900" />
            <span className="tabular-nums">{starsCount}</span>
            <span className="text-xs uppercase">Stars</span>
          </div>

          {/* GLOBAL SOUND BUTTON (Pinned Top Right) */}
          <button
            onClick={onToggleSound}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-90 border-2 ${
              soundEnabled
                ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white border-emerald-300 shadow-emerald-500/30'
                : 'bg-gradient-to-br from-rose-400 to-red-500 text-white border-rose-300 shadow-rose-500/30'
            }`}
            title={soundEnabled ? 'Mute British Audio' : 'Unmute British Audio'}
            aria-label={soundEnabled ? 'Mute British sound' : 'Unmute British sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 animate-bounce" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

          {/* Export Flutter Project .zip */}
          <button
            onClick={onExportZip}
            className="p-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            title="Download official Flutter project (.zip)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
