import React, { useState } from 'react';
import { IntakeRecord, AdminSession } from '../../types';
import { RejectReasonModal } from './RejectReasonModal';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  User,
  Hash,
  Mail,
  Info,
  ChevronDown,
} from 'lucide-react';

interface RecordManagementViewProps {
  records: IntakeRecord[];
  session: AdminSession;
  onApproveRecord: (recordId: string) => void;
  onRejectRecord: (recordId: string, remediationNote: string) => void;
}

export const RecordManagementView: React.FC<RecordManagementViewProps> = ({
  records,
  session,
  onApproveRecord,
  onRejectRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedRecordForReject, setSelectedRecordForReject] = useState<IntakeRecord | null>(null);
  const [expandedNoteRecordId, setExpandedNoteRecordId] = useState<string | null>(null);

  // Metrics calculation
  const totalRecords = records.length;
  const pendingCount = records.filter((r) => r.status === 'PENDING_REVIEW').length;
  const approvedCount = records.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = records.filter((r) => r.status === 'REJECTED').length;

  // Filtered list
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
    <div id="record-management-view" className="space-y-6">
      {/* Top Metric Summary Cards: Clean high-contrast cards requested in prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Records */}
        <div
          id="metric-total-records"
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/40 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Total Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{totalRecords}</span>
            <span className="text-[11px] font-mono text-slate-400">Enrolled Profiles</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Corporate Ingress</span>
            <span className="text-emerald-400 font-semibold">Active Queue</span>
          </div>
        </div>

        {/* Card 2: Pending Review */}
        <div
          id="metric-pending-review"
          className="bg-slate-900/90 border border-amber-900/50 rounded-2xl p-5 shadow-lg shadow-black/40 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Pending Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300 font-mono">{pendingCount}</span>
            <span className="text-[11px] font-mono text-amber-200/70">Awaiting Governance</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Action Required</span>
            <span className="text-amber-400 font-semibold">{pendingCount > 0 ? 'Review Needed' : 'All Clear'}</span>
          </div>
        </div>

        {/* Card 3: Approved */}
        <div
          id="metric-approved-records"
          className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 shadow-lg shadow-black/40 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Approved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-300 font-mono">{approvedCount}</span>
            <span className="text-[11px] font-mono text-emerald-200/70">Verified &amp; Compliant</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Pass Rate</span>
            <span className="text-emerald-400 font-semibold">
              {totalRecords > 0 ? Math.round((approvedCount / totalRecords) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Card 4: Rejected / Remediated */}
        <div
          id="metric-rejected-records"
          className="bg-slate-900/90 border border-red-900/40 rounded-2xl p-5 shadow-lg shadow-black/40 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
              Remediation Needed
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-300 font-mono">{rejectedCount}</span>
            <span className="text-[11px] font-mono text-red-200/70">Flagged for Correction</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Remediation Notes</span>
            <span className="text-red-400 font-semibold">{rejectedCount} Attached</span>
          </div>
        </div>
      </div>

      {/* Structured Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl shadow-black/50 overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Enterprise Identity &amp; Profile Directory</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-normal bg-slate-800 text-slate-300">
                {filteredRecords.length} records
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review candidates, verify corporate identifiers, and administer governance status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                id="input-search-records"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, account, email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono"
              />
            </div>

            {/* Filter Dropdown / Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING_REVIEW')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'PENDING_REVIEW'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                Approved
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('REJECTED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'REJECTED'
                    ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30'
                    : 'text-slate-400 hover:text-red-300'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="overflow-x-auto">
          <table id="table-enterprise-records" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Record &amp; Candidate</th>
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Business Email</th>
                <th className="py-3 px-4">Submission Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Governance Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono text-xs">
                    No matching compliance records found for current criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isPending = rec.status === 'PENDING_REVIEW';
                  const isApproved = rec.status === 'APPROVED';
                  const isRejected = rec.status === 'REJECTED';

                  return (
                    <tr
                      key={rec.recordId}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Record ID & Candidate Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                          {rec.fullName}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{rec.recordId}</span>
                        </div>
                      </td>

                      {/* Account ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-300">
                        {rec.accountId}
                      </td>

                      {/* Business Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 max-w-[180px] truncate">
                        {rec.businessEmail || rec.contactEmail}
                      </td>

                      {/* Submission Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {rec.submittedAt || '2026-09-18 09:30 UTC'}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            PENDING REVIEW
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <Check className="w-3 h-3 text-emerald-400" />
                            APPROVED
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/15 text-red-300 border border-red-500/30">
                            <X className="w-3 h-3 text-red-400" />
                            REJECTED
                          </span>
                        )}
                      </td>

                      {/* Governance Feedback / Remediation Notes */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        {rec.remediationNote ? (
                          <div className="space-y-1">
                            <p className="text-[11px] text-red-200/90 bg-red-950/30 p-2 rounded border border-red-900/40 line-clamp-2 font-mono">
                              {rec.remediationNote}
                            </p>
                            {rec.reviewedBy && (
                              <span className="text-[9px] font-mono text-slate-400 block">
                                By {rec.reviewedBy}
                              </span>
                            )}
                          </div>
                        ) : isApproved ? (
                          <span className="text-[11px] text-emerald-400/80 font-mono">
                            Verified compliance
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono italic">
                            Awaiting evaluation
                          </span>
                        )}
                      </td>

                      {/* Interactive Actions: Approve & Reject */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Approve Button */}
                          <button
                            id={`btn-approve-${rec.recordId}`}
                            type="button"
                            onClick={() => onApproveRecord(rec.recordId)}
                            disabled={isApproved}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1 ${
                              isApproved
                                ? 'bg-emerald-950/40 text-emerald-500/50 border border-emerald-900/30 cursor-not-allowed'
                                : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400'
                            }`}
                            title="Approve and mark profile as compliant"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          {/* Reject Button (Opens Modal) */}
                          <button
                            id={`btn-reject-${rec.recordId}`}
                            type="button"
                            onClick={() => setSelectedRecordForReject(rec)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 hover:border-red-400 transition-all cursor-pointer flex items-center gap-1"
                            title="Reject and attach remediation feedback note"
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

        {/* Table Footer / Summary */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          <span>
            Enterprise Governance Ledger &bull; SOC-2 Type II Attested
          </span>
          <span>
            Active Reviewer: <span className="text-amber-300">{session.adminEmail}</span> (Clearance Lvl {session.clearanceLevel})
          </span>
        </div>
      </div>

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
