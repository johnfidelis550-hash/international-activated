import React, { useState } from 'react';
import { IntakeRecord, AdminSession } from '../../types';
import { RejectReasonModal } from './RejectReasonModal';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  X,
  Shield,
  LogOut,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';

interface CleanAdminDashboardProps {
  session: AdminSession;
  records: IntakeRecord[];
  onLogout: () => void;
  onSwitchToUserPortal: () => void;
  onApproveRecord: (recordId: string) => void;
  onRejectRecord: (recordId: string, remediationNote: string) => void;
}

export const CleanAdminDashboard: React.FC<CleanAdminDashboardProps> = ({
  session,
  records,
  onLogout,
  onSwitchToUserPortal,
  onApproveRecord,
  onRejectRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedRecordForReject, setSelectedRecordForReject] = useState<IntakeRecord | null>(null);

  // Minimalist metrics
  const totalSubmissions = records.length;
  const pendingReview = records.filter((r) => r.status === 'PENDING_REVIEW').length;
  const approvedCount = records.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = records.filter((r) => r.status === 'REJECTED').length;

  // Filter records
  const filteredRecords = records.filter((rec) => {
    if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      rec.fullName.toLowerCase().includes(query) ||
      rec.accountId.toLowerCase().includes(query) ||
      (rec.businessEmail || rec.contactEmail || '').toLowerCase().includes(query) ||
      rec.recordId.toLowerCase().includes(query)
    );
  });

  return (
    <div id="executive-admin-dashboard" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Executive Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-slate-900 tracking-tight">
                  Governance Review Console
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Secured
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Executive Profile Verification &amp; Account Compliance Standard
              </p>
            </div>
          </div>

          {/* Session details & actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700">{session.adminEmail}</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-500">Level {session.clearanceLevel}</span>
            </div>

            <button
              id="btn-switch-to-portal"
              type="button"
              onClick={onSwitchToUserPortal}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Return to user intake portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">User Portal</span>
            </button>

            <button
              id="btn-admin-logout"
              type="button"
              onClick={onLogout}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Executive Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7">
        {/* Metric Summary Cards: Crisp, clean light aesthetics ("Total Submissions", "Pending Review") */}
        <section id="executive-metric-cards" aria-label="Metric Summaries" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Submissions */}
          <div
            id="card-total-submissions"
            className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Submissions
              </span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">{totalSubmissions}</span>
              <span className="text-xs text-slate-500 font-medium">all time</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-normal">
              Enrolled corporate profile entries
            </p>
          </div>

          {/* Card 2: Pending Review */}
          <div
            id="card-pending-review"
            className="bg-white border border-amber-200/90 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm bg-gradient-to-br from-white to-amber-50/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Review
              </span>
              <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-900 tracking-tight">{pendingReview}</span>
              <span className="text-xs text-amber-700/80 font-medium">awaiting review</span>
            </div>
            <p className="text-xs text-amber-700/70 mt-2 font-normal">
              {pendingReview > 0 ? 'Requires administrative review' : 'Queue up to date'}
            </p>
          </div>

          {/* Card 3: Approved */}
          <div
            id="card-approved-submissions"
            className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Approved
              </span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-700 tracking-tight">{approvedCount}</span>
              <span className="text-xs text-emerald-700/80 font-medium">verified</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-normal">
              Compliance criteria satisfied
            </p>
          </div>

          {/* Card 4: Action Required / Remediation */}
          <div
            id="card-rejected-submissions"
            className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Remediated
              </span>
              <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-700 tracking-tight">{rejectedCount}</span>
              <span className="text-xs text-rose-600/80 font-medium">flagged</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-normal">
              Feedback guidance provided
            </p>
          </div>
        </section>

        {/* Spacious, Structured Data Table */}
        <section id="executive-data-table-container" aria-label="Submissions Ledger" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Table Header & Search Filter Controls */}
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
                Candidate Profile Submissions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage recent submissions, review corporate credentials, and assign governance status.
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  id="search-candidate-submissions"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name, account, email..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                />
              </div>

              {/* Status Segmented Control */}
              <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({records.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PENDING_REVIEW')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === 'PENDING_REVIEW'
                      ? 'bg-amber-100 text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:text-amber-800'
                  }`}
                >
                  Pending ({pendingReview})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('APPROVED')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-emerald-800'
                  }`}
                >
                  Approved
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('REJECTED')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === 'REJECTED'
                      ? 'bg-rose-100 text-rose-900 shadow-xs'
                      : 'text-slate-600 hover:text-rose-800'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table id="table-candidate-submissions" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Candidate Name</th>
                  <th className="py-3 px-5">Account ID</th>
                  <th className="py-3 px-5">Business Email</th>
                  <th className="py-3 px-5">Submission Date</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Remediation Feedback</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-xs">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                      No candidate submissions match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const isPending = record.status === 'PENDING_REVIEW';
                    const isApproved = record.status === 'APPROVED';
                    const isRejected = record.status === 'REJECTED';

                    return (
                      <tr key={record.recordId} className="hover:bg-slate-50/70 transition-colors">
                        {/* Candidate Name */}
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900">{record.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{record.recordId}</div>
                        </td>

                        {/* Account ID */}
                        <td className="py-3.5 px-5 font-mono font-medium text-slate-700">
                          {record.accountId}
                        </td>

                        {/* Business Email */}
                        <td className="py-3.5 px-5 text-slate-600 max-w-[200px] truncate">
                          {record.businessEmail || record.contactEmail}
                        </td>

                        {/* Submission Date */}
                        <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                          {record.submittedAt || '2026-09-18 09:30 UTC'}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pending Review
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Approved
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200/80">
                              <X className="w-3 h-3 text-rose-600" />
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Remediation Note */}
                        <td className="py-3.5 px-5 max-w-[240px]">
                          {record.remediationNote ? (
                            <div className="bg-rose-50/60 p-2 rounded-lg border border-rose-200/70 text-[11px] text-rose-800">
                              <p className="line-clamp-2">{record.remediationNote}</p>
                              {record.reviewedBy && (
                                <span className="text-[10px] text-rose-600/80 block mt-1">
                                  Flagged by {record.reviewedBy}
                                </span>
                              )}
                            </div>
                          ) : isApproved ? (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              Identity verified &bull; Compliant
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Pending evaluation
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              id={`btn-approve-${record.recordId}`}
                              type="button"
                              onClick={() => onApproveRecord(record.recordId)}
                              disabled={isApproved}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
                                isApproved
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              id={`btn-reject-${record.recordId}`}
                              type="button"
                              onClick={() => setSelectedRecordForReject(record)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>Showing {filteredRecords.length} of {records.length} total entries</span>
            <span>Enterprise Identity Directory Standard</span>
          </div>
        </section>
      </main>

      {/* Interactive Reject Remediation Modal */}
      {selectedRecordForReject && (
        <RejectReasonModal
          record={selectedRecordForReject}
          session={session}
          isOpen={true}
          onClose={() => setSelectedRecordForReject(null)}
          onConfirmReject={onRejectRecord}
        />
      )}
    </div>
  );
};
