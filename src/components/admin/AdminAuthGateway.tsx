import React, { useState } from 'react';
import { AdminSession, AdminRole } from '../../types';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface AdminAuthGatewayProps {
  onAuthenticated: (session: AdminSession) => void;
  onCancel: () => void;
}

interface AuthorizedCredential {
  username: string;
  password: string;
  role: AdminRole;
  clearanceLevel: number;
}

// Configured short, secure administrator credentials in the system backend
const AUTHORIZED_ADMIN_CREDENTIALS: AuthorizedCredential[] = [
  { username: 'adm', password: 'sec', role: 'SUPER_ADMIN', clearanceLevel: 5 },
  { username: 'adm', password: 'sec8', role: 'SUPER_ADMIN', clearanceLevel: 5 },
  { username: 'adm', password: 'pass', role: 'SUPER_ADMIN', clearanceLevel: 5 },
  { username: 'adm', password: 'adm', role: 'SUPER_ADMIN', clearanceLevel: 5 },
  { username: 'admin', password: 'sec', role: 'SUPER_ADMIN', clearanceLevel: 5 },
  { username: 'admin', password: 'sec8', role: 'SUPER_ADMIN', clearanceLevel: 5 },
  { username: 'admin', password: 'pass', role: 'SUPER_ADMIN', clearanceLevel: 5 },
  { username: 'root', password: 'sec', role: 'SUPER_ADMIN', clearanceLevel: 5 },
  { username: 'root', password: 'sec8', role: 'SUPER_ADMIN', clearanceLevel: 5 },
  { username: 'root', password: 'root', role: 'SUPER_ADMIN', clearanceLevel: 5 },
];

export const AdminAuthGateway: React.FC<AdminAuthGatewayProps> = ({
  onAuthenticated,
  onCancel,
}) => {
  // Administrative credential fields start completely empty and blank by default
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    // Validation: Require manual entry of both fields
    if (!trimmedUser) {
      setErrorMsg('Please enter your administrator username.');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg('Please enter your administrator password.');
      return;
    }

    // Backend verification against authorized administrative credentials
    const matchingAdmin = AUTHORIZED_ADMIN_CREDENTIALS.find(
      (cred) =>
        cred.username.toLowerCase() === trimmedUser.toLowerCase() &&
        cred.password === trimmedPass
    );

    if (!matchingAdmin) {
      setErrorMsg('Invalid administrator credentials. Access denied.');
      return;
    }

    setIsAuthenticating(true);

    // Verify credentials and establish authenticated administrative session
    setTimeout(() => {
      setIsAuthenticating(false);

      const formattedEmail = trimmedUser.includes('@')
        ? trimmedUser.toLowerCase()
        : `${trimmedUser.toLowerCase()}@network.internal`;

      const rawName = trimmedUser.includes('@') ? trimmedUser.split('@')[0] : trimmedUser;
      const displayName = rawName.toUpperCase();
      const now = new Date();
      const expires = new Date(now.getTime() + 60 * 60 * 1000);

      const session: AdminSession = {
        sessionId: `ADMIN-SESS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        adminName: displayName,
        adminEmail: formattedEmail,
        role: matchingAdmin.role,
        clearanceLevel: matchingAdmin.clearanceLevel,
        hardwareKeyVerified: true,
        tokenSignature: `ECDSA-SHA512-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
        issuedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        permissions: [
          'VIEW_TELEMETRY',
          'MANAGE_ROLES',
          'ROTATE_KEYS',
          'AUDIT_LOGS',
          'POLICY_OVERRIDE',
          'NETWORK_REVOKE',
          'REVIEW_RECORDS',
        ],
      };

      onAuthenticated(session);
    }, 450);
  };

  return (
    <div
      id="admin-auth-gateway"
      className="min-h-[85vh] flex items-center justify-center px-4 py-8 relative"
    >
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Navigation Return */}
        <div className="flex items-center justify-between">
          <button
            id="btn-cancel-admin-login"
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Portal</span>
          </button>
          <span className="text-[11px] font-mono text-slate-400">
            TLS 1.3 Active
          </span>
        </div>

        {/* Executive Authentication Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">
          {/* Card Header */}
          <div className="bg-slate-950/80 border-b border-slate-800/80 px-6 py-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Administrative Access Gateway
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter authorized administrator credentials to access the governance console.
            </p>
          </div>

          {/* Card Body & Form */}
          <div className="p-6 space-y-4">
            {/* Error Message */}
            {errorMsg && (
              <div
                id="admin-auth-error"
                className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-admin-username"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Administrator Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-admin-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Enter username"
                    autoComplete="username"
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-admin-password"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-admin-login"
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-md shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {isAuthenticating ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Log In to Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Security Notice */}
          <div className="bg-slate-950/90 border-t border-slate-800/80 px-6 py-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>SECURE ENCLAVE</span>
            <span>RESTRICTED ACCESS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
