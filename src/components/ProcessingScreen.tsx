import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { IntakeRecord } from '../types';

interface ProcessingScreenProps {
  intakeRecord?: IntakeRecord;
  onReset: () => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  intakeRecord,
  onReset,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const processingSteps = [
    'Submitting credentials to authentication server...',
    'Verifying account status and access permissions...',
    'Establishing secure network handshake...',
    'Routing institutional gateway request...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % processingSteps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [processingSteps.length]);

  return (
    <div
      id="processing-waiting-screen"
      className="min-h-[80vh] w-full flex flex-col justify-center items-center py-10 px-4 select-none"
    >
      <div
        id="processing-card"
        className="w-full max-w-[440px] bg-[#101920]/85 backdrop-blur-xl border border-emerald-800/25 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/80 text-center relative overflow-hidden"
      >
        {/* Top subtle emerald gradient glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-green-400 to-emerald-500 animate-pulse" />

        {/* Animated Processing Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping opacity-30" />
          <div className="absolute inset-1 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        </div>

        {/* Title & Status Message */}
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">
          Processing Information
        </h2>
        
        <p className="text-sm text-slate-300 font-normal leading-relaxed mb-6">
          Please wait while your information is being processed. This may take a few moments.
        </p>

        {/* Live Status Pill */}
        <div className="bg-[#0b141c] border border-emerald-900/40 rounded-xl p-3.5 mb-6 text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400/90 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              STATUS
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Active Request</span>
          </div>
          <p className="text-xs text-slate-200 font-medium transition-all duration-300 min-h-[20px]">
            {processingSteps[currentStepIndex]}
          </p>
        </div>

        {/* Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-200/60 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Do not refresh or close this window</span>
        </div>

        {/* Action to Return or Reset */}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-300/70 hover:text-emerald-200 transition-colors py-2 px-3 rounded-lg hover:bg-black/20 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to beginning</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-emerald-200/40">
        <p>© 2026 NETInternet Secure Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};
