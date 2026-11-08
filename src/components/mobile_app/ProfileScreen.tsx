import React from 'react';
import { Volume2, VolumeX, Smartphone, Palette, ShieldCheck, Github, ExternalLink } from 'lucide-react';
import { AppThemeStyle, FlutterColorSeed } from '../../types/flutter';
import { sounds } from '../../utils/audio';

interface ProfileScreenProps {
  themeStyle: AppThemeStyle;
  onSetThemeStyle: (style: AppThemeStyle) => void;
  showDebugBanner: boolean;
  onToggleDebugBanner: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeSeedIndex: number;
  onSelectSeed: (index: number) => void;
  colorSeeds: FlutterColorSeed[];
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  themeStyle,
  onSetThemeStyle,
  showDebugBanner,
  onToggleDebugBanner,
  soundEnabled,
  onToggleSound,
  activeSeedIndex,
  onSelectSeed,
  colorSeeds,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-slate-100">
      {/* Profile Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center gap-3.5 shadow-md">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg shrink-0"
          style={{ backgroundColor: colorSeeds[activeSeedIndex].primary }}
        >
          JX
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-white truncate">JhonX Developer</h2>
          <p className="text-xs text-cyan-400 font-mono">@jhonx_app · Mobile Engineer</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
            <span>Flutter 3.29</span>
            <span aria-hidden="true">·</span>
            <span>Dart 3.7</span>
            <span aria-hidden="true">·</span>
            <span>Stable</span>
          </div>
        </div>
      </div>

      {/* Flutter App Customization */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Flutter System Configuration
        </h3>

        {/* Color Seed Picker */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              Theme Seed Color
            </span>
            <span className="text-[11px] text-slate-400">
              {colorSeeds[activeSeedIndex].name}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {colorSeeds.map((seed, idx) => (
              <button
                key={seed.name}
                onClick={() => {
                  sounds.playTap();
                  onSelectSeed(idx);
                }}
                className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                  activeSeedIndex === idx
                    ? 'ring-2 ring-white scale-110 shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: seed.primary }}
                title={seed.name}
              />
            ))}
          </div>
        </div>

        {/* Design System Style: Material 3 vs Cupertino */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-200 block">Design System</span>
            <span className="text-[10px] text-slate-400">
              {themeStyle === 'material3' ? 'Material 3 (Android)' : 'Cupertino (iOS)'}
            </span>
          </div>
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => {
                sounds.playTap();
                onSetThemeStyle('material3');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                themeStyle === 'material3'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Material 3
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                onSetThemeStyle('cupertino');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                themeStyle === 'cupertino'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cupertino
            </button>
          </div>
        </div>

        {/* Debug Ribbon Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-200 block">Flutter DEBUG Banner</span>
            <span className="text-[10px] text-slate-400">Show top-right debug banner</span>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onToggleDebugBanner();
            }}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              showDebugBanner ? 'bg-cyan-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                showDebugBanner ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Haptic sound toggle */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <div>
              <span className="text-xs font-medium text-slate-200 block">Sound & Tactile Feedback</span>
              <span className="text-[10px] text-slate-400">Synthesized audio cues</span>
            </div>
          </div>
          <button
            onClick={() => {
              onToggleSound();
              sounds.playTap();
            }}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              soundEnabled ? 'bg-cyan-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                soundEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Flutter SDK Info */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-slate-400 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Flutter SDK Environment</span>
        </div>
        <div className="text-[11px] space-y-1 font-mono text-slate-400">
          <div>Framework: Flutter 3.29.0-stable</div>
          <div>Dart SDK: version 3.7.0</div>
          <div>Platform: iOS & Android (Multi-target)</div>
          <div>Package: jhonx_app (v1.0.0+1)</div>
        </div>
      </div>
    </div>
  );
};
