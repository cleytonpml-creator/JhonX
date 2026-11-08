import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import { DeviceType } from '../../types/flutter';

interface PhoneFrameProps {
  deviceType: DeviceType;
  isHotReloading: boolean;
  highlightWidgetId: string | null;
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  deviceType,
  isHotReloading,
  children,
}) => {
  const currentTime = '09:41';

  return (
    <div className="relative flex items-center justify-center p-2 select-none">
      {/* Device Body Container */}
      <div
        className={`relative transition-all duration-300 shadow-2xl overflow-hidden ${
          deviceType === 'iphone-16'
            ? 'w-[375px] h-[780px] rounded-[52px] border-[11px] border-slate-900 ring-1 ring-slate-800 bg-slate-950'
            : deviceType === 'pixel-9'
            ? 'w-[375px] h-[780px] rounded-[44px] border-[10px] border-slate-800 ring-1 ring-slate-700 bg-slate-950'
            : 'w-[375px] h-[780px] rounded-[28px] border-[2px] border-slate-700 bg-slate-950'
        }`}
      >
        {/* Exterior physical buttons simulation for phone */}
        {deviceType !== 'borderless' && (
          <>
            <div className="absolute -left-[14px] top-28 w-[3px] h-10 bg-slate-800 rounded-l-md pointer-events-none" />
            <div className="absolute -left-[14px] top-42 w-[3px] h-12 bg-slate-800 rounded-l-md pointer-events-none" />
            <div className="absolute -right-[14px] top-36 w-[3px] h-16 bg-slate-800 rounded-r-md pointer-events-none" />
          </>
        )}

        {/* Mobile Status Bar */}
        <div className="relative z-30 h-11 px-6 flex items-center justify-between text-xs font-semibold tracking-tight text-white/90 select-none pointer-events-none">
          <span className="tabular-nums text-[13px]">{currentTime}</span>

          {/* iPhone Dynamic Island or Pixel Camera cutout */}
          {deviceType === 'iphone-16' && (
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-6 bg-black rounded-full flex items-center justify-between px-2.5 text-[10px] text-white/80 ring-1 ring-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/90 animate-pulse" />
              <span className="text-[10px] text-cyan-300 font-mono tracking-wider">JhonX</span>
              <span className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
          )}

          {deviceType === 'pixel-9' && (
            <div className="absolute left-1/2 -translate-x-1/2 top-3 w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-700" />
          )}

          <div className="flex items-center gap-1.5 text-white/80">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Application Viewport */}
        <div className="relative w-full h-[calc(100%-44px)] overflow-hidden flex flex-col bg-slate-900 text-slate-100">
          {children}

          {/* Hot Reload flash feedback */}
          {isHotReloading && (
            <div className="absolute inset-0 z-50 bg-cyan-400/20 backdrop-blur-[1px] animate-pulse flex items-center justify-center pointer-events-none transition-opacity duration-300">
              <div className="px-4 py-2 bg-slate-900/90 text-cyan-300 text-xs font-mono font-medium rounded-full shadow-lg border border-cyan-500/40 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ⚡ Flutter Hot Reloaded
              </div>
            </div>
          )}

          {/* Bottom gesture home bar indicator */}
          <div className="h-6 w-full flex items-center justify-center shrink-0 pointer-events-none">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
