export interface ThreatEvent {
  id: string;
  timestamp: string;
  partner: string;
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  country: string;
  ip: string;
  device: string;
  riskScore: number;
  status: 'Blocked' | 'Mitigated' | 'Suspended' | 'Challenge Required' | 'Rate Limited' | 'Quarantined' | 'Active';
}

export interface AttestedIdentity {
  id: string;
  status: 'Verified' | 'Pending' | 'Flagged' | 'Suspended';
  trustScore: number;
  partner: string;
  lastSeen: string;
  deviceReputation: 'Excellent' | 'High Trust' | 'Fair' | 'Suspended' | 'Emulator Detected' | 'High Risk';
  sessionState: 'Secured' | 'Active' | 'Challenged' | 'Blocked';
  ip: string;
  country: string;
  deviceModel: string;
  verificationHistory: { date: string; action: string; status: string }[];
  riskHistory: { date: string; trigger: string; score: number }[];
}

export interface EnterprisePartner {
  name: string;
  status: 'Active' | 'Suspended' | 'Provisioning';
  apiKey: string;
  webhookStatus: string;
  webhookUrl: string;
  projectsCount: number;
  monthlyRequests: string;
  trustScore: string;
  plan: 'Enterprise Plus' | 'Scale Premium' | 'Enterprise Base';
  connectionStatus: 'Online' | 'Offline';
  recentActivity: string;
}

export interface LibraryPolicy {
  id: string;
  category: string;
  name: string;
  description: string;
  enabled: boolean;
  mode: 'Strict' | 'Learning' | 'Disabled';
  threshold: number;
}

export interface PolicyVersion {
  version: string;
  createdBy: string;
  modifiedBy: string;
  date: string;
  description: string;
  changesCount: number;
}

export const initialThreats: ThreatEvent[] = [
  { id: 'evt-101', timestamp: '32 seconds ago', partner: 'Stripe Connect', threatType: 'Token Replay', severity: 'high', country: 'United States', ip: '18.231.14.99', device: 'iPhone 15 Pro', riskScore: 92, status: 'Blocked' },
  { id: 'evt-102', timestamp: '2 minutes ago', partner: 'Bybit Auth', threatType: 'Credential Stuffing', severity: 'critical', country: 'Netherlands', ip: '45.132.88.10', device: 'Headless Chrome', riskScore: 98, status: 'Mitigated' },
  { id: 'evt-103', timestamp: '5 minutes ago', partner: 'Kraken Prime', threatType: 'Bot Farm Detected', severity: 'critical', country: 'Germany', ip: '193.12.144.201', device: 'Linux x86_64', riskScore: 99, status: 'Suspended' },
  { id: 'evt-104', timestamp: '12 minutes ago', partner: 'Supabase Core', threatType: 'Impossible Travel', severity: 'medium', country: 'Japan', ip: '122.9.20.144', device: 'Chrome MacOS', riskScore: 72, status: 'Challenge Required' },
  { id: 'evt-105', timestamp: '24 minutes ago', partner: 'Coinbase Pay', threatType: 'API Abuse', severity: 'high', country: 'United Kingdom', ip: '82.102.23.111', device: 'Python Client', riskScore: 85, status: 'Rate Limited' },
  { id: 'evt-106', timestamp: '45 minutes ago', partner: 'Bybit Auth', threatType: 'Duplicate Human Signature', severity: 'critical', country: 'Netherlands', ip: '45.132.88.12', device: 'Android Emulator', riskScore: 97, status: 'Quarantined' }
];

