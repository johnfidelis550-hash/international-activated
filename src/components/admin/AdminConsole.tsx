import React, { useState } from 'react';
import {
  AdminSession,
  AdminRole,
  Permission,
  NodeStatus,
  ProvisionedIdentity,
  SecurityPolicy,
  AuditLogEntry,
  IntakeRecord,
} from '../../types';
import {
  INITIAL_NODES,
  INITIAL_IDENTITIES,
  INITIAL_POLICIES,
  INITIAL_AUDIT_LOGS,
} from '../../data/mockAdminData';
import { RecordManagementView } from './RecordManagementView';
import {
  ShieldAlert,
  Server,
  Users,
  Key,
  FileText,
  Lock,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sliders,
  Radio,
  Eye,
  Plus,
} from 'lucide-react';

interface AdminConsoleProps {
  session: AdminSession;
  records: IntakeRecord[];
  onLogout: () => void;
  onSwitchToUserPortal: () => void;
  onApproveRecord: (recordId: string) => void;
  onRejectRecord: (recordId: string, remediationNote: string) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  session,
  records,
  onLogout,
  onSwitchToUserPortal,
  onApproveRecord,
  onRejectRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'telemetry' | 'rbac' | 'crypto' | 'audit'>('records');
  const [nodes, setNodes] = useState<NodeStatus[]>(INITIAL_NODES);
  const [identities, setIdentities] = useState<ProvisionedIdentity[]>(INITIAL_IDENTITIES);
  const [policies, setPolicies] = useState<SecurityPolicy[]>(INITIAL_POLICIES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'CRITICAL' | 'WARN' | 'INFO'>('ALL');

  // Interactive state
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const [keyFingerprint, setKeyFingerprint] = useState('SHA512:4F89-A290-DD71-99B2-C841');
  const [escalationAlert, setEscalationAlert] = useState<{
    attemptedAction: string;
    requiredClearance: number;
    requiredPermission: Permission;
  } | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showConsoleToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3800);
  };

  // RBAC Permission Guard
  const hasPermission = (perm: Permission, minClearance = 1): boolean => {
    return session.permissions.includes(perm) && session.clearanceLevel >= minClearance;
  };

  // Record an action in the immutable audit log
  const logAdminAction = (
    action: string,
    resource: string,
    severity: 'INFO' | 'WARN' | 'CRITICAL',
    authorized = true
  ) => {
    const newLog: AuditLogEntry = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: session.adminEmail,
      role: session.role,
      action,
      resource,
      severity,
      sigHash: `${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`,
      authorized,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Intercept and enforce Privilege Boundaries
  const attemptGuardedAction = (
    perm: Permission,
    minClearance: number,
    actionName: string,
    execute: () => void
  ) => {
    if (!hasPermission(perm, minClearance)) {
      // Escalation violation!
      setEscalationAlert({
        attemptedAction: actionName,
        requiredClearance: minClearance,
        requiredPermission: perm,
      });
      logAdminAction(
        `UNAUTHORIZED_ESCALATION_ATTEMPT [${actionName}]`,
        `RBAC_BOUNDARY_GUARD`,
        'CRITICAL',
        false
      );
      return;
    }
    execute();
  };

  // Action: Rotate Root Signing Key
  const handleRotateKey = () => {
    attemptGuardedAction('ROTATE_KEYS', 5, 'ROTATE_ROOT_SIGNING_KEYS', () => {
      setIsRotatingKeys(true);
      setTimeout(() => {
        const newFingerprint = `SHA512:${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}-${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}-${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setKeyFingerprint(newFingerprint);
        setIsRotatingKeys(false);
        logAdminAction('ROTATED_ROOT_SIGNING_KEYS', 'FIPS_140_3_HSM_ENCLAVE', 'CRITICAL', true);
        showConsoleToast('Root Signing Keys regenerated and broadcast to all consensus nodes.');
      }, 900);
    });
  };

  // Action: Toggle Security Policy
  const handleTogglePolicy = (policyId: string) => {
    const policy = policies.find((p) => p.id === policyId);
    if (!policy) return;

    attemptGuardedAction('POLICY_OVERRIDE', policy.minClearance, `TOGGLE_POLICY_${policy.id}`, () => {
      setPolicies((prev) =>
        prev.map((p) => (p.id === policyId ? { ...p, enabled: !p.enabled } : p))
      );
      logAdminAction(
        `POLICY_STATE_CHANGED [${policy.name}] -> ${!policy.enabled ? 'ENABLED' : 'DISABLED'}`,
        `POLICY_ENGINE`,
        'WARN',
        true
      );
      showConsoleToast(`Security Policy [${policy.name}] updated.`);
    });
  };

  // Action: Change User Role
  const handleChangeRole = (userId: string, targetRole: AdminRole) => {
    attemptGuardedAction('MANAGE_ROLES', 4, `REASSIGN_ROLE_${targetRole}`, () => {
      setIdentities((prev) =>
        prev.map((id) => (id.id === userId ? { ...id, role: targetRole } : id))
      );
      logAdminAction(
        `ROLE_REASSIGNED [Subject: ${userId}] -> ${targetRole}`,
        `IAM_DIRECTORY`,
        'WARN',
        true
      );
      showConsoleToast(`Subject ${userId} re-provisioned as ${targetRole}.`);
    });
  };

  // Action: Toggle Node Quarantine
  const handleToggleNodeQuarantine = (nodeId: string) => {
    attemptGuardedAction('NETWORK_REVOKE', 3, `QUARANTINE_NODE_${nodeId}`, () => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, status: n.status === 'QUARANTINED' ? 'HEALTHY' : 'QUARANTINED' }
            : n
        )
      );
      logAdminAction(`NODE_STATUS_OVERRIDE [${nodeId}]`, `CONSENSUS_RING`, 'WARN', true);
      showConsoleToast(`Consensus node ${nodeId} status altered.`);
    });
  };

  const filteredLogs =
    auditFilter === 'ALL' ? auditLogs : auditLogs.filter((l) => l.severity === auditFilter);

  return (
    <div
      id="admin-operations-console"
      className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black"
    >
      {/* High-Privilege Institutional Header */}
      <header className="border-b border-amber-950/60 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-lg shadow-amber-950/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white font-mono uppercase">
                  SecOps Command &amp; Control
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CLEARANCE LVL {session.clearanceLevel}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Principal: <span className="text-amber-300">{session.adminEmail}</span> ({session.role})
              </p>
            </div>
          </div>

          {/* Session Metadata & Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex flex-col items-end text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SESSION CRYPTO-VERIFIED</span>
              </div>
              <span className="text-slate-400 truncate max-w-[200px]">
                Sig: {session.tokenSignature.substring(0, 18)}...
              </span>
            </div>

            <button
              type="button"
              onClick={onSwitchToUserPortal}
              className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">User Portal</span>
            </button>

            <button
              id="btn-admin-logout"
              type="button"
              onClick={onLogout}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/60 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Revoke Session</span>
            </button>
          </div>
        </div>

        {/* Module Sub-Navigation Bar */}
        <div className="border-t border-slate-900 bg-slate-950/60 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
            <button
              id="tab-btn-records"
              type="button"
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'records'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Records &amp; Compliance Review</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {records.length}
              </span>
              {records.filter((r) => r.status === 'PENDING_REVIEW').length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  {records.filter((r) => r.status === 'PENDING_REVIEW').length} PENDING
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>2. Node Telemetry Matrix</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {nodes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rbac')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'rbac'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3. RBAC &amp; Identity Topology</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {identities.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('crypto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'crypto'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>4. HSM Cryptography &amp; Policies</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                FIPS
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>5. Immutable Audit Ledger</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {auditLogs.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating System Toast */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-amber-500/60 text-amber-200 px-4 py-3 rounded-xl font-mono text-xs shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Privilege Escalation Denial Modal */}
      {escalationAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border-2 border-red-500 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-red-950/60 font-mono space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  403 Forbidden: Privilege Escalation Intercepted
                </h3>
                <p className="text-xs text-red-400">RBAC Enforcement Engine Active</p>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-4 text-xs space-y-2 text-slate-300">
              <p>
                Action <strong className="text-white">[{escalationAlert.attemptedAction}]</strong>{' '}
                was blocked by the cryptographic policy controller.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-red-900/40 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Your Clearance:</span>
                  <span className="text-amber-300 font-bold">
                    LEVEL {session.clearanceLevel} ({session.role})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Demanded Clearance:</span>
                  <span className="text-red-400 font-bold">
                    LEVEL {escalationAlert.requiredClearance} ({escalationAlert.requiredPermission})
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              This unauthorized attempt has been recorded into the cryptographic audit log and
              dispatched to the central security monitoring consensus.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setEscalationAlert(null)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Acknowledge Security Violation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Administrative Partition Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: RECORDS & COMPLIANCE REVIEW */}
        {activeTab === 'records' && (
          <RecordManagementView
            records={records}
            session={session}
            onApproveRecord={(recId) => {
              attemptGuardedAction('REVIEW_RECORDS', 3, `APPROVE_RECORD_${recId}`, () => {
                onApproveRecord(recId);
                logAdminAction(`APPROVED_COMPLIANCE_RECORD [${recId}]`, 'DIRECTORY_LEDGER', 'INFO', true);
                showConsoleToast(`Record ${recId} approved. Status updated to Compliant.`);
              });
            }}
            onRejectRecord={(recId, note) => {
              attemptGuardedAction('REVIEW_RECORDS', 3, `REJECT_RECORD_${recId}`, () => {
                onRejectRecord(recId, note);
                logAdminAction(`REJECTED_COMPLIANCE_RECORD [${recId}]: ${note.substring(0, 40)}...`, 'DIRECTORY_LEDGER', 'WARN', true);
                showConsoleToast(`Record ${recId} rejected. Remediation guidance logged.`);
              });
            }}
          />
        )}

        {/* TAB 2: TELEMETRY & NODE MATRIX */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            {/* Stats High Level Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Consensus Nodes</span>
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-2xl font-bold text-white">5 / 5 Synced</div>
                <div className="text-[11px] text-emerald-400">Zero cryptographic forks</div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  TLS 1.3 Ingress Rate
                </div>
                <div className="text-2xl font-bold text-amber-300">42,840 op/s</div>
                <div className="text-[11px] text-slate-400">Avg Handshake: 1.8ms</div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  FIPS 140-3 HSM Status
                </div>
                <div className="text-2xl font-bold text-emerald-400">ONLINE [L3]</div>
                <div className="text-[11px] text-slate-400">Tamper sensors primed</div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  RBAC Boundary Health
                </div>
                <div className="text-2xl font-bold text-purple-400">ENFORCING</div>
                <div className="text-[11px] text-purple-300">Zero horizontal breaches</div>
              </div>
            </div>

            {/* Nodes Table / Cards */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono">
              <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                    Active Cryptographic Consensus Cluster
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => showConsoleToast('Cluster nodes polled. Latency updated.')}
                  className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Poll Nodes
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{node.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            node.status === 'HEALTHY'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : node.status === 'SYNCING'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : node.status === 'STANDBY'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {node.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        <span>ID: {node.id}</span>
                        <span>&bull;</span>
                        <span>Region: {node.region}</span>
                        <span>&bull;</span>
                        <span className="text-slate-300">{node.tlsVersion}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right text-xs">
                        <div className="text-slate-400">Load: {node.loadPercent}%</div>
                        <div className="text-amber-300 font-bold">{node.latencyMs} ms</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleNodeQuarantine(node.id)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          node.status === 'QUARANTINED'
                            ? 'bg-emerald-900/60 border-emerald-700 text-emerald-200 hover:bg-emerald-800'
                            : 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/50'
                        }`}
                      >
                        {node.status === 'QUARANTINED' ? 'Restore Node' : 'Quarantine'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RBAC DIRECTORY & IDENTITY TOPOLOGY */}
        {activeTab === 'rbac' && (
          <div className="space-y-6 font-mono">
            {/* RBAC Rules Matrix Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Multi-Tier Permission Topology (Hierarchy &amp; Boundary Enforcement)
                </h2>
                <span className="text-[10px] text-slate-400">
                  Strict Principal Separation Mandate
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-lg space-y-1">
                  <div className="font-bold text-amber-300">Level 5: SUPER_ADMIN</div>
                  <div className="text-[11px] text-slate-400">
                    Full Root HSM control, key rotation, policy override, user provisioning.
                  </div>
                </div>
                <div className="bg-slate-900/90 border border-blue-500/30 p-3 rounded-lg space-y-1">
                  <div className="font-bold text-blue-300">Level 4: SEC_ADMIN</div>
                  <div className="text-[11px] text-slate-400">
                    IAM identity management, audit inspection, node revoking, no root key access.
                  </div>
                </div>
                <div className="bg-slate-900/90 border border-purple-500/30 p-3 rounded-lg space-y-1">
                  <div className="font-bold text-purple-300">Level 2: AUDITOR</div>
                  <div className="text-[11px] text-slate-400">
                    Strict read-only telemetry and compliance audit log inspection.
                  </div>
                </div>
                <div className="bg-slate-900/90 border border-red-500/30 p-3 rounded-lg space-y-1">
                  <div className="font-bold text-red-300">Level 1: USER / GUEST</div>
                  <div className="text-[11px] text-slate-400">
                    Standard profile intake only. Blocked from administrative consoles.
                  </div>
                </div>
              </div>
            </div>

            {/* Provisioned Identities Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Provisioned Administrative Principals
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    attemptGuardedAction('MANAGE_ROLES', 4, 'PROVISION_NEW_IDENTITY', () => {
                      const newId: ProvisionedIdentity = {
                        id: `ID-00${Math.floor(100 + Math.random() * 899)}`,
                        name: 'New Assigned Operator',
                        email: `operator.${Math.floor(10 + Math.random() * 89)}@secops.internal`,
                        role: 'OPERATOR',
                        department: 'Infrastructure SecOps',
                        status: 'ACTIVE',
                        lastActive: 'Just provisioned',
                        mfaEnforced: true,
                        clearanceLevel: 3,
                      };
                      setIdentities((prev) => [newId, ...prev]);
                      showConsoleToast(`New identity ${newId.email} provisioned.`);
                    })
                  }
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-amber-500/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Provision Principal
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-6">Identity Principal</th>
                      <th className="py-3 px-6">Department</th>
                      <th className="py-3 px-6">Assigned Role &amp; Clearance</th>
                      <th className="py-3 px-6">MFA Status</th>
                      <th className="py-3 px-6 text-right">Role Governance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {identities.map((identity) => (
                      <tr key={identity.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="font-bold text-white">{identity.name}</div>
                          <div className="text-[11px] text-slate-400">{identity.email}</div>
                        </td>
                        <td className="py-3.5 px-6 text-slate-300">{identity.department}</td>
                        <td className="py-3.5 px-6">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              identity.role === 'SUPER_ADMIN'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : identity.role === 'SEC_ADMIN'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : identity.role === 'AUDITOR'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : identity.role === 'OPERATOR'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {identity.role} (Lvl {identity.clearanceLevel})
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          {identity.mfaEnforced ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              FIDO2 Enforced
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1 text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <select
                            value={identity.role}
                            onChange={(e) =>
                              handleChangeRole(identity.id, e.target.value as AdminRole)
                            }
                            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="SUPER_ADMIN">SUPER_ADMIN (Lvl 5)</option>
                            <option value="SEC_ADMIN">SEC_ADMIN (Lvl 4)</option>
                            <option value="OPERATOR">OPERATOR (Lvl 3)</option>
                            <option value="AUDITOR">AUDITOR (Lvl 2)</option>
                            <option value="USER">USER (Lvl 1)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HSM CRYPTOGRAPHY & POLICIES */}
        {activeTab === 'crypto' && (
          <div className="space-y-6 font-mono">
            {/* HSM Status & Key Rotation */}
            <div className="bg-slate-950 border-2 border-amber-500/40 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-bold text-white uppercase tracking-wider">
                      FIPS 140-3 HSM Root Signing Key Vault
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    ECDSA Curve25519 Root Master Keys stored inside air-gapped secure hardware
                    enclaves.
                  </p>
                </div>

                <button
                  id="btn-rotate-keys"
                  type="button"
                  disabled={isRotatingKeys}
                  onClick={handleRotateKey}
                  className="px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRotatingKeys ? 'animate-spin' : ''}`} />
                  <span>{isRotatingKeys ? 'Rotating HSM Keys...' : 'Rotate Root Signing Key'}</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>ACTIVE ROOT PUBLIC KEY FINGERPRINT:</span>
                  <span className="text-emerald-400 font-bold">VERIFIED HSM ATTESTED</span>
                </div>
                <div className="text-amber-300 text-sm font-bold tracking-widest break-all">
                  {keyFingerprint}
                </div>
              </div>
            </div>

            {/* Zero-Trust Security Policies */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Zero-Trust Enclave Policies
                </h3>
              </div>
              <div className="divide-y divide-slate-800/60">
                {policies.map((policy) => (
                  <div
                    key={policy.id}
                    className="p-4 sm:px-6 flex items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{policy.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {policy.category}
                        </span>
                        <span className="text-[10px] text-amber-400">
                          Requires Lvl {policy.minClearance}+
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{policy.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePolicy(policy.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        policy.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {policy.enabled ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IMMUTABLE AUDIT LEDGER */}
        {activeTab === 'audit' && (
          <div className="space-y-4 font-mono">
            {/* Filter Bar */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Cryptographic Audit Log Trail
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Severity:</span>
                {(['ALL', 'CRITICAL', 'WARN', 'INFO'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setAuditFilter(sev)}
                    className={`text-[10px] font-bold px-2 py-1 rounded transition-colors border cursor-pointer ${
                      auditFilter === sev
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-6">Timestamp &bull; ID</th>
                      <th className="py-3 px-6">Actor &bull; Role</th>
                      <th className="py-3 px-6">Action &amp; Resource</th>
                      <th className="py-3 px-6">Severity</th>
                      <th className="py-3 px-6 text-right">Sig Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 px-6">
                          <div className="font-bold text-white">{log.timestamp}</div>
                          <div className="text-[10px] text-slate-400">{log.id}</div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="text-slate-200">{log.actor}</div>
                          <div className="text-[10px] text-amber-400">{log.role}</div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="font-bold text-white">{log.action}</div>
                          <div className="text-[10px] text-slate-400">{log.resource}</div>
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.severity === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : log.severity === 'WARN'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            }`}
                          >
                            {log.severity}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right font-mono text-slate-400 text-[11px]">
                          {log.sigHash}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Institutional Security Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SecOps Enclave Node: US-EAST-HSM-ALPHA</span>
          <span>FIPS 140-3 LEVEL 3 ATTESTED &bull; ZERO TRUST PRIVILEGE BOUNDARY</span>
        </div>
      </footer>
    </div>
  );
};
