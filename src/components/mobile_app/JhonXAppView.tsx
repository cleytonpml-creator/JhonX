import React, { useState } from 'react';
import { JhonxOnboardingScreen } from './JhonxOnboardingScreen';
import { PhonicsChallengeScreen } from './PhonicsChallengeScreen';
import { StickerBookScreen } from './StickerBookScreen';
import { ParentDashboardScreen } from './ParentDashboardScreen';
import { Train, Mic, Palette, Shield, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface JhonXAppViewProps {
  showDebugBanner: boolean;
  highlightWidgetId: string | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const JhonXAppView: React.FC<JhonXAppViewProps> = ({
  showDebugBanner,
  highlightWidgetId,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeScreen, setActiveScreen] = useState<'onboarding' | 'challenge' | 'stickers' | 'parents'>('challenge');
  const [explorerName, setExplorerName] = useState<string>('Alex');
  const [selectedRoute, setSelectedRoute] = useState<number>(2); // Default route 2 (Word Explorer)
  const [unlockedStickerIds, setUnlockedStickerIds] = useState<string[]>(['1', '2']);
  const [soundToast, setSoundToast] = useState<string | null>(null);

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    onToggleSound();
    if (nextState) {
      sounds.playTap();
      setSoundToast('Sound & Speech Active 🔊');
    } else {
      setSoundToast('Sound & Speech Muted 🔇');
    }

    setTimeout(() => {
      setSoundToast(null);
    }, 2000);
  };

  const handleOnboardingComplete = (name: string, routeId: number) => {
    setExplorerName(name);
    setSelectedRoute(routeId);
    setActiveScreen('challenge');
  };

  const handleWordComplete = (word: string) => {
    // Unlock Bulldog do Skate ('3') when CAT or other word is completed
    if (!unlockedStickerIds.includes('3')) {
      setUnlockedStickerIds((prev) => [...prev, '3']);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#121212] text-white overflow-hidden select-none">
      {/* Flutter Debug Ribbon in top right corner (if active) */}
      {showDebugBanner && (
        <div className="absolute top-2 -right-8 z-50 pointer-events-none rotate-45 bg-rose-600/90 text-white font-mono text-[8px] font-bold py-0.5 px-8 shadow-sm">
          DEBUG
        </div>
      )}

      {/* Global Sound Toggle Button in the Top-Right Corner */}
      <div className="absolute top-3 right-3.5 z-40 flex items-center gap-1.5">
        <button
          onClick={handleToggleSound}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-90 ${
            soundEnabled
              ? 'bg-[#1e1e1e] border-2 border-[#00ff66]/50 text-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.3)] hover:border-[#00ff66]'
              : 'bg-[#1e1e1e] border-2 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)] hover:border-rose-400'
          }`}
          title={soundEnabled ? 'Global Sound: Enabled (Tap to mute phonics & effects)' : 'Global Sound: Muted (Tap to unmute)'}
          aria-label={soundEnabled ? 'Mute sound effects and speech' : 'Unmute sound effects and speech'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 transition-transform duration-200" />
          ) : (
            <VolumeX className="w-4 h-4 transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Quick Sound Notification Toast */}
      {soundToast && (
        <div className="absolute top-14 right-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
          <div
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono shadow-xl border backdrop-blur-md ${
              soundEnabled
                ? 'bg-slate-900/95 text-[#00ff66] border-[#00ff66]/40'
                : 'bg-slate-900/95 text-rose-300 border-rose-500/40'
            }`}
          >
            {soundToast}
          </div>
        </div>
      )}

      {/* Widget inspector highlight overlay */}
      {highlightWidgetId && (
        <div className="absolute inset-0 z-40 border-2 border-cyan-400 bg-cyan-400/5 pointer-events-none flex items-start justify-start p-1">
          <span className="bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            {highlightWidgetId}
          </span>
        </div>
      )}

      {/* Screen Body */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {activeScreen === 'onboarding' && (
          <JhonxOnboardingScreen
            onComplete={handleOnboardingComplete}
            initialName={explorerName}
            initialRoute={selectedRoute}
          />
        )}
        {activeScreen === 'challenge' && (
          <PhonicsChallengeScreen onWordComplete={handleWordComplete} />
        )}
        {activeScreen === 'stickers' && (
          <StickerBookScreen
            onBackToChallenge={() => setActiveScreen('challenge')}
            unlockedStickers={unlockedStickerIds}
          />
        )}
        {activeScreen === 'parents' && (
          <ParentDashboardScreen
            explorerName={explorerName}
            onBackToApp={() => setActiveScreen('challenge')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Jhonx London 4-Destination Bar) */}
      <nav className="h-14 px-2 border-t border-slate-800/80 bg-[#121212] flex items-center justify-around shrink-0 z-30">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveScreen('onboarding');
          }}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
            activeScreen === 'onboarding'
              ? 'text-[#ffaa00] font-bold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeScreen === 'onboarding' ? 'bg-[#ffaa00]/15' : ''
            }`}
          >
            <Train className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-mono">
            Station
          </span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveScreen('challenge');
          }}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
            activeScreen === 'challenge'
              ? 'text-[#00e5ff] font-bold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeScreen === 'challenge' ? 'bg-[#00e5ff]/15' : ''
            }`}
          >
            <Mic className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-mono">
            Phonics
          </span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveScreen('stickers');
          }}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
            activeScreen === 'stickers'
              ? 'text-[#ff0055] font-bold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeScreen === 'stickers' ? 'bg-[#ff0055]/15' : ''
            }`}
          >
            <Palette className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-mono">
            Stickers
          </span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveScreen('parents');
          }}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
            activeScreen === 'parents'
              ? 'text-[#00ff66] font-bold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeScreen === 'parents' ? 'bg-[#00ff66]/15' : ''
            }`}
          >
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-mono">
            Parents
          </span>
        </button>
      </nav>
    </div>
  );
};
