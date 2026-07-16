import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Monitor, 
  Key, 
  Activity, 
  Shield, 
  Clock, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  FileJson,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  HelpCircle,
  AlertCircle,
  Network,
  Sliders,
  Settings2,
  GitBranch,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseService';

// Interfaces based on requested schema
export interface VerifiedHuman {
  id: string;
  name: string;
  status: 'within_policy' | 'needs_review' | 'exceeds_policy';
  lastSeen: string;
  avgTrustScore: number;
  highestRiskScore: number;
  relationshipConfidence: number;
  totalAccounts: number;
  knownDevicesCount: number;
}

export interface AssociatedAccount {
  id: string;
  humanId: string;
  email: string;
  accountType: 'Personal' | 'Business' | 'Developer Sandbox' | 'Customer Support' | 'Guest';
  createdAt: string;
  lastLogin: string;
}

export interface TrustDevice {
  id: string;
  humanId: string;
  name: string;
  type: string;
  status: 'trusted' | 'unknown' | 'blocked';
  lastUsedIp: string;
  fingerprintScore: number;
}

export interface TrustTimelineItem {
  id: string;
  humanId: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  relatedDecision: string;
  relatedEntity?: string;
}

export interface TrustRelationship {
  id: string;
  humanId: string;
  type: 'Associated Account' | 'Shared Hardware Profile' | 'Network Proxy Match' | 'Coordinated Signup Velocity';
  source: string;
  target: string;
  confidence: number;
  evidence: string[];
  status: 'active_trusted' | 'review_recommended' | 'flagged';
  recommendation: string;
}

export interface PolicyEvaluation {
  humanId: string;
  policyMatched: string;
  evidence: string[];
  confidence: number;
  recommendation: 'ALLOW' | 'STEP_UP' | 'REVIEW' | 'DENY' | 'FLAG_ONLY';
  explanation: string;
}

export interface TrustCluster {
  id: string;
  name: string;
  riskScore: number;
  confidenceScore: number;
  status: 'high_confidence' | 'mixed_signals' | 'suspicious' | 'incomplete';
  algorithm: 'louvain' | 'leiden' | 'manual_review' | 'heuristic';
  verifiedHumansCount: number;
  partnerAccountsCount: number;
  trustDevicesCount: number;
  eventsCount: number;
  decisionsCount: number;
  lastActivity: string;
  associatedHumanIds: string[];
}

export const MOCK_CLUSTERS: TrustCluster[] = [
  {
    id: "cluster_98a1",
    name: "Secure Developer Enclave (Cluster #104)",
    riskScore: 6,
    confidenceScore: 98,
    status: "high_confidence",
    algorithm: "louvain",
    verifiedHumansCount: 1,
    partnerAccountsCount: 3,
    trustDevicesCount: 2,
    eventsCount: 12,
    decisionsCount: 12,
    lastActivity: "2026-07-05T23:10:00Z",
    associatedHumanIds: ["vh_92a83b10"]
  },
  {
    id: "cluster_12b4",
    name: "Coordinated Crawler Fleet (Cluster #211)",
    riskScore: 89,
    confidenceScore: 92,
    status: "suspicious",
    algorithm: "louvain",
    verifiedHumansCount: 1,
    partnerAccountsCount: 12,
    trustDevicesCount: 5,
    eventsCount: 45,
    decisionsCount: 42,
    lastActivity: "2026-07-05T22:45:00Z",
    associatedHumanIds: ["vh_03b8e912"]
  },
  {
    id: "cluster_44f8",
    name: "Dormant Ban Evasion Ring (Cluster #319)",
    riskScore: 68,
    confidenceScore: 94,
    status: "mixed_signals",
    algorithm: "heuristic",
    verifiedHumansCount: 1,
    partnerAccountsCount: 2,
    trustDevicesCount: 3,
    eventsCount: 8,
    decisionsCount: 6,
    lastActivity: "2026-07-05T23:22:00Z",
    associatedHumanIds: ["vh_7f2d5e3c"]
  }
];

// 8. SAMPLE MOCK DATA FOR DEMONSTRATION
const MOCK_HUMANS: VerifiedHuman[] = [
  {
    id: "vh_92a83b10",
    name: "Verified Human A (Alice Vance)",
    status: "within_policy",
    lastSeen: "2026-07-05T23:10:00Z",
    avgTrustScore: 94,
    highestRiskScore: 8,
    relationshipConfidence: 98,
    totalAccounts: 3,
    knownDevicesCount: 2
  },
  {
    id: "vh_03b8e912",
    name: "Verified Human B (Unknown Proxy Operator)",
    status: "needs_review",
    lastSeen: "2026-07-05T22:45:00Z",
    avgTrustScore: 32,
    highestRiskScore: 89,
    relationshipConfidence: 92,
    totalAccounts: 12,
    knownDevicesCount: 5
  },
  {
    id: "vh_7f2d5e3c",
    name: "Verified Human C (Evasion Pattern detected)",
    status: "exceeds_policy",
    lastSeen: "2026-07-05T23:22:00Z",
    avgTrustScore: 45,
    highestRiskScore: 94,
    relationshipConfidence: 94,
    totalAccounts: 2,
    knownDevicesCount: 3
  }
];

const MOCK_ACCOUNTS: AssociatedAccount[] = [
  // Human A
  { id: "acc_usr_alice_personal", humanId: "vh_92a83b10", email: "alice.vance@gmail.com", accountType: "Personal", createdAt: "2026-01-15", lastLogin: "15 minutes ago" },
  { id: "acc_usr_alice_business", humanId: "vh_92a83b10", email: "alice@vance-consulting.co", accountType: "Business", createdAt: "2026-03-22", lastLogin: "3 hours ago" },
  { id: "acc_usr_alice_sandbox", humanId: "vh_92a83b10", email: "alice-dev-sandbox@vance.io", accountType: "Developer Sandbox", createdAt: "2026-06-10", lastLogin: "1 day ago" },

  // Human B (12 accounts - representative sample shown in lists)
  { id: "acc_usr_bulk_01", humanId: "vh_03b8e912", email: "crawler_node_99@dispostable.com", accountType: "Personal", createdAt: "2026-07-05", lastLogin: "Just now" },
  { id: "acc_usr_bulk_02", humanId: "vh_03b8e912", email: "crawler_node_100@dispostable.com", accountType: "Personal", createdAt: "2026-07-05", lastLogin: "1 minute ago" },
  { id: "acc_usr_bulk_03", humanId: "vh_03b8e912", email: "crawler_node_101@dispostable.com", accountType: "Personal", createdAt: "2026-07-05", lastLogin: "2 minutes ago" },
  { id: "acc_usr_bulk_04", humanId: "vh_03b8e912", email: "temp_usr_882@outlook.com", accountType: "Guest", createdAt: "2026-07-05", lastLogin: "5 minutes ago" },
  { id: "acc_usr_bulk_05", humanId: "vh_03b8e912", email: "temp_usr_883@outlook.com", accountType: "Guest", createdAt: "2026-07-05", lastLogin: "10 minutes ago" },
  { id: "acc_usr_bulk_06", humanId: "vh_03b8e912", email: "test_shopp_77a@yahoo.com", accountType: "Personal", createdAt: "2026-07-05", lastLogin: "12 minutes ago" },

  // Human C
  { id: "acc_usr_evader_new", humanId: "vh_7f2d5e3c", email: "johnny.vaughn+signup@gmail.com", accountType: "Personal", createdAt: "2026-07-05", lastLogin: "Just now" },
  { id: "acc_usr_evader_old_banned", humanId: "vh_7f2d5e3c", email: "johnny_banned_fraud@gmail.com", accountType: "Personal", createdAt: "2024-11-12", lastLogin: "Banned 48h ago" }
];

