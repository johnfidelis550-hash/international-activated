export interface IntakeRecord {
  recordId: string;
  fullName: string;
  accountId: string;
  businessEmail: string;
  contactEmail?: string;
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  remediationNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  verificationHash?: string;
  institutionName?: string;
  corporateEmail?: string;
  accountReference?: string;
  entityName?: string;
  securityToken?: string;
}

export interface AuthCredentials {
  identity: string;
  password: string;
  domain: string;
  mfaCode: string;
  rememberDevice: boolean;
}

export type WorkflowStep = 'intake' | 'loading' | 'operational_status' | 'admin_login' | 'admin_dashboard';

// Role-Based Access Control (RBAC) & Administrative Segregation
export type AdminRole = 'SUPER_ADMIN' | 'SEC_ADMIN' | 'AUDITOR' | 'OPERATOR' | 'USER';

export type Permission =
  | 'VIEW_TELEMETRY'
  | 'MANAGE_ROLES'
  | 'ROTATE_KEYS'
  | 'AUDIT_LOGS'
  | 'POLICY_OVERRIDE'
  | 'NETWORK_REVOKE'
  | 'REVIEW_RECORDS';

export interface AdminSession {
  sessionId: string;
  adminName: string;
  adminEmail: string;
  role: AdminRole;
  clearanceLevel: number; // 1 to 5
  hardwareKeyVerified: boolean;
  tokenSignature: string;
  issuedAt: string;
  expiresAt: string;
  permissions: Permission[];
}

export interface NodeStatus {
  id: string;
  name: string;
  region: string;
  status: 'HEALTHY' | 'SYNCING' | 'STANDBY' | 'QUARANTINED';
  loadPercent: number;
  latencyMs: number;
  tlsVersion: string;
  fipsCompliant: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: AdminRole;
  action: string;
  resource: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  sigHash: string;
  authorized: boolean;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  minClearance: number;
  category: 'CRYPTOGRAPHY' | 'NETWORK' | 'SESSION' | 'IDENTITY';
}

export interface ProvisionedIdentity {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  department: string;
  status: 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED';
  lastActive: string;
  mfaEnforced: boolean;
  clearanceLevel: number;
}