export const initialIdentities: AttestedIdentity[] = [
  {
    id: 'AAN-HMN-003812',
    status: 'Verified',
    trustScore: 99.98,
    partner: 'Stripe Connect',
    lastSeen: '32 seconds ago',
    deviceReputation: 'Excellent',
    sessionState: 'Secured',
    ip: '18.231.14.99',
    country: 'United States',
    deviceModel: 'iPhone 15 Pro (iOS 17.4)',
    verificationHistory: [
      { date: '2026-07-05 08:31:02', action: 'Identity Proof Re-generated', status: 'Success' },
      { date: '2026-07-04 12:15:40', action: 'Hardware Token Verified', status: 'Success' },
      { date: '2026-07-01 09:00:12', action: 'Initial Human Attestation Issued', status: 'Success' }
    ],
    riskHistory: [
      { date: '2026-07-05 08:31:00', trigger: 'Normal telemetry validation', score: 0.02 },
      { date: '2026-07-04 12:15:39', trigger: 'IP location change', score: 0.15 }
    ]
  },
  {
    id: 'AAN-HMN-004129',
    status: 'Verified',
    trustScore: 99.52,
    partner: 'Supabase Core',
    lastSeen: '4 minutes ago',
    deviceReputation: 'High Trust',
    sessionState: 'Active',
    ip: '193.12.144.201',
    country: 'Germany',
    deviceModel: 'Chrome Mac (Intel Core i9)',
    verificationHistory: [
      { date: '2026-07-05 08:20:11', action: 'Session Secured Token', status: 'Success' },
      { date: '2026-06-28 14:10:05', action: 'Biometric Matching', status: 'Success' }
    ],
    riskHistory: [
      { date: '2026-07-05 08:20:10', trigger: 'Residential IP validation', score: 0.48 }
    ]
  },
  {
    id: 'AAN-HMN-001048',
    status: 'Flagged',
    trustScore: 62.40,
    partner: 'Bybit Auth',
    lastSeen: '12 minutes ago',
    deviceReputation: 'Fair',
    sessionState: 'Challenged',
    ip: '45.132.88.10',
    country: 'Netherlands',
    deviceModel: 'Firefox Linux (Ubuntu 22.04)',
    verificationHistory: [
      { date: '2026-07-05 08:10:55', action: 'Identity Proof Requested', status: 'Challenged' },
      { date: '2026-07-03 16:22:10', action: 'Device Attestation Checked', status: 'Success' }
    ],
    riskHistory: [
      { date: '2026-07-05 08:10:52', trigger: 'VPN endpoint detected', score: 37.60 }
    ]
  },
  {
    id: 'AAN-HMN-009210',
    status: 'Verified',
    trustScore: 98.81,
    partner: 'Coinbase Pay',
    lastSeen: '24 minutes ago',
    deviceReputation: 'Excellent',
    sessionState: 'Secured',
    ip: '122.9.20.144',
    country: 'Japan',
    deviceModel: 'Sony Xperia (Android 14)',
    verificationHistory: [
      { date: '2026-07-05 07:55:12', action: 'Attestation Signed', status: 'Success' }
    ],
    riskHistory: [
      { date: '2026-07-05 07:55:10', trigger: 'Normal telemetry validation', score: 1.19 }
    ]
  },
  {
    id: 'AAN-HMN-005001',
    status: 'Suspended',
    trustScore: 12.04,
    partner: 'Kraken Prime',
    lastSeen: '2 hours ago',
    deviceReputation: 'Emulator Detected',
    sessionState: 'Blocked',
    ip: '82.102.23.111',
    country: 'United Kingdom',
    deviceModel: 'Android Emulator (pixel_6_pro)',
    verificationHistory: [
      { date: '2026-07-05 06:12:00', action: 'Sovereign Proof Blocked', status: 'Failed' }
    ],
    riskHistory: [
      { date: '2026-07-05 06:11:59', trigger: 'Emulator signature detected', score: 87.96 }
    ]
  }
];

export const initialPartners: EnterprisePartner[] = [
  { name: 'Stripe Connect', status: 'Active', apiKey: 'aan_sk_live_stripe_99a8f2f8101bb2e80c9861', webhookUrl: 'https://api.stripe.com/v1/webhooks/aan', webhookStatus: 'Healthy (200 OK)', projectsCount: 12, monthlyRequests: '1,249,283', trustScore: '99.98%', plan: 'Enterprise Plus', connectionStatus: 'Online', recentActivity: 'Session verified 32s ago' },
  { name: 'Supabase Core', status: 'Active', apiKey: 'aan_sk_live_supabase_a19f82d1c9ef0052a', webhookUrl: 'https://api.supabase.co/aan/webhooks/v2', webhookStatus: 'Healthy (200 OK)', projectsCount: 4, monthlyRequests: '842,910', trustScore: '99.52%', plan: 'Scale Premium', connectionStatus: 'Online', recentActivity: 'Proof issued 4m ago' },
  { name: 'Bybit Auth', status: 'Active', apiKey: 'aan_sk_live_bybit_cc1100df990b7a82ff2', webhookUrl: 'https://api.bybit.com/security/aan-sync', webhookStatus: 'Muted (Inactive)', projectsCount: 3, monthlyRequests: '411,048', trustScore: '94.81%', plan: 'Enterprise Base', connectionStatus: 'Online', recentActivity: 'Threat blocked 2m ago' },
  { name: 'Coinbase Pay', status: 'Active', apiKey: 'aan_sk_live_coinbase_b4412a877eff1032b9', webhookUrl: 'https://api.coinbase.com/v2/aan/callback', webhookStatus: 'Healthy (200 OK)', projectsCount: 8, monthlyRequests: '981,040', trustScore: '98.81%', plan: 'Enterprise Plus', connectionStatus: 'Online', recentActivity: 'Verification request 24m ago' },
  { name: 'Kraken Prime', status: 'Suspended', apiKey: 'aan_sk_live_kraken_c59aef9021ddaa981d', webhookUrl: 'https://api.kraken.com/auth/proof-receive', webhookStatus: 'Failing (503 Error)', projectsCount: 2, monthlyRequests: '219,833', trustScore: '82.04%', plan: 'Scale Premium', connectionStatus: 'Offline', recentActivity: 'Audit triggered 2h ago' }
];

