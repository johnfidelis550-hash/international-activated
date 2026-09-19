import React from 'react';
import { IntakeRecord } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  User,
  Hash,
  Mail,
  Shield,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface OperationalStatusScreenProps {
  record: IntakeRecord;
  onEnterAdminPortal: () => void;
  onResetWorkflow: () => void;
}

export const OperationalStatusScreen: React.FC<OperationalStatusScreenProps> = ({
  record,
  onEnterAdminPortal,
  onResetWorkflow,
}) => {
  return (
    <div id="operational-status-view" className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-9 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-md">
        {/* Top Status Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />

        {/* Verification Success Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Record Verification Complete
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending Review
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographic hash generated. Registered in institutional compliance ledger.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-slate-950 border border-slate-800 text-slate-300">
            <Lock className="w-3 h-3 text-emerald-400" />
            TLS 1.3 / AES-256
          </span>
        </div>

        {/* Record Metadata Grid */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Record ID
            </span>
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {record.recordId || 'REC-2026-PENDING'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
              </span>
              <p className="font-semibold text-white pl-5">{record.fullName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Account ID
              </span>
              <p className="font-mono font-semibold text-slate-200 pl-5">{record.accountId}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Business Email
              </span>
              <p className="font-semibold text-slate-200 pl-5 truncate">
                {record.businessEmail || record.contactEmail}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Submitted Timestamp
              </span>
              <p className="font-mono text-[11px] text-slate-300 pl-5">
                {record.submittedAt || new Date().toISOString().substring(0, 19) + ' UTC'}
              </p>
            </div>
          </div>

          {/* Verification Digest */}
          <div className="border-t border-slate-800/60 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-slate-400" /> Ledger Verification Hash:
            </span>
            <span className="font-mono text-emerald-400 truncate">
              {record.verificationHash || 'SHA256:4f8e9102c918bb12a9'}
            </span>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/30 text-xs text-blue-200/80 mb-7 space-y-1 leading-relaxed">
          <p className="font-semibold text-blue-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Compliance Queue Notification
          </p>
          <p>
            Your corporate profile record has been enrolled into the administrative review pipeline. An authenticated system administrator will evaluate the identity attributes against organizational governance policies.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-goto-admin-gateway"
            type="button"
            onClick={onEnterAdminPortal}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Enter Administrative Review Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="btn-register-another"
            type="button"
            onClick={onResetWorkflow}
            className="w-full sm:w-auto py-3 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