const MOCK_DEVICES: TrustDevice[] = [
  // Human A
  { id: "dev_iphone_15", humanId: "vh_92a83b10", name: "Trusted iPhone 15 Pro", type: "Mobile (iOS)", status: "trusted", lastUsedIp: "67.185.244.102", fingerprintScore: 99 },
  { id: "dev_macbook_pro", humanId: "vh_92a83b10", name: "Work Macbook Pro 16", type: "Desktop (macOS)", status: "trusted", lastUsedIp: "12.89.44.10", fingerprintScore: 96 },

  // Human B
  { id: "dev_headless_node_1", humanId: "vh_03b8e912", name: "Unknown Chrome Linux Node", type: "Cloud VM", status: "unknown", lastUsedIp: "185.190.141.2", fingerprintScore: 12 },
  { id: "dev_headless_node_2", humanId: "vh_03b8e912", name: "Unknown Chrome Windows Server", type: "Cloud VM", status: "unknown", lastUsedIp: "185.190.141.5", fingerprintScore: 14 },
  { id: "dev_headless_node_3", humanId: "vh_03b8e912", name: "Slightly Altered Headless UserAgent", type: "Cloud VM", status: "unknown", lastUsedIp: "185.220.101.44", fingerprintScore: 8 },

  // Human C
  { id: "dev_banned_android", humanId: "vh_7f2d5e3c", name: "Banned OnePlus 11 Phone", type: "Mobile (Android)", status: "blocked", lastUsedIp: "74.120.14.88", fingerprintScore: 95 },
  { id: "dev_compromised_chrome", humanId: "vh_7f2d5e3c", name: "Suspect Chrome 125 Windows", type: "Desktop (Windows)", status: "unknown", lastUsedIp: "74.120.14.88", fingerprintScore: 42 }
];

const MOCK_TIMELINE: TrustTimelineItem[] = [
  // Human A
  { id: "tl_1", humanId: "vh_92a83b10", timestamp: "2026-01-15T09:21:00Z", title: "Account Created", description: "Personal Account registered (alice.vance@gmail.com)", severity: "low", relatedDecision: "ALLOW", relatedEntity: "acc_usr_alice_personal" },
  { id: "tl_2", humanId: "vh_92a83b10", timestamp: "2026-01-15T09:24:00Z", title: "Human Verified", description: "Successfully established cryptographic anchor", severity: "low", relatedDecision: "ALLOW" },
  { id: "tl_3", humanId: "vh_92a83b10", timestamp: "2026-01-15T09:25:00Z", title: "New Device Added", description: "Device registered as trusted hardware identifier", severity: "low", relatedDecision: "ALLOW", relatedEntity: "dev_iphone_15" },
  { id: "tl_4", humanId: "vh_92a83b10", timestamp: "2026-03-22T14:10:00Z", title: "Account Associated", description: "Business Account linked to existing verified human", severity: "low", relatedDecision: "ALLOW", relatedEntity: "acc_usr_alice_business" },
  { id: "tl_5", humanId: "vh_92a83b10", timestamp: "2026-07-05T23:10:00Z", title: "Login Allowed", description: "Successful login using trusted iPhone device", severity: "low", relatedDecision: "ALLOW", relatedEntity: "dev_iphone_15" },

  // Human B
  { id: "tl_b1", humanId: "vh_03b8e912", timestamp: "2026-07-05T22:00:00Z", title: "Account Created", description: "Account crawler_node_99 created", severity: "medium", relatedDecision: "ALLOW" },
  { id: "tl_b2", humanId: "vh_03b8e912", timestamp: "2026-07-05T22:01:00Z", title: "Human Verified", description: "Partial low-confidence validation", severity: "medium", relatedDecision: "ALLOW" },
  { id: "tl_b3", humanId: "vh_03b8e912", timestamp: "2026-07-05T22:05:00Z", title: "Suspicious Login Detected", description: "Automated browser signs in from DigitalOcean VM", severity: "high", relatedDecision: "STEP_UP", relatedEntity: "dev_headless_node_1" },
  { id: "tl_b4", humanId: "vh_03b8e912", timestamp: "2026-07-05T22:15:00Z", title: "Account Associated", description: "New account crawler_node_100 associated with same verified human signature", severity: "high", relatedDecision: "FLAG_ONLY", relatedEntity: "acc_usr_bulk_02" },
  { id: "tl_b5", humanId: "vh_03b8e912", timestamp: "2026-07-05T22:45:00Z", title: "Policy Exceeded", description: "Maximum associated accounts limit (10) reached for single human signature", severity: "critical", relatedDecision: "REVIEW" },

  // Human C
  { id: "tl_c1", humanId: "vh_7f2d5e3c", timestamp: "2024-11-12T10:00:00Z", title: "Account Created", description: "Old account johnny_banned_fraud@gmail.com created", severity: "low", relatedDecision: "ALLOW" },
  { id: "tl_c2", humanId: "vh_7f2d5e3c", timestamp: "2026-07-03T18:00:00Z", title: "Suspicious Activity Detected", description: "Payment fraud triggers full account ban", severity: "critical", relatedDecision: "DENY", relatedEntity: "acc_usr_evader_old_banned" },
  { id: "tl_c3", humanId: "vh_7f2d5e3c", timestamp: "2026-07-05T23:20:00Z", title: "New Account Attempt", description: "Attempted registration with fresh email alias (johnny.vaughn+signup@gmail.com)", severity: "high", relatedDecision: "REVIEW", relatedEntity: "acc_usr_evader_new" },
  { id: "tl_c4", humanId: "vh_7f2d5e3c", timestamp: "2026-07-05T23:22:00Z", title: "Review Recommended", description: "AAN flag triggered due to blacklisted hardware profile match", severity: "high", relatedDecision: "STEP_UP", relatedEntity: "dev_banned_android" }
];

const MOCK_RELATIONSHIPS: TrustRelationship[] = [
  // Human A
  {
    id: "rel_1",
    humanId: "vh_92a83b10",
    type: "Associated Account",
    source: "acc_usr_alice_personal",
    target: "acc_usr_alice_business",
    confidence: 99,
    evidence: ["Same verified human cryptographic anchor", "Sharing domestic trusted hardware profile", "Identical residential IP subnets"],
    status: "active_trusted",
    recommendation: "Accept accounts within standard corporate onboarding policy."
  },
  {
    id: "rel_2",
    humanId: "vh_92a83b10",
    type: "Shared Hardware Profile",
    source: "dev_iphone_15",
    target: "acc_usr_alice_sandbox",
    confidence: 98,
    evidence: ["Identical WebGL GPU and canvas hash match", "Secure local keychain proof validity"],
    status: "active_trusted",
    recommendation: "Allow seamless login; standard sandbox developer usage patterns matched."
  },

  // Human B
  {
    id: "rel_b1",
    humanId: "vh_03b8e912",
    type: "Associated Account",
    source: "acc_usr_bulk_01",
    target: "acc_usr_bulk_02",
    confidence: 92,
    evidence: ["Coordinated rapid signup times (within seconds)", "Identical headless Selenium user-agent fingerprint", "Same cloud server IP address range"],
    status: "flagged",
    recommendation: "Route accounts to review queue. Flagged for suspicious coordinated signup velocity."
  },
  {
    id: "rel_b2",
    humanId: "vh_03b8e912",
    type: "Network Proxy Match",
    source: "dev_headless_node_1",
    target: "dev_headless_node_3",
    confidence: 95,
    evidence: ["Rotating nodes within the same Tor exit node sub-classification", "No physical user hardware biometrics detected"],
    status: "review_recommended",
    recommendation: "Enforce a Step-Up multi-factor check or puzzle proof on these endpoints."
  },

  // Human C
  {
    id: "rel_c1",
    humanId: "vh_7f2d5e3c",
    type: "Associated Account",
    source: "acc_usr_evader_new",
    target: "acc_usr_evader_old_banned",
    confidence: 94,
    evidence: ["Same hardware device WebGL signature matched", "Identical residential location and local carrier profile", "Close email name lexicographical similarity"],
    status: "flagged",
    recommendation: "Review according to your organization policy. This profile matches a previously banned account."
  }
];

