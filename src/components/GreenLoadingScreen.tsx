import React, { useState, useEffect } from 'react';
import { ShieldCheck, Network, Lock, Wifi } from 'lucide-react';

interface GreenLoadingScreenProps {
  onComplete: () => void;
  entityName?: string;
}

export const GreenLoadingScreen: React.FC<GreenLoadingScreenProps> = ({
  onComplete,
  entityName,
}) => {
  const [progress, setProgress] = useState(12);
  const [statusText, setStatusText] = useState('Verifying administrative record...');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 12) + 8;
        if (next >= 100) {
          clearInterval(interval);
          setStatusText('Secure tunnel established. Initializing portal...');
          setTimeout(() => {
            onComplete();
          }, 350);
          return 100;
        }

        if (next > 75) {
          setStatusText('Loading authentication gateway & network endpoints...');
        } else if (next > 45) {
          setStatusText('Establishing encrypted zero-trust handshake...');
        } else if (next > 25) {
          setStatusText(`Registering institution node for ${entityName || 'Corporate Entity'}...`);
        }
        return next;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete, entityName]);

  return (
    <div
      id="green-loading-screen"
      className="min-h-[75vh] w-full flex flex-col items-center justify-center px-4"
    >
      <div className="w-full max-w-md bg-[#0e1e1b]/80 backdrop-blur-xl border border-emerald-800/30 rounded-2xl p-8 shadow-2xl shadow-black/60 text-center relative overflow-hidden">
        {/* Subtle top indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-300 animate-pulse" />

        {/* Center Animated Node Graphic */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping opacity-40" />
          <div className="absolute inset-1 rounded-full border border-emerald-400/40 animate-spin" />
          <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
            <Wifi className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Status Header */}
        <div className="space-y-1 mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" /> Encrypted Transition
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Connecting to Network
          </h2>
          <p className="text-xs text-emerald-200/70 truncate max-w-xs mx-auto">
            {statusText}
          </p>
        </div>

        {/* Green Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-300/80">
            <span>NETWORK TUNNEL</span>
            <span className="font-bold text-emerald-400">{Math.min(100, progress)}%</span>
          </div>

          <div className="w-full h-3 bg-[#081512] rounded-full overflow-hidden p-0.5 border border-emerald-800/40">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-300 rounded-full transition-all duration-200 ease-out shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Security Tagline */}
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-emerald-900/30 text-[11px] text-emerald-300/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>FIPS 140-3 &bull; TLS 1.3 Certified Channel</span>
        </div>

        {/* Quick Skip Button for Testing */}
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 text-[11px] text-emerald-400/60 hover:text-emerald-300 underline transition-colors cursor-pointer"
        >
          Skip animation
        </button>
      </div>
    </div>
  );
};