export const initialPolicyLibrary: LibraryPolicy[] = [
  { id: 'lib-01', category: 'Duplicate Detection', name: 'Anti-Sybil Duplicate Defense', description: 'Prevent duplicate identities across the network.', enabled: true, mode: 'Strict', threshold: 95 },
  { id: 'lib-02', category: 'Bot Detection', name: 'Headless Browser Guard', description: 'Block bots and emulators from authenticating.', enabled: true, mode: 'Strict', threshold: 99 },
  { id: 'lib-03', category: 'Automation Detection', name: 'Synthetic Pattern Shield', description: 'Detect script-based synthetic mouse/touch behavior.', enabled: true, mode: 'Learning', threshold: 80 },
  { id: 'lib-04', category: 'Credential Stuffing', name: 'Rapid Password Stuffing Containment', description: 'Mitigate brute-force stuffing and automated spraying.', enabled: true, mode: 'Strict', threshold: 90 },
  { id: 'lib-05', category: 'Impossible Travel', name: 'Geo-Velocity Anomaly Engine', description: 'Detect physically impossible sequential logins.', enabled: true, mode: 'Strict', threshold: 75 },
  { id: 'lib-06', category: 'VPN Detection', name: 'Proxy and Residential Tunnel Block', description: 'Enforce genuine device locations over proxy chains.', enabled: true, mode: 'Learning', threshold: 40 },
  { id: 'lib-07', category: 'Proxy Detection', name: 'Datacenter Subnet Block', description: 'Auto-restrict authentications from AWS, GCP, Azure subnets.', enabled: true, mode: 'Strict', threshold: 98 },
  { id: 'lib-08', category: 'Disposable Email', name: 'Burner Domain Verification Block', description: 'Prevent bot accounts using temporary mail networks.', enabled: true, mode: 'Strict', threshold: 100 },
  { id: 'lib-09', category: 'Device Reputation', name: 'Hardware Signal Fingerprint Analyzer', description: 'Score authentications against OS tampering registers.', enabled: true, mode: 'Strict', threshold: 85 },
  { id: 'lib-10', category: 'Token Replay', name: 'Cryptographic Nonce Expiration Guard', description: 'Block replayed identity proofs instantly.', enabled: true, mode: 'Strict', threshold: 100 },
  { id: 'lib-11', category: 'API Abuse', name: 'Gateway Rate-Limit Protection', description: 'Auto rate-limit brute API keys and tokens.', enabled: true, mode: 'Strict', threshold: 500 },
  { id: 'lib-12', category: 'Session Hijacking', name: 'Cookie Fingerprint Drift Monitor', description: 'Verify IP/UA consistency inside active sessions.', enabled: true, mode: 'Learning', threshold: 90 },
  { id: 'lib-13', category: 'Account Sharing', name: 'Multi-Geo Device Correlation', description: 'Flag accounts sharing proofs in distinct geographies.', enabled: false, mode: 'Disabled', threshold: 60 },
  { id: 'lib-14', category: 'New Device Review', name: 'Step-Up Verification', description: 'Require secure MFA when a device is seen first time.', enabled: true, mode: 'Learning', threshold: 70 },
  { id: 'lib-15', category: 'Risk Escalation', name: 'Dynamic Global Index Escalation', description: 'Enforce higher proof levels when global threats spike.', enabled: true, mode: 'Learning', threshold: 80 },
  { id: 'lib-16', category: 'Emulator Detection', name: 'Virtual Machine / Sandbox Containment', description: 'Instantly deny attestations running on virtualization.', enabled: true, mode: 'Strict', threshold: 95 },
  { id: 'lib-17', category: 'Human Challenge', name: 'Fallback Biometric Probe', description: 'Trigger real-time human challenge under validation doubt.', enabled: true, mode: 'Strict', threshold: 85 },
  { id: 'lib-18', category: 'Behavior Anomaly', name: 'Machine Learning Telemetry Guard', description: 'Analyze real-time interaction patterns to detect bots.', enabled: true, mode: 'Learning', threshold: 75 }
];

export const policyVersions: PolicyVersion[] = [
  { version: 'v2.4.1', createdBy: 'admin_compliance@aan.com', modifiedBy: 'admin_sec_analyst@aan.com', date: 'July 5, 2026', description: 'Adjusted Resident Proxy thresholds for APAC region', changesCount: 4 },
  { version: 'v2.4.0', createdBy: 'admin_super_user@aan.com', modifiedBy: 'admin_super_user@aan.com', date: 'June 28, 2026', description: 'Redefined core Sybil Duplicate protection ruleset', changesCount: 12 },
  { version: 'v2.3.9', createdBy: 'admin_compliance@aan.com', modifiedBy: 'admin_compliance@aan.com', date: 'June 15, 2026', description: 'Initial deployment of Impossible Velocity standards', changesCount: 2 }
];
