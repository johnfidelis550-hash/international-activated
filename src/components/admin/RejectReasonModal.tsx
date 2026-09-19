import React, { useState } from 'react';
import { IntakeRecord, AdminSession } from '../../types';
import {
  X,
  AlertTriangle,
  FileEdit,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

interface RejectReasonModalProps {
  record: IntakeRecord;
  session: AdminSession;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (recordId: string, remediationNote: string) => void;
}

const PRESET_REASONS = [
  'Identity mismatch with institutional HR/LDAP directory records.',
  'Account ID not registered or lacking active enterprise licensing tier.',
  'Business email domain failed corporate DMARC/SPF authentication.',
  'Missing mandatory departmental supervisor clearance code.',
  'Security compliance standard documentation expired or incomplete.',
];

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  record,
  session,
  isOpen,
  onClose,
  onConfirmReject,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customFeedback, setCustomFeedback] = useState<string>(record.remediationNote || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (reason: string) => {
    setSelectedPreset(reason);
    setCustomFeedback(reason);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customFeedback.trim();
    if (!finalReason) {
      setError('Please specify a remediation reason or select a preset note.');
      return;
    }

    onConfirmReject(record.recordId, finalReason);
    onClose();
  };

  return (
    <div
      id="modal-reject-remediation-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="modal-reject-remediation-dialog"
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-rose-50/70 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                Remediation Guidance Feedback
              </h3>
              <p className="text-xs text-slate-500">
                Record ID: <span className="font-mono font-medium text-slate-700">{record.recordId}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Target Record Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] font-semibold uppercase block">CANDIDATE</span>
              <span className="text-slate-900 font-semibold truncate block">
                {record.fullName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-semibold uppercase block">ACCOUNT ID</span>
              <span className="text-slate-800 font-mono font-medium truncate block">{record.accountId}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] font-semibold uppercase block">EMAIL</span>
              <span className="text-slate-700 truncate block">{record.businessEmail || record.contactEmail}</span>
            </div>
          </div>

          {/* Quick-select Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Standard Compliance Presets</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Click to autofill note
              </span>
            </label>
            <div className="space-y-1.5">
              {PRESET_REASONS.map((preset, idx) => {
                const isSelected = selectedPreset === preset;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border cursor-pointer flex items-start gap-2 ${
                      isSelected
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        isSelected ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="leading-snug">{preset}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Remediation Textarea */}
          <div className="space-y-1.5">
            <label
              htmlFor="remediation-feedback-textarea"
              className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <FileEdit className="w-3.5 h-3.5 text-slate-500" />
              <span>Custom Remediation Feedback (Provided to Candidate)</span>
            </label>
            <textarea
              id="remediation-feedback-textarea"
              rows={3}
              value={customFeedback}
              onChange={(e) => {
                setCustomFeedback(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Specify the exact remediation steps the candidate must complete..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-sans"
            />
            {error && (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}
          </div>

          {/* Reviewer Sign-Off Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-slate-500">Reviewing Officer:</span>
              <span className="text-slate-800 font-medium">{session.adminEmail}</span>
            </div>
            <span className="text-slate-500 text-[11px]">Clearance Level {session.clearanceLevel}</span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="btn-confirm-rejection"
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Confirm Rejection &amp; Provide Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
