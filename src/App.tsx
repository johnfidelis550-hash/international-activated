import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IntakeRecord, AdminSession } from './types';
import { INITIAL_RECORDS } from './data/mockAdminData';
import { IntakeForm } from './components/IntakeForm';
import { GreenLoadingScreen } from './components/GreenLoadingScreen';
import { OperationalStatusScreen } from './components/OperationalStatusScreen';
import { AdminAuthGateway } from './components/admin/AdminAuthGateway';
import { CleanAdminDashboard } from './components/admin/CleanAdminDashboard';
import { Shield, Building, Lock, CheckCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation between User Workflow and Segregated Administrative Enclave
  const [viewMode, setViewMode] = useState<'user_workflow' | 'admin_gateway' | 'admin_console'>('user_workflow');
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);

  // User Workflow Steps: 'intake' -> 'loading' -> 'operational_status'
  const [currentStep, setCurrentStep] = useState<'intake' | 'loading' | 'operational_status'>('intake');
  
  // Managed enterprise records directory
  const [records, setRecords] = useState<IntakeRecord[]>(INITIAL_RECORDS);
  const [activeCandidateRecord, setActiveCandidateRecord] = useState<IntakeRecord | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Step 1 Submission Handler
  const handleIntakeSubmit = (submittedRecord: IntakeRecord) => {
    setActiveCandidateRecord(submittedRecord);
    // Add submitted record directly to managed directory with PENDING_REVIEW status
    setRecords((prev) => [submittedRecord, ...prev]);
    setCurrentStep('loading');
    showToast('Corporate profile submitted. Initializing secure encryption tunnel...');
  };

  // Progress Screen Complete Handler -> Transitions into Secure Operational Status View
  const handleLoadingComplete = () => {
    setCurrentStep('operational_status');
    showToast('Record verified and enrolled in compliance ledger.');
  };

  // Reset Workflow Handler (submit another profile)
  const handleResetWorkflow = () => {
    setCurrentStep('intake');
    showToast('Profile form reset. Ready for new corporate entry.');
  };

  // Transition to Administrative Gateway (from operational view or discreet staff footer)
  const handleEnterAdminGateway = () => {
    // Strictly require explicit credential verification: never open admin dashboard automatically
    setAdminSession(null);
    setViewMode('admin_gateway');
  };

  const handleAdminAuthenticated = (session: AdminSession) => {
    setAdminSession(session);
    setViewMode('admin_console');
    showToast(`High-privilege session established. Clearance: Level ${session.clearanceLevel}.`);
  };

  const handleAdminLogout = () => {
    setAdminSession(null);
    setViewMode('user_workflow');
    showToast('Administrative session revoked. Reverted to standard domain.');
  };

  const handleSwitchToUserPortal = () => {
    // Revoke active session on return to guarantee future access requires explicit authentication
    setAdminSession(null);
    setViewMode('user_workflow');
  };

  // Governance Record Action Handlers
  const handleApproveRecord = (recordId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    setRecords((prev) =>
      prev.map((r) =>
        r.recordId === recordId
          ? {
              ...r,
              status: 'APPROVED',
              reviewedBy: adminSession?.adminEmail || 'System Administrator',
              reviewedAt: timestamp,
              remediationNote: undefined,
            }
          : r
      )
    );
    // If currently reviewing candidate is updated, reflect it
    if (activeCandidateRecord?.recordId === recordId) {
      setActiveCandidateRecord((prev) =>
        prev ? { ...prev, status: 'APPROVED', reviewedAt: timestamp } : null
      );
    }
    showToast(`Record ${recordId} approved.`);
  };

  const handleRejectRecord = (recordId: string, remediationNote: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    setRecords((prev) =>
      prev.map((r) =>
        r.recordId === recordId
          ? {
              ...r,
              status: 'REJECTED',
              remediationNote,
              reviewedBy: adminSession?.adminEmail || 'System Administrator',
              reviewedAt: timestamp,
            }
          : r
      )
    );
    // If currently reviewing candidate is updated, reflect it
    if (activeCandidateRecord?.recordId === recordId) {
      setActiveCandidateRecord((prev) =>
        prev ? { ...prev, status: 'REJECTED', remediationNote, reviewedAt: timestamp } : null
      );
    }
    showToast(`Record ${recordId} rejected with remediation instructions.`);
  };

  // 1. Render Admin Dashboard if active and authenticated
  if (viewMode === 'admin_console') {
    if (!adminSession) {
      setViewMode('admin_gateway');
      return null;
    }
    return (
      <CleanAdminDashboard
        session={adminSession}
        records={records}
        onLogout={handleAdminLogout}
        onSwitchToUserPortal={handleSwitchToUserPortal}
        onApproveRecord={handleApproveRecord}
        onRejectRecord={handleRejectRecord}
      />
    );
  }

  // 2. Render Independent Admin Gateway
  if (viewMode === 'admin_gateway') {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center">
        <AdminAuthGateway
          onAuthenticated={handleAdminAuthenticated}
          onCancel={() => setViewMode('user_workflow')}
        />
      </div>
    );
  }

  // 3. User Workflow Portal
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Corporate Header - All Public Admin Buttons Completely Removed */}
      <nav
        id="corporate-global-navbar"
        className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-900/30">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  Global Network Account Portal
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold rounded border bg-blue-500/10 text-blue-400 border-blue-500/20">
                  v4.2 PROD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Secure profile verification and compliance standard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border bg-slate-950/60 border-slate-800 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tunnel:</span>
              <span className="text-emerald-300 font-semibold font-mono text-[11px]">
                TLS 1.3 Active
              </span>
            </div>

            {currentStep === 'operational_status' && (
              <button
                id="btn-return-intake"
                type="button"
                onClick={handleResetWorkflow}
                className="text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Intake Form
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Floating System Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            id="system-notification-toast"
            className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 border border-emerald-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Body */}
      <main className="flex-1 py-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* Step 1: Corporate Profile Form */}
          {currentStep === 'intake' && (
            <motion.div
              key="step-intake"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <IntakeForm
                initialData={activeCandidateRecord || {}}
                onSubmit={handleIntakeSubmit}
              />
            </motion.div>
          )}

          {/* Transition: Animated Green Loading Progress Screen */}
          {currentStep === 'loading' && (
            <motion.div
              key="step-loading"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <GreenLoadingScreen
                onComplete={handleLoadingComplete}
                entityName={activeCandidateRecord?.fullName}
              />
            </motion.div>
          )}

          {/* Step 2: Secure Operational Status View leading to Administrative Gateway */}
          {currentStep === 'operational_status' && activeCandidateRecord && (
            <motion.div
              key="step-operational-status"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <OperationalStatusScreen
                record={activeCandidateRecord}
                onEnterAdminPortal={handleEnterAdminGateway}
                onResetWorkflow={handleResetWorkflow}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Institutional Footer with Discreet Staff Gateway Link */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Enterprise Compliance &bull; SOC-2 Type II Certified &bull; TLS 1.3 Active</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>Corporate Identity Verification Domain</span>
            <span className="text-slate-700">&bull;</span>
            {/* Discreet Institutional Link - Unassuming placeholder concealing administrative gateway */}
            <button
              id="link-system-parameters"
              type="button"
              onClick={handleEnterAdminGateway}
              className="text-slate-500 hover:text-slate-400 transition-colors text-xs font-normal cursor-pointer hover:underline underline-offset-4 decoration-slate-800"
              title="System Parameters"
            >
              System Parameters
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
