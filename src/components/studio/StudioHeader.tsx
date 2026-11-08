import React from 'react';
import { Download, Zap, RotateCw, Smartphone, Volume2, VolumeX } from 'lucide-react';
import { StudioTab, DeviceType } from '../../types/flutter';
import { sounds } from '../../utils/audio';

interface StudioHeaderProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  deviceType: DeviceType;
  onSelectDevice: (device: DeviceType) => void;
  onHotReload: () => void;
  onHotRestart: () => void;
  onExportZip: () => void;
  isHotReloading: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  activeTab,
  onSelectTab,
  deviceType,
  onSelectDevice,
  onHotReload,
  onHotRestart,
  onExportZip,
  isHotReloading,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Bar Contract (Zone 1: Wordmark — Zone 2: Nav links — Zone 3: 1 Primary Action) */}
      <div className="flex items-center justify-between gap-8 px-6 py-3.5 max-w-7xl mx-auto">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
            JX
          </div>
          <a
            href="/"
            className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-cyan-300 transition-colors"
          >
            JhonX Flutter Studio
          </a>
        </div>

        {/* Zone 2: 4 single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('preview')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'preview' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Live Device
          </button>
          <button
            onClick={() => onSelectTab('code')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'code' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Dart Codebase
          </button>
          <button
            onClick={() => onSelectTab('inspector')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'inspector' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Widget Inspector
          </button>
          <button
            onClick={() => onSelectTab('terminal')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'terminal' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Flutter CLI
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onExportZip}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-md transition-all whitespace-nowrap shrink-0 active:scale-95"
            title="Download full Flutter source project as .zip"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Flutter (.zip)</span>
          </button>
        </div>
      </div>

      {/* Secondary Studio Toolbar */}
      <div className="border-t border-slate-800/60 bg-slate-950/60 px-6 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto text-xs">
          {/* Device Model Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Preview Frame:
            </span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => {
                  sounds.playTap();
                  onSelectDevice('iphone-16');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  deviceType === 'iphone-16'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                iPhone 16 Pro
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  onSelectDevice('pixel-9');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  deviceType === 'pixel-9'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pixel 9 Pro
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  onSelectDevice('borderless');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  deviceType === 'borderless'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Clean Edge
              </button>
            </div>
          </div>

          {/* Quick Actions: Hot Reload, Hot Restart, and Sound Toggle */}
          <div className="flex items-center gap-2">
            {/* Global Sound Button */}
            <button
              onClick={onToggleSound}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all active:scale-95 text-[11px] font-medium ${
                soundEnabled
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
              }`}
              title={soundEnabled ? 'Mute all phonics feedback and UI sound effects' : 'Unmute phonics feedback and UI sound effects'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>{soundEnabled ? 'Audio: ON' : 'Audio: MUTED'}</span>
            </button>

            <button
              onClick={onHotReload}
              disabled={isHotReloading}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all active:scale-95 text-[11px] font-medium"
              title="Hot Reload (Press 'r' in terminal)"
            >
              <Zap className={`w-3.5 h-3.5 ${isHotReloading ? 'animate-spin' : ''}`} />
              <span>Hot Reload (r)</span>
            </button>

            <button
              onClick={onHotRestart}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95 text-[11px] font-medium"
              title="Hot Restart (Press 'R' in terminal)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Hot Restart (R)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