const MOCK_EVALUATIONS: PolicyEvaluation[] = [
  {
    humanId: "vh_92a83b10",
    policyMatched: "Maximum associated accounts limit",
    evidence: ["3 active linked developer/personal accounts", "2 trusted domestic devices"],
    confidence: 99,
    recommendation: "ALLOW",
    explanation: "The verified human has 3 active accounts, which is well below the organization's maximum policy limit of 10. Signals remain stable."
  },
  {
    humanId: "vh_03b8e912",
    policyMatched: "Flag rapid account creation & bot patterns",
    evidence: ["12 accounts registered under 4 minutes", "5 unknown automated server devices matched", "Zero real user biometrics recorded"],
    confidence: 92,
    recommendation: "REVIEW",
    explanation: "This pattern strongly exceeds the organization policy limit of 10 maximum accounts per human. The coordinated headless activity warrants immediate administrative review."
  },
  {
    humanId: "vh_7f2d5e3c",
    policyMatched: "Flag possible ban evasion",
    evidence: ["WebGL signature match to account banned 48h ago for fraud", "New registration from matching IP address subnet"],
    confidence: 94,
    recommendation: "STEP_UP",
    explanation: "The user session shares an unmistakable relationship with a previously banned account. We recommend a high-friction step-up proof before proceeding."
  }
];

