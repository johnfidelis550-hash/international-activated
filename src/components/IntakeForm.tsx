import React, { useState } from 'react';
import { IntakeRecord } from '../types';
import {
  User,
  Hash,
  Mail,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface IntakeFormProps {
  initialData: Partial<IntakeRecord>;
  onSubmit: (record: IntakeRecord) => void;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    accountId: initialData.accountId || '',
    businessEmail: initialData.businessEmail || initialData.contactEmail || '',
  });

  const [errors, setErrors] = useState<Partial<Record<'fullName' | 'accountId' | 'businessEmail', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<'fullName' | 'accountId' | 'businessEmail', string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.accountId.trim()) {
      newErrors.accountId = 'Account ID is required';
    } else if (formData.accountId.length < 4) {
      newErrors.accountId = 'Account ID must be at least 4 characters';
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Business Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Enter a valid corporate email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedId = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const submittedRecord: IntakeRecord = {
        recordId: generatedId,
        fullName: formData.fullName.trim(),
        accountId: formData.accountId.trim(),
        businessEmail: formData.businessEmail.trim(),
        contactEmail: formData.businessEmail.trim(),
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        status: 'PENDING_REVIEW',
        verificationHash: `SHA256:${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 8)}`,
        institutionName: 'Enterprise Network Directory',
      };
      onSubmit(submittedRecord);
    }, 450);
  };

  const handleQuickFill = () => {
    setFormData({
      fullName: 'Alexander Vance',
      accountId: 'ACC-8924-018',
      businessEmail: 'alexander.vance@acme-corp.com',
    });
    setErrors({});
  };

  return (
    <div id="step1-profile-form" className="w-full max-w-xl mx-auto px-4 py-6">
      {/* Container Card */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-6 sm:p-9 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-md">
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

        {/* Security Compliance Badges (No step indicators) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span
              id="badge-tls-status"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              TLS 1.3 Active
            </span>
            <span
              id="badge-ssl-status"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25"
            >
              <Lock className="w-3.5 h-3.5" />
              256-Bit SSL
            </span>
          </div>

          <button
            id="btn-sample-data"
            type="button"
            onClick={handleQuickFill}
            className="text-[11px] font-medium text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            Sample Data
          </button>
        </div>

        {/* Header Section */}
        <div className="space-y-1.5 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Global Network Account Portal
          </h1>
          <p className="text-sm font-medium text-slate-300 tracking-wide">
            Secure profile verification and compliance standard.
          </p>
        </div>

        {/* Form Fields: Strictly 3 essential corporate profile inputs */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Field 1: Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-full-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              1. Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-full-name"
                type="text"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="e.g., Alexander Vance"
                className={`w-full bg-slate-950/90 border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.fullName ? 'border-red-500/80 bg-red-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Field 2: Account ID */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-account-id"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              2. Account ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                id="input-account-id"
                type="text"
                value={formData.accountId}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, accountId: e.target.value }));
                  if (errors.accountId) setErrors((prev) => ({ ...prev, accountId: undefined }));
                }}
                placeholder="e.g., ACC-8924-018"
                className={`w-full bg-slate-950/90 border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.accountId ? 'border-red-500/80 bg-red-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              />
            </div>
            {errors.accountId && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.accountId}
              </p>
            )}
          </div>

          {/* Field 3: Business Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-business-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              3. Business Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="input-business-email"
                type="email"
                value={formData.businessEmail}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, businessEmail: e.target.value }));
                  if (errors.businessEmail) setErrors((prev) => ({ ...prev, businessEmail: undefined }));
                }}
                placeholder="e.g., alexander.vance@acme-corp.com"
                className={`w-full bg-slate-950/90 border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  errors.businessEmail ? 'border-red-500/80 bg-red-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              />
            </div>
            {errors.businessEmail && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.businessEmail}
              </p>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="pt-3">
            <button
              id="btn-submit-record"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide uppercase text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all duration-150 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying &amp; Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