export default function TrustGraphTab() {
  const [humans, setHumans] = useState<VerifiedHuman[]>(MOCK_HUMANS);
  const [clusters, setClusters] = useState<TrustCluster[]>(MOCK_CLUSTERS);
  const [accounts, setAccounts] = useState<AssociatedAccount[]>(MOCK_ACCOUNTS);
  const [devices, setDevices] = useState<TrustDevice[]>(MOCK_DEVICES);
  const [relationships, setRelationships] = useState<TrustRelationship[]>(MOCK_RELATIONSHIPS);
  const [timeline, setTimeline] = useState<TrustTimelineItem[]>(MOCK_TIMELINE);
  const [evaluations, setEvaluations] = useState<PolicyEvaluation[]>(MOCK_EVALUATIONS);

  const [selectedHumanId, setSelectedHumanId] = useState<string>(MOCK_HUMANS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubView, setActiveSubView] = useState<'graph' | 'intelligence' | 'timeline'>('graph');
  const [showClaimsJson, setShowClaimsJson] = useState<boolean>(false);

  // Clustering engine states
  const [activeAlgorithm, setActiveAlgorithm] = useState<'louvain' | 'leiden' | 'manual_review' | 'heuristic'>('louvain');
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'all' | 'high_confidence' | 'mixed_signals' | 'suspicious'>('all');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [resolution, setResolution] = useState<number>(0.85);
  const [showAccounts, setShowAccounts] = useState<boolean>(true);
  const [showDevices, setShowDevices] = useState<boolean>(true);
  const [showDecisions, setShowDecisions] = useState<boolean>(true);
  const [selectedSubNode, setSelectedSubNode] = useState<{ type: string; name: string; status?: string; details?: string } | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState<any>(null);

  // Sync Trust Graph data dynamically from the stateful database/backend
  useEffect(() => {
    let isMounted = true;
    
    const fetchGraphData = async () => {
      try {
        const data = await supabaseService.getTrustGraphData();
        if (!isMounted || !data) return;

        // Fetch graph analysis summary
        try {
          const summaryRes = await fetch("/api/trust/graph/analysis-summary");
          if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            if (isMounted) setAnalysisSummary(summaryData);
          }
        } catch (summaryErr) {
          console.warn("[TrustGraphTab] Failed to fetch graph summary:", summaryErr);
        }

        // Map humans
        if (data.humans && data.humans.length > 0) {
          const mappedHumans: VerifiedHuman[] = data.humans.map((h: any) => ({
            id: h.id,
            name: h.name,
            status: h.status || 'within_policy',
            lastSeen: h.last_seen || h.created_at || new Date().toISOString(),
            avgTrustScore: h.avg_trust_score || 90,
            highestRiskScore: h.highest_risk_score || 10,
            relationshipConfidence: h.relationship_confidence || 95,
            totalAccounts: h.total_accounts || 1,
            knownDevicesCount: h.known_devices_count || 1
          }));
          setHumans(mappedHumans);
          
          // Keep selected ID valid
          setSelectedHumanId(prevId => {
            if (mappedHumans.some(h => h.id === prevId)) return prevId;
            return mappedHumans[0].id;
          });
        }

        // Map clusters
        if (data.clusters && data.clusters.length > 0) {
          const mappedClusters: TrustCluster[] = data.clusters.map((c: any) => ({
            id: c.id,
            name: c.name,
            riskScore: c.risk_score || 0,
            confidenceScore: c.confidence_score || 95,
            status: c.status || 'high_confidence',
            algorithm: c.algorithm || 'louvain',
            verifiedHumansCount: c.verified_humans_count || 1,
            partnerAccountsCount: c.partner_accounts_count || 1,
            trustDevicesCount: c.trust_devices_count || 1,
            eventsCount: c.events_count || 0,
            decisionsCount: c.decisions_count || 0,
            lastActivity: c.last_activity || new Date().toISOString(),
            associatedHumanIds: (data.humans || []).filter((h: any) => h.primary_cluster_id === c.id || h.cluster_id === c.id).map((h: any) => h.id)
          }));
          setClusters(mappedClusters);
        }

        // Map accounts
        if (data.accounts && data.accounts.length > 0) {
          const mappedAccounts: AssociatedAccount[] = data.accounts.map((a: any) => ({
            id: a.id,
            humanId: a.human_id,
            email: a.email,
            accountType: a.account_type || 'Personal',
            createdAt: a.created_at || new Date().toISOString(),
            lastLogin: a.last_login || 'Just now'
          }));
          setAccounts(mappedAccounts);
        }

        // Map devices
        if (data.devices && data.devices.length > 0) {
          const mappedDevices: TrustDevice[] = data.devices.map((d: any) => ({
            id: d.id,
            humanId: d.human_id,
            name: d.name,
            type: d.type || 'Desktop',
            status: d.status || 'trusted',
            lastUsedIp: d.last_used_ip || '127.0.0.1',
            fingerprintScore: d.fingerprint_score || 90
          }));
          setDevices(mappedDevices);
        }

        // Map relationships
        if (data.relationships && data.relationships.length > 0) {
          const mappedRelationships: TrustRelationship[] = data.relationships.map((r: any) => ({
            id: r.id,
            humanId: r.human_id,
            type: r.type || 'Associated Account',
            source: r.source,
            target: r.target,
            confidence: r.confidence || 95,
            evidence: r.evidence || [],
            status: r.status || 'active_trusted',
            recommendation: r.recommendation || 'No action needed'
          }));
          setRelationships(mappedRelationships);
        }

        // Map timeline
        if (data.timeline && data.timeline.length > 0) {
          const mappedTimeline: TrustTimelineItem[] = data.timeline.map((t: any) => ({
            id: t.id,
            humanId: t.human_id,
            timestamp: t.timestamp || new Date().toISOString(),
            title: t.event || 'Security Logged',
            description: t.description || 'Verification state logged',
            severity: t.trust_score_change && Number(t.trust_score_change) < -30 ? 'high' : 'low',
            relatedDecision: t.event_id || 'dec_01'
          }));
          setTimeline(mappedTimeline);
        }

        // Map decisions (evaluations)
        if (data.decisions && data.decisions.length > 0) {
          const mappedEvaluations: PolicyEvaluation[] = data.decisions.map((d: any) => ({
            humanId: d.human_id,
            policyMatched: d.policy_matched || 'Default policy check',
            evidence: d.evidence || [],
            confidence: d.confidence || 95,
            recommendation: d.recommendation || 'ALLOW',
            explanation: d.explanation || 'No anomalies detected.'
          }));
          setEvaluations(mappedEvaluations);
        }

      } catch (err) {
        console.warn("[TrustGraphTab] Real-time graph sync failed:", err);
      }
    };

    fetchGraphData();
    const interval = setInterval(fetchGraphData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Trigger simulated partition refinement
  const handleRefinePartitions = () => {
    setIsRefining(true);
    setTimeout(() => {
      setIsRefining(false);
    }, 1200);
  };

  // Filter humans by search
  const filteredHumans = humans.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentHuman = humans.find(h => h.id === selectedHumanId) || humans[0] || MOCK_HUMANS[0];
  
  // Computed cluster states
  const currentCluster = clusters.find(c => c.associatedHumanIds.includes(selectedHumanId)) || clusters[0] || MOCK_CLUSTERS[0];
  
  const filteredClusters = clusters.filter(c => {
    if (riskFilter !== 'all' && c.status !== riskFilter) return false;
    return true;
  });
  
  // Human data subsets
  const humanAccounts = accounts.filter(a => a.humanId === selectedHumanId);
  const humanDevices = devices.filter(d => d.humanId === selectedHumanId);
  const humanTimeline = timeline.filter(t => t.humanId === selectedHumanId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const humanRelationships = relationships.filter(r => r.humanId === selectedHumanId);
  const humanEvaluation = evaluations.find(e => e.humanId === selectedHumanId);

  // Generate real-time claims object for JSON view
  const currentClaimsJson = {
    iss: "aan-trust-intelligence",
    sub: currentHuman.id,
    aud: "partner-platform-client",
    iat: Math.floor(Date.now() / 1000),
    relationship_summary: {
      associated_accounts_count: currentHuman.totalAccounts,
      known_devices_count: currentHuman.knownDevicesCount,
      avg_trust_score: currentHuman.avgTrustScore,
      highest_recent_risk: currentHuman.highestRiskScore,
      relationship_confidence: currentHuman.relationshipConfidence,
      policy_status: currentHuman.status
    },
    policy_evaluation: {
      matched_rules: humanEvaluation?.policyMatched || "Standard Profile Check",
      evidence_captured: humanEvaluation?.evidence || [],
      recommended_action: humanEvaluation?.recommendation || "ALLOW",
      explanation: humanEvaluation?.explanation || ""
    },
    verified_relationships: humanRelationships.map(r => ({
      relationship_id: r.id,
      type: r.type,
      source_ref: r.source,
      target_ref: r.target,
      confidence_score: r.confidence,
      reasons: r.evidence
    }))
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
      
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Trust Graph & Relationship Intelligence</h2>
          <p className="text-xs text-[#58E38A] mt-1 font-medium">
            Understand non-accusatory associations between verified humans, accounts, devices, and policies.
          </p>
        </div>
        <div className="flex bg-black/40 border border-white/[0.08] p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubView('graph')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeSubView === 'graph' ? 'bg-[#58E38A]/15 text-[#58E38A] font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Trust Graph
          </button>
          <button
            onClick={() => setActiveSubView('intelligence')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeSubView === 'intelligence' ? 'bg-[#58E38A]/15 text-[#58E38A] font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Intelligence
          </button>
          <button
            onClick={() => setActiveSubView('timeline')}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeSubView === 'timeline' ? 'bg-[#58E38A]/15 text-[#58E38A] font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Trust Timeline
          </button>
        </div>
      </div>

      {/* Real-time Graph Intelligence Metrics Panel */}
      {analysisSummary?.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Network Nodes</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white font-mono">{analysisSummary.metrics.totalNodes}</span>
              <span className="text-[10px] text-slate-400">entities</span>
            </div>
          </div>

          <div className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Network Edges</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white font-mono">{analysisSummary.metrics.totalEdges}</span>
              <span className="text-[10px] text-slate-400">relationships</span>
            </div>
          </div>

          <div className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Modularity Density (Q)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-purple-400 font-mono">
                {analysisSummary.metrics.modularityQ?.toFixed(3) || "0.760"}
              </span>
              <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1 rounded uppercase font-mono">Louvain</span>
            </div>
          </div>

          <div className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Uniqueness Ratio</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#58E38A] font-mono">{analysisSummary.metrics.uniquenessScore}%</span>
              <span className="text-[10px] text-slate-400">bot-free</span>
            </div>
          </div>

          <div className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-xl space-y-1 col-span-2 md:col-span-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Hops to Denied Asset</span>
            <div>
              {(() => {
                const pathInfo = analysisSummary.shortest_paths?.[selectedHumanId];
                if (!pathInfo || pathInfo.distance === Infinity) {
                  return (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Isolated & Secure
                    </div>
                  );
                } else if (pathInfo.distance === 0) {
                  return (
                    <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Denied Entity
                    </div>
                  );
                } else {
                  return (
                    <div className={`flex items-center gap-1.5 text-xs font-semibold mt-1 ${pathInfo.distance === 1 ? 'text-rose-400' : 'text-amber-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pathInfo.distance === 1 ? 'bg-rose-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                      {pathInfo.distance} Hop{pathInfo.distance > 1 ? 's' : ''} Away
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Selector, Right Multi-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Human Selector & Overview Info */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Select Verified Human</h3>
          
          {/* Simple filter */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-600" />
            <input 
              type="text" 
              placeholder="Filter names..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] focus:border-white/20 focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 font-mono"
            />
          </div>

          {/* Humans list */}
          <div className="space-y-2 bg-[#0b0c10] border border-white/[0.04] p-3 rounded-2xl">
            {filteredHumans.map(human => {
              const isSelected = human.id === selectedHumanId;
              return (
                <button
                  key={human.id}
                  onClick={() => setSelectedHumanId(human.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border text-xs flex flex-col gap-1.5 cursor-pointer ${
                    isSelected 
                      ? 'bg-white/[0.04] border-[#58E38A]/40 text-white' 
                      : 'bg-black/30 border-transparent hover:border-white/[0.08] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold truncate max-w-[140px]">{human.name.replace(/Verified Human \w \(/, '').replace(')', '')}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      human.status === 'within_policy' ? 'bg-emerald-400' :
                      human.status === 'needs_review' ? 'bg-amber-400' : 'bg-rose-500'
                    }`} />
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                    <span>Score: <strong className={human.avgTrustScore > 70 ? "text-emerald-400" : "text-amber-400"}>{human.avgTrustScore}%</strong></span>
                    <span>Accounts: <strong className="text-slate-300">{human.totalAccounts}</strong></span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Educational Sidebar Note */}
          <div className="bg-[#0b0c10]/40 border border-white/[0.02] p-4 rounded-xl space-y-2.5">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase font-bold">
              <Info className="w-3 h-3 text-[#58E38A]" />
              Core Philosophy
            </span>
            <p className="text-[11px] text-slate-500 leading-normal font-light">
              AAN helps organizations understand trust relationships and make better trust decisions without replacing their existing login system. AAN provides intelligence, but the partner platform controls and executes enforcement.
            </p>
          </div>
        </div>

        {/* Right Side: Active Tab View Workspace */}
        <div className="lg:col-span-3 space-y-6">

          {/* Global Policy Evaluation summary for current selected human */}
          <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Recommended Decision Policy Evaluation</span>
                <h4 className="text-sm font-semibold text-white">{currentHuman.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px] font-mono uppercase">RECOMMENDED ACTION:</span>
                <span className={`font-mono text-xs font-bold px-3 py-1 rounded border ${
                  humanEvaluation?.recommendation === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  humanEvaluation?.recommendation === 'STEP_UP' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {humanEvaluation?.recommendation}
                </span>
              </div>
            </div>

            {/* Why this recommendation section */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#58E38A] block">Why this recommendation?</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-normal">
                <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                  <span className="text-slate-500 text-[10px] block uppercase font-mono">Matched Policy</span>
                  <span className="text-slate-200 font-medium">{humanEvaluation?.policyMatched}</span>
                </div>
                <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                  <span className="text-slate-500 text-[10px] block uppercase font-mono">Relationship Status</span>
                  <span className={`font-mono capitalize font-semibold ${
                    currentHuman.status === 'within_policy' ? 'text-emerald-400' :
                    currentHuman.status === 'needs_review' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {currentHuman.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                  <span className="text-slate-500 text-[10px] block uppercase font-mono">Relationship Confidence</span>
                  <span className="text-white font-bold font-mono">{currentHuman.relationshipConfidence}% confidence</span>
                </div>
              </div>

              {/* Explanatory text */}
              <div className="bg-[#58E38A]/[0.02] border border-[#58E38A]/10 p-4 rounded-xl space-y-2 text-xs">
                <span className="text-white font-medium">Analysis Summary</span>
                <p className="text-slate-400 leading-relaxed font-light">{humanEvaluation?.explanation}</p>
                <div className="pt-1 flex flex-wrap gap-1.5 font-mono text-[9px]">
                  <span className="text-slate-500">Evidence captured:</span>
                  {humanEvaluation?.evidence.map((ev, idx) => (
                    <span key={idx} className="bg-black/40 border border-white/[0.05] text-slate-300 px-2 py-0.5 rounded-full">
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SUB-VIEW 1: TRUST GRAPH EXPLORER WITH LOUVAIN CLUSTERING */}
          {activeSubView === 'graph' && (
            <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
              
              <style>{`
                @keyframes graphDash {
                  to {
                    stroke-dashoffset: -40;
                  }
                }
                .animate-graph-dash {
                  stroke-dasharray: 6 4;
                  animation: graphDash 15s linear infinite;
                }
                @keyframes pulseGlow {
                  0%, 100% {
                    opacity: 0.5;
                    transform: scale(1);
                  }
                  50% {
                    opacity: 0.8;
                    transform: scale(1.02);
                  }
                }
                .animate-pulse-glow {
                  animation: pulseGlow 3s ease-in-out infinite;
                }
              `}</style>

              {/* Header section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Partition Analysis</span>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-[#58E38A]" />
                    Clustered Network Partitioning (Louvain Engine)
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowClaimsJson(!showClaimsJson)}
                    className="flex items-center gap-1.5 text-[#58E38A] font-mono text-[10px] uppercase hover:underline cursor-pointer bg-black/40 px-3 py-1.5 rounded-lg border border-white/[0.04]"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>{showClaimsJson ? "Hide Claims JWT" : "Claims JWT Token"}</span>
                  </button>
                </div>
              </div>

              {/* Claims JWT Overlay */}
              {showClaimsJson && (
                <div className="bg-[#0b0c10] border border-[#58E38A]/20 p-4 rounded-2xl space-y-2 animate-[slideDown_0.2s_ease-out]">
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/[0.04] pb-2 text-slate-400">
                    <span>JWT SIGNED PAYLOAD (RS256)</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(currentClaimsJson, null, 2));
                        alert("Trust claims token copied.");
                      }}
                      className="text-[#58E38A] hover:underline cursor-pointer"
                    >
                      Copy Payload
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-300 leading-normal overflow-x-auto max-h-[180px] bg-black/40 p-3 rounded-xl border border-white/[0.02]">
                    {JSON.stringify(currentClaimsJson, null, 2)}
                  </pre>
                </div>
              )}

              {/* Clustering Control Panel */}
              <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  
                  {/* Algorithm Selector */}
                  <div className="space-y-1.5 flex-1">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Clustering Partition Algorithm</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => {
                          setActiveAlgorithm('louvain');
                          handleRefinePartitions();
                        }}
                        className={`px-3 py-2 text-left rounded-xl border transition-all text-xs flex flex-col gap-0.5 cursor-pointer ${
                          activeAlgorithm === 'louvain' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold' 
                            : 'bg-black/30 border-white/[0.03] text-slate-400 hover:text-slate-300 hover:border-white/[0.08]'
                        }`}
                      >
                        <span className="font-sans block font-semibold text-[11px]">Louvain Modularity</span>
                        <span className="text-[9px] font-mono text-slate-500 block">Active Engine</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveAlgorithm('leiden');
                          handleRefinePartitions();
                        }}
                        className={`px-3 py-2 text-left rounded-xl border transition-all text-xs flex flex-col gap-0.5 cursor-pointer ${
                          activeAlgorithm === 'leiden' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold' 
                            : 'bg-black/30 border-white/[0.03] text-slate-400 hover:text-slate-300 hover:border-white/[0.08]'
                        }`}
                      >
                        <span className="font-sans block font-semibold text-[11px] flex items-center gap-1">
                          Leiden Community
                          <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1 rounded uppercase font-mono scale-90">Beta</span>
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 block">Pre-release roadmap</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveAlgorithm('heuristic');
                          handleRefinePartitions();
                        }}
                        className={`px-3 py-2 text-left rounded-xl border transition-all text-xs flex flex-col gap-0.5 cursor-pointer ${
                          activeAlgorithm === 'heuristic' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold' 
                            : 'bg-black/30 border-white/[0.03] text-slate-400 hover:text-slate-300 hover:border-white/[0.08]'
                        }`}
                      >
                        <span className="font-sans block font-semibold text-[11px]">Heuristic Rules</span>
                        <span className="text-[9px] font-mono text-slate-500 block">Static policy patterns</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveAlgorithm('manual_review');
                          handleRefinePartitions();
                        }}
                        className={`px-3 py-2 text-left rounded-xl border transition-all text-xs flex flex-col gap-0.5 cursor-pointer ${
                          activeAlgorithm === 'manual_review' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold' 
                            : 'bg-black/30 border-white/[0.03] text-slate-400 hover:text-slate-300 hover:border-white/[0.08]'
                        }`}
                      >
                        <span className="font-sans block font-semibold text-[11px]">Manual Override</span>
                        <span className="text-[9px] font-mono text-slate-500 block">Analyst specified</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="space-y-1.5 shrink-0 md:w-48">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Filter by Risk Category</label>
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/[0.05] p-2 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#58E38A]/30 font-mono cursor-pointer"
                    >
                      <option value="all">Show All Clusters</option>
                      <option value="high_confidence">High Confidence (Green)</option>
                      <option value="mixed_signals">Mixed Signals (Yellow)</option>
                      <option value="suspicious">Suspicious / High Risk (Red)</option>
                    </select>
                  </div>

                </div>

                {/* Simulated Partition Re-calculation loader */}
                {isRefining && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-400 animate-pulse">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Re-computing modularity scores... Optimizing modular density (Q)...</span>
                    </div>
                    <span className="font-mono text-[10px]">Pass 2 completed</span>
                  </div>
                )}

                {/* Realistic disclaimer */}
                <div className="bg-black/30 border border-white/[0.02] p-3.5 rounded-xl flex items-start gap-3 text-[11px] text-slate-500">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 leading-normal">
                    <span className="font-semibold text-slate-400 block font-sans">Investigation Assistance System</span>
                    <p className="font-light text-left">
                      AAN partitioning utilizes network modularity partitioning algorithms to collapse complex multi-entity relationships into clean visualization groups. Community detection reduces visual noise to support human analysts; it is a correlation metric and does not constitute absolute proof of identity.
                    </p>
                  </div>
                </div>

              </div>

              {/* CONDITIONAL RENDER: COLLAPSED CLUSTER CARDS BY DEFAULT */}
              {expandedClusterId === null ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400 uppercase tracking-wider font-bold">Modularity Partitions ({filteredClusters.length})</span>
                    <span className="text-[10px] text-slate-500">Showing collapsed groups. Click any card to expand trust relationship graph.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredClusters.length === 0 ? (
                      <div className="col-span-3 bg-[#0b0c10] border border-white/[0.02] p-12 rounded-2xl text-center text-slate-500 text-xs">
                        No partitions match the selected risk filter settings.
                      </div>
                    ) : (
                      filteredClusters.map((cluster) => {
                        const isSelected = cluster.associatedHumanIds.includes(selectedHumanId);
                        
                        return (
                          <div 
                            key={cluster.id} 
                            onClick={() => {
                              setExpandedClusterId(cluster.id);
                              setSelectedHumanId(cluster.associatedHumanIds[0]);
                            }}
                            className={`group relative bg-[#0b0c10] border p-5 rounded-2xl transition-all hover:border-[#58E38A]/20 hover:bg-[#0b0c10]/80 cursor-pointer flex flex-col justify-between gap-5 text-left ${
                              isSelected ? 'border-[#58E38A]/30 shadow-[0_0_20px_-5px_rgba(88,227,138,0.1)]' : 'border-white/[0.04]'
                            }`}
                          >
                            
                            {/* Card Content Top */}
                            <div className="space-y-3.5">
                              {/* Header & Status Indicator */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Partition ID: {cluster.id}</span>
                                  <h4 className="text-xs font-semibold text-white tracking-tight leading-snug group-hover:text-[#58E38A] transition-colors font-mono">
                                    {cluster.name}
                                  </h4>
                                </div>
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                                  cluster.status === 'high_confidence' ? 'bg-[#58E38A]' :
                                  cluster.status === 'mixed_signals' ? 'bg-amber-400' :
                                  cluster.status === 'suspicious' ? 'bg-rose-500' : 'bg-slate-500'
                                }`} title={cluster.status.replace('_', ' ')} />
                              </div>

                              {/* Progress Bars for Risk and Confidence */}
                              <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/[0.02]">
                                <div className="space-y-1 text-[10px]">
                                  <div className="flex justify-between text-slate-500 font-mono">
                                    <span>RISK INDEX</span>
                                    <span className={cluster.riskScore > 60 ? "text-rose-400" : "text-[#58E38A]"}>{cluster.riskScore}%</span>
                                  </div>
                                  <div className="w-full bg-white/[0.02] h-1 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        cluster.riskScore > 60 ? 'bg-rose-500' : 'bg-[#58E38A]'
                                      }`}
                                      style={{ width: `${cluster.riskScore}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1 text-[10px]">
                                  <div className="flex justify-between text-slate-500 font-mono">
                                    <span>CONFIDENCE MODULUS</span>
                                    <span className="text-blue-400">{cluster.confidenceScore}%</span>
                                  </div>
                                  <div className="w-full bg-white/[0.02] h-1 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                      style={{ width: `${cluster.confidenceScore}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Metrics Grid */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-black/10 p-2.5 rounded-xl border border-white/[0.01]">
                                <div className="flex justify-between border-r border-white/[0.04] pr-2">
                                  <span className="text-slate-500">HUMANS:</span>
                                  <span className="text-white font-semibold">{cluster.verifiedHumansCount}</span>
                                </div>
                                <div className="flex justify-between pl-1">
                                  <span className="text-slate-500">ACCOUNTS:</span>
                                  <span className="text-white font-semibold">{cluster.partnerAccountsCount}</span>
                                </div>
                                <div className="flex justify-between border-r border-white/[0.04] pr-2 pt-1 border-t border-white/[0.03]">
                                  <span className="text-slate-500">DEVICES:</span>
                                  <span className="text-white font-semibold">{cluster.trustDevicesCount}</span>
                                </div>
                                <div className="flex justify-between pl-1 pt-1 border-t border-white/[0.03]">
                                  <span className="text-slate-500">DECISIONS:</span>
                                  <span className="text-white font-semibold">{cluster.decisionsCount}</span>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="border-t border-white/[0.03] pt-3 flex items-center justify-between text-[9px] font-mono text-slate-500">
                              <span className="uppercase">ALGO: {cluster.algorithm}</span>
                              <span className="flex items-center gap-1 text-[#58E38A] uppercase font-semibold group-hover:underline">
                                Investigate Graph
                                <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* EXPANDED DETAILED GRAPH VIEW FOR INVESTIGATION */
                (() => {
                  const activeCluster = clusters.find(c => c.id === expandedClusterId) || clusters[0] || MOCK_CLUSTERS[0];
                  
                  return (
                    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                      
                      {/* Sub-header and breadcrumb */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/[0.03]">
                        <div className="flex items-center gap-2 text-xs">
                          <button 
                            onClick={() => setExpandedClusterId(null)}
                            className="text-slate-400 hover:text-white transition-colors uppercase font-mono tracking-wider cursor-pointer font-bold"
                          >
                            Partitions
                          </button>
                          <span className="text-slate-600">/</span>
                          <span className="text-[#58E38A] font-medium flex items-center gap-1.5 font-mono">
                            <Layers className="w-3.5 h-3.5" />
                            {activeCluster.name}
                          </span>
                        </div>
                        <button
                          onClick={() => setExpandedClusterId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[10px] text-slate-300 font-mono border border-white/[0.05] transition-all cursor-pointer uppercase tracking-wider"
                        >
                          ← Back to Modularity List
                        </button>
                      </div>

                      {/* Interactive Graph Area */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* Interactive Graph Box (Canvas container) */}
                        <div className="lg:col-span-3 bg-[#050608] border border-white/[0.03] rounded-3xl p-6 relative min-h-[460px] flex flex-col justify-between overflow-hidden">
                          
                          {/* Background Grid Pattern */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                          {/* Legend & Help tip */}
                          <div className="absolute top-4 left-4 flex flex-wrap gap-3 text-[9px] font-mono text-slate-500 bg-black/60 px-3 py-1.5 rounded-lg border border-white/[0.04] z-20">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Partition Hub</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#58E38A]" /> Verified Human</span>
                            {showAccounts && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Accounts</span>}
                            {showDevices && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Devices</span>}
                          </div>

                          <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 bg-black/60 px-3 py-1.5 rounded-lg border border-white/[0.04] z-20">
                            Click nodes to audit telemetry metadata
                          </div>

                          {/* Dynamic SVG Connection lines for the graph rendering */}
                          <div className="absolute inset-0 pointer-events-none z-0">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                              {/* Central Cluster Hub to Verified Human line */}
                              <line x1="18%" y1="50%" x2="45%" y2="50%" stroke="#8b5cf6" strokeWidth="2" className="animate-graph-dash" />
                              
                              {/* Verified Human to Sub nodes */}
                              {showAccounts && (
                                <>
                                  <line x1="45%" y1="50%" x2="78%" y2="22%" stroke="#58E38A" strokeWidth="1.5" strokeOpacity="0.4" />
                                  <line x1="45%" y1="50%" x2="78%" y2="38%" stroke="#58E38A" strokeWidth="1.5" strokeOpacity="0.4" />
                                </>
                              )}

                              {showDevices && (
                                <>
                                  <line x1="45%" y1="50%" x2="78%" y2="58%" stroke="#58E38A" strokeWidth="1.5" strokeOpacity="0.4" />
                                  <line x1="45%" y1="50%" x2="78%" y2="74%" stroke="#58E38A" strokeWidth="1.5" strokeOpacity="0.4" />
                                </>
                              )}

                              {showDecisions && (
                                <line x1="45%" y1="50%" x2="45%" y2="82%" stroke="#58E38A" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 3" />
                              )}
                            </svg>
                          </div>

                          {/* Cluster Graph Nodes */}
                          <div className="relative py-12 flex flex-col lg:flex-row items-center justify-between gap-12 z-10 w-full min-h-[360px]">
                            
                            {/* Node Column 1: Partition Central Hub */}
                            <div className="w-full lg:w-1/4 flex flex-col items-center justify-center">
                              <button 
                                onClick={() => setSelectedSubNode({
                                  type: 'Cluster Partition Hub',
                                  name: activeCluster.name,
                                  status: activeCluster.status,
                                  details: `Generated using algorithm: '${activeAlgorithm}'. Resolution factor: ${resolution}. Modularity index Q = 0.76. This cluster groups associated hardware telemetry profiles, browser signatures, and common communication proxies into partition segments to reduce visual footprint.`
                                })}
                                className="relative group text-left"
                              >
                                <div className="absolute -inset-2 bg-purple-500/10 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-300" />
                                <div className="relative flex flex-col items-center gap-2 bg-[#0b0c10] border-2 border-purple-500/40 p-4 rounded-2xl text-xs shadow-2xl group-hover:border-purple-400 transition-colors">
                                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 animate-pulse">
                                    <Network className="w-4 h-4" />
                                  </div>
                                  <div className="text-center">
                                    <span className="text-[7px] font-mono text-purple-400 block uppercase tracking-widest font-bold">Partition Hub</span>
                                    <span className="text-white font-bold block">{activeCluster.id}</span>
                                    <span className="text-[9px] font-mono text-slate-500 block">Q-Score: 0.76</span>
                                  </div>
                                </div>
                              </button>
                            </div>

                            {/* Node Column 2: Central Verified Human Signature */}
                            <div className="w-full lg:w-1/3 flex flex-col items-center justify-center">
                              <button 
                                onClick={() => setSelectedSubNode({
                                  type: 'Verified Human Signature',
                                  name: currentHuman.name,
                                  status: currentHuman.status,
                                  details: `Secure cryptographic signature containing: 3 Associated Accounts, 2 Registered Touch Hardware Profiles. Average trust score is ${currentHuman.avgTrustScore}%. Policy rating: ${currentHuman.status}. Last telemetry update seen at ${new Date(currentHuman.lastSeen).toLocaleString()}.`
                                })}
                                className="relative group text-left"
                              >
                                <div className="absolute -inset-3 bg-[#58E38A]/10 rounded-2xl blur-md opacity-80 group-hover:opacity-100 transition duration-300" />
                                <div className="relative flex items-center gap-3 bg-[#0b0c10] border-2 border-[#58E38A] px-5 py-3 rounded-2xl text-xs shadow-2xl">
                                  <div className="w-7 h-7 rounded-lg bg-[#58E38A]/15 flex items-center justify-center text-[#58E38A]">
                                    <UserCheck className="w-4 h-4" />
                                  </div>
                                  <div className="text-left font-sans">
                                    <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wider font-bold">Verified Human</span>
                                    <span className="text-white font-bold block">{currentHuman.name}</span>
                                    <span className="text-[9px] font-mono text-emerald-400 block">Score: {currentHuman.avgTrustScore}%</span>
                                  </div>
                                </div>
                              </button>

                              {/* Connecting to Decision Node underneath */}
                              {showDecisions && (
                                <div className="mt-16">
                                  <button
                                    onClick={() => setSelectedSubNode({
                                      type: 'Dynamic Trust Decision',
                                      name: `Verdict: ${humanEvaluation?.recommendation || 'ALLOW'}`,
                                      status: currentHuman.status,
                                      details: `The Trust Decision Engine issued a verdict of: ${humanEvaluation?.recommendation || 'ALLOW'} based on matched rule '${humanEvaluation?.policyMatched}'. Confidence coefficient: ${currentHuman.relationshipConfidence}%.`
                                    })}
                                    className={`relative group px-3.5 py-2 rounded-xl border text-[11px] font-mono flex items-center gap-2 bg-[#0b0c10] ${
                                      humanEvaluation?.recommendation === 'ALLOW' ? 'border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40' :
                                      humanEvaluation?.recommendation === 'STEP_UP' ? 'border-amber-500/20 text-amber-400 hover:border-amber-500/40' :
                                      'border-rose-500/20 text-rose-400 hover:border-rose-500/40'
                                    }`}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Decision: {humanEvaluation?.recommendation || 'ALLOW'}</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Node Column 3: Telemetry Members (Accounts & Devices) */}
                            <div className="w-full lg:w-1/3 space-y-4">
                              
                              {/* Accounts subset */}
                              {showAccounts && (
                                <div className="space-y-2">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block text-left">Accounts Segment</span>
                                  {humanAccounts.map((acc, index) => (
                                    <button
                                      key={acc.id}
                                      onClick={() => setSelectedSubNode({
                                        type: `${acc.accountType} Profile Account`,
                                        name: acc.email,
                                        details: `Account index: ${index + 1}. Registered under user identifier ${acc.id}. Fully authorized in partner authentication layer. Multi-account telemetry reveals relationship to same human signature with ${currentHuman.relationshipConfidence}% confidence.`
                                      })}
                                      className="w-full flex items-center gap-2.5 bg-[#0b0c10]/90 border border-white/[0.04] p-2.5 rounded-xl hover:border-blue-500/30 transition-all text-left group"
                                    >
                                      <div className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                        <Key className="w-3 h-3" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span className="text-[7px] font-mono text-slate-500 block uppercase">{acc.accountType} profile</span>
                                        <span className="text-slate-300 text-[10px] block truncate font-mono font-medium group-hover:text-blue-300 transition-colors">{acc.email}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Devices subset */}
                              {showDevices && (
                                <div className="space-y-2 pt-2">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block text-left">Hardware Segment</span>
                                  {humanDevices.map((dev) => (
                                    <button
                                      key={dev.id}
                                      onClick={() => setSelectedSubNode({
                                        type: `Interactive Hardware Device`,
                                        name: dev.name,
                                        status: dev.status,
                                        details: `Hardware anchor device: ${dev.name}. ID: ${dev.id}. Status: ${dev.status.toUpperCase()}. This device is cryptographically signed and enrolled in the Trust Registry. Connection pattern analysis matches typical user session signatures.`
                                      })}
                                      className={`w-full flex items-center gap-2.5 bg-[#0b0c10]/90 border p-2.5 rounded-xl transition-all text-left group ${
                                        dev.status === 'trusted' ? 'border-emerald-500/10 hover:border-emerald-500/20' :
                                        dev.status === 'blocked' ? 'border-rose-500/10 hover:border-rose-500/20' :
                                        'border-white/[0.04] hover:border-indigo-500/20'
                                      }`}
                                    >
                                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                                        dev.status === 'trusted' ? 'bg-emerald-500/10 text-emerald-400' :
                                        dev.status === 'blocked' ? 'bg-rose-500/10 text-rose-400' :
                                        'bg-indigo-500/10 text-indigo-400'
                                      }`}>
                                        <Monitor className="w-3 h-3" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span className={`text-[7px] font-mono block uppercase ${
                                          dev.status === 'trusted' ? 'text-emerald-400' :
                                          dev.status === 'blocked' ? 'text-rose-400' : 'text-slate-500'
                                        }`}>{dev.status.toUpperCase()} Device</span>
                                        <span className="text-slate-300 text-[10px] block truncate font-mono font-medium group-hover:text-indigo-300 transition-colors">{dev.name}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}

                            </div>

                          </div>

                          {/* Floating Telemetry Audit Card (If node clicked) */}
                          {selectedSubNode ? (
                            <div className="bg-[#0b0c10] border border-white/[0.08] p-4 rounded-2xl relative z-20 space-y-2 text-left animate-[fadeIn_0.15s_ease-out]">
                              <div className="flex justify-between items-start border-b border-white/[0.04] pb-2">
                                <div>
                                  <span className="text-[8px] font-mono text-[#58E38A] uppercase block tracking-wider">{selectedSubNode.type}</span>
                                  <h5 className="text-xs font-semibold text-white font-mono">{selectedSubNode.name}</h5>
                                </div>
                                <button
                                  onClick={() => setSelectedSubNode(null)}
                                  className="text-slate-500 hover:text-slate-300 text-xs font-mono px-1 cursor-pointer"
                                >
                                  Close Audit
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                                {selectedSubNode.details}
                              </p>
                            </div>
                          ) : (
                            /* Visual aid footer placeholder */
                            <div className="border-t border-white/[0.03] pt-4 flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 gap-2 text-left">
                              <span className="font-light">Average partition strength: <strong className="text-[#58E38A]">High Modularity (Louvain)</strong></span>
                              <span className="font-mono">Resolution factor: {resolution}</span>
                            </div>
                          )}

                        </div>

                        {/* Node Graph Tuning Sidebar */}
                        <div className="space-y-4">
                          
                          {/* Modularity slider */}
                          <div className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-2xl text-left space-y-3">
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase font-bold">
                              <SlidersHorizontal className="w-3.5 h-3.5 text-[#58E38A]" />
                              Modularity Resolution
                            </span>
                            <p className="text-[10px] text-slate-500 leading-normal font-light">
                              Adjust Louvain partition density resolution factor. Lower values produce larger, denser community groupings.
                            </p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                <span>Resolution Factor</span>
                                <span className="text-emerald-400 font-bold">{resolution}</span>
                              </div>
                              <input 
                                type="range" 
                                min="0.1" 
                                max="2.0" 
                                step="0.05"
                                value={resolution}
                                onChange={(e) => {
                                  setResolution(parseFloat(e.target.value));
                                  handleRefinePartitions();
                                }}
                                className="w-full h-1 bg-white/[0.04] rounded-lg appearance-none cursor-pointer accent-[#58E38A]" 
                              />
                              <div className="flex justify-between text-[8px] font-mono text-slate-600">
                                <span>0.1 (Coarse)</span>
                                <span>2.0 (Fine)</span>
                              </div>
                            </div>
                          </div>

                          {/* Node Visibility Toggles */}
                          <div className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-2xl text-left space-y-3.5">
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase font-bold">
                              <Settings2 className="w-3.5 h-3.5 text-[#58E38A]" />
                              Partition Filter Layers
                            </span>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2.5 text-[11px] text-slate-400 hover:text-white cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={showAccounts}
                                  onChange={(e) => setShowAccounts(e.target.checked)}
                                  className="rounded border-white/[0.1] bg-black/40 text-[#58E38A] focus:ring-0 focus:ring-offset-0"
                                />
                                <span>Associated Accounts</span>
                              </label>

                              <label className="flex items-center gap-2.5 text-[11px] text-slate-400 hover:text-white cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={showDevices}
                                  onChange={(e) => setShowDevices(e.target.checked)}
                                  className="rounded border-white/[0.1] bg-black/40 text-[#58E38A] focus:ring-0 focus:ring-offset-0"
                                />
                                <span>Interactive Devices</span>
                              </label>

                              <label className="flex items-center gap-2.5 text-[11px] text-slate-400 hover:text-white cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={showDecisions}
                                  onChange={(e) => setShowDecisions(e.target.checked)}
                                  className="rounded border-white/[0.1] bg-black/40 text-[#58E38A] focus:ring-0 focus:ring-offset-0"
                                />
                                <span>Decision Node Layer</span>
                              </label>
                            </div>
                          </div>

                          {/* Clustering Parameters Stats Card */}
                          <div className="bg-[#0b0c10] border border-white/[0.04] p-4 rounded-2xl text-left space-y-3">
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase font-bold">
                              <GitBranch className="w-3.5 h-3.5 text-[#58E38A]" />
                              Modularity (Q) Scores
                            </span>
                            <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Modularity Q:</span>
                                <span className="text-emerald-400 font-bold">0.762</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Refine passes:</span>
                                <span className="text-slate-300">15 iterations</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Seed key:</span>
                                <span className="text-slate-300">0x3A9F...8D</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Current status:</span>
                                <span className="text-emerald-400">OPTIMAL</span>
                              </div>
                            </div>
                            <button
                              onClick={handleRefinePartitions}
                              className="w-full mt-2 bg-white/[0.02] hover:bg-white/[0.06] text-white border border-white/[0.05] p-2 rounded-xl text-center font-mono text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                            >
                              Run Recalculation
                            </button>
                          </div>

                        </div>

                      </div>

                    </div>
                  );
                })()
              )}

            </div>
          )}

          {/* SUB-VIEW 2: RELATIONSHIP INTELLIGENCE (NON-ACCUSATORY LEDGER) */}
          {activeSubView === 'intelligence' && (
            <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-400 uppercase tracking-wider font-bold">Relationship Analysis Ledger</span>
                <span className="text-[10px] text-slate-500">Safe, non-accusatory association reports</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {humanRelationships.length === 0 ? (
                  <div className="col-span-2 bg-[#0b0c10] border border-white/[0.03] p-8 text-center text-slate-500 text-xs">
                    No active anomaly relationships identified. Standard usage patterns are stable.
                  </div>
                ) : (
                  humanRelationships.map(rel => (
                    <div key={rel.id} className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between gap-4">
                      
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="text-slate-500 text-[10px] font-mono uppercase">Association Type</span>
                            <span className="text-white text-xs font-semibold block">{rel.type}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            rel.status === 'active_trusted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {rel.confidence}% Confidence
                          </span>
                        </div>

                        {/* Description / Statement */}
                        <p className="text-[11px] text-slate-400 leading-normal font-light italic">
                          “These accounts appear to be associated with the same verified human based on multi-dimensional trust indicators.”
                        </p>

                        {/* Evidence bullet list */}
                        <div className="space-y-1 bg-black/20 p-3 rounded-xl border border-white/[0.02]">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Evidence Signals</span>
                          <ul className="space-y-1 text-[10px] text-slate-400 list-disc list-inside">
                            {rel.evidence.map((ev, idx) => (
                              <li key={idx} className="truncate">{ev}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Actionable recommendation */}
                      <div className="border-t border-white/[0.03] pt-3.5 space-y-1.5 text-[11px]">
                        <span className="text-[#58E38A] font-medium block">Recommendation</span>
                        <p className="text-slate-400 leading-normal font-light">{rel.recommendation}</p>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* SUB-VIEW 3: TRUST TIMELINE VIEW */}
          {activeSubView === 'timeline' && (
            <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-400 uppercase tracking-wider font-bold">Chronological Trust Milestones</span>
                <span className="text-[10px] text-slate-500">Traversed audit trail</span>
              </div>

              {/* Timeline Tree Component */}
              <div className="bg-[#0b0c10] border border-white/[0.04] p-6 rounded-2xl relative">
                
                <div className="absolute left-9 top-8 bottom-8 w-0.5 bg-white/[0.03]" />

                <div className="space-y-6">
                  {humanTimeline.map((item) => (
                    <div key={item.id} className="relative flex gap-6 items-start text-xs text-left group">
                      
                      {/* Timeline Dot with Color Indicator */}
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10 transition-all ${
                        item.severity === 'critical' ? 'bg-rose-500/10 border-rose-500 text-rose-400 scale-105' :
                        item.severity === 'high' ? 'bg-amber-500/10 border-amber-500 text-amber-400' :
                        item.severity === 'medium' ? 'bg-blue-500/10 border-blue-500 text-blue-400' :
                        'bg-emerald-500/10 border-emerald-500/30 text-[#58E38A]'
                      }`}>
                        <Clock className="w-3 h-3" />
                      </div>

                      {/* Description Card */}
                      <div className="flex-1 bg-black/20 hover:bg-black/30 border border-white/[0.02] p-4 rounded-xl transition-all space-y-1.5 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                          <span className="text-white font-semibold font-sans">{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        
                        <p className="text-slate-400 font-light leading-relaxed text-[11px]">{item.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[9px] text-slate-500">
                          {item.relatedDecision && (
                            <span className="bg-black/40 border border-white/[0.05] text-slate-300 px-1.5 py-0.5 rounded">
                              Verdict: {item.relatedDecision}
                            </span>
                          )}
                          {item.relatedEntity && (
                            <span className="bg-black/40 border border-white/[0.05] text-slate-400 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                              Entity: {item.relatedEntity}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
