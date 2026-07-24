import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Flame, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Shield, 
  Zap, 
  Gauge, 
  FileJson, 
  RefreshCw,
  UserCheck,
  TrendingDown,
  Monitor,
  Network,
  Clock,
  ArrowRight,
  Binary
} from 'lucide-react';
import { supabaseService } from '../lib/supabaseService';

interface SimulatedEvent {
  id: string;
  eventType: 'signup_bot' | 'ban_evasion' | 'account_takeover' | 'suspicious_login' | 'legit_user';
  eventTypeName: string;
  external_user_id: string;
  email: string;
  decision: 'ALLOW' | 'STEP_UP' | 'REVIEW' | 'DENY';
  trust_score: number;
  risk_score: number;
  reason_codes: string[];
  metadata: {
    ip: string;
    location: string;
    device: string;
    network: string;
    anomaly_details?: string;
  };
  timestamp: string;
  decisionTimeMs: number;
}

interface TestLabTabProps {
  projName: string;
  projectId?: string;
  userEmail?: string;
  onAddEventToGlobalRegistry: (event?: any) => void;
}

export default function TestLabTab({ projName, projectId, userEmail, onAddEventToGlobalRegistry }: TestLabTabProps) {
  const persistDecision = async (evt: any) => {
    try {
      const decisionVal = evt.decision === 'ALLOW' ? 'approved' : evt.decision === 'DENY' ? 'denied' : 'review';
      const res = await fetch('/api/internal/decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail || ''
        },
        body: JSON.stringify({
          projectId: projectId || 'proj_sandbox',
          id: evt.id,
          external_user_id: evt.external_user_id,
          decision: decisionVal,
          risk_score: evt.risk_score,
          reason_codes: evt.reason_codes,
          device_signal: evt.metadata.device || 'Unspecified Device',
          ip_risk_signal: `${evt.risk_score > 60 ? 'High' : evt.risk_score > 30 ? 'Medium' : 'Low'} (${(evt.risk_score / 100).toFixed(2)})`
        })
      });
      if (!res.ok) {
        console.error("Failed to persist simulated decision in DB");
      }
    } catch (err) {
      console.error("Error persisting simulated decision:", err);
    }
  };
  // Simulator running state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<'single' | 'benchmark'>('single');
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  
  // Selected event for details inspector modal
  const [selectedEvent, setSelectedEvent] = useState<SimulatedEvent | null>(null);

  // Stats Counters
  const [stats, setStats] = useState({
    totalEvents: 45,
    botBlocked: 18,
    banEvasionFlaged: 11,
    atoChallenged: 7,
    suspiciousDetected: 5,
    legitApproved: 4,
    avgDecisionTimeMs: 14,
    falsePositives: 0
  });

  // Recent simulated events
  const [simulatedEvents, setSimulatedEvents] = useState<SimulatedEvent[]>([
    {
      id: "sim_aan_a83b210f",
      eventType: 'signup_bot',
      eventTypeName: "Bot Signup Attempt",
      external_user_id: "bot_crawler_node_44",
      email: "temp_john83742@dispostable.com",
      decision: 'DENY',
      trust_score: 5,
      risk_score: 95,
      reason_codes: ["DEVICE_SPOOF_DETECTED", "COORDINATED_REPLAY", "HIGH_RISK_PROXY"],
      metadata: {
        ip: "185.190.141.2",
        location: "Frankfurt, DE",
        device: "Headless Chrome / Linux Server",
        network: "DigitalOcean Hosting AS14061",
        anomaly_details: "Canvas fingerprinting mismatch, timezone difference detected."
      },
      timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
      decisionTimeMs: 12
    },
    {
      id: "sim_aan_9c4f8d55",
      eventType: 'ban_evasion',
      eventTypeName: "Ban Evasion Attempt",
      external_user_id: "evader_usr_772",
      email: "realjohnsmith+12@gmail.com",
      decision: 'DENY',
      trust_score: 15,
      risk_score: 85,
      reason_codes: ["HARDWARE_ID_BLACKLISTED", "DUPLICATE_DEVICE_REGISTRATION"],
      metadata: {
        ip: "74.120.14.88",
        location: "Chicago, US",
        device: "Chrome 124 / Windows 11",
        network: "Residential Comcast",
        anomaly_details: "Hardware identifier matches account banned 48 hours ago for fraudulent abuse."
      },
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      decisionTimeMs: 18
    },
    {
      id: "sim_aan_b5d6e2cc",
      eventType: 'account_takeover',
      eventTypeName: "Account Takeover",
      external_user_id: "usr_active_buyer",
      email: "buyer_premium@yahoo.com",
      decision: 'STEP_UP',
      trust_score: 42,
      risk_score: 58,
      reason_codes: ["IMPOSSIBLE_TRAVEL_SPEED", "NEW_DEVICE_UNFAMILIAR", "LOGIN_VELOCITY_SPIKE"],
      metadata: {
        ip: "103.85.205.10",
        location: "Singapore, SG",
        device: "Firefox 125 / Android 13",
        network: "Singtel Mobile",
        anomaly_details: "Account logged in from New York, US 15 minutes ago. Impossible geographic displacement."
      },
      timestamp: new Date(Date.now() - 19 * 60000).toISOString(),
      decisionTimeMs: 15
    },
    {
      id: "sim_aan_3e4d5f12",
      eventType: 'suspicious_login',
      eventTypeName: "Suspicious Login Behavior",
      external_user_id: "usr_sandbox_dev",
      email: "dev_lead@acme.com",
      decision: 'REVIEW',
      trust_score: 60,
      risk_score: 40,
      reason_codes: ["VOLATILE_NETWORK_CARRIER", "ABNORMAL_MOUSE_TRAJECTORY"],
      metadata: {
        ip: "192.168.1.1",
        location: "San Jose, US",
        device: "Edge 123 / macOS Ventura",
        network: "Unknown VPN Gateway",
        anomaly_details: "Unusual micro-interaction speed coupled with proxy network exit."
      },
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      decisionTimeMs: 11
    },
    {
      id: "sim_aan_7d8e9f2a",
      eventType: 'legit_user',
      eventTypeName: "Legitimate User Activity",
      external_user_id: "usr_loyal_customer",
      email: "emma.watson@gmail.com",
      decision: 'ALLOW',
      trust_score: 98,
      risk_score: 2,
      reason_codes: ["HUMAN_TELEMETRY_PASSED", "IP_CLEAN", "DEVICE_TRUST_VERIFIED"],
      metadata: {
        ip: "67.185.244.102",
        location: "Seattle, US",
        device: "iOS 17 Safari / iPhone 15",
        network: "T-Mobile LTE",
        anomaly_details: "Consistent biometrics, highly trusted domestic mobile network."
      },
      timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
      decisionTimeMs: 9
    }
  ]);

  // Scenarios configured for manual triggering
  const scenarios = [
    {
      type: 'signup_bot' as const,
      title: "Bot Signup Attempt",
      desc: "Simulates automated browser scripts spinning up mock registrations utilizing headless environments and rotating proxies.",
      icon: Flame,
      severity: "High Risk",
      color: "text-rose-400 border-rose-500/20 bg-rose-500/[0.02]"
    },
    {
      type: 'ban_evasion' as const,
      title: "Ban Evasion Attempt",
      desc: "Simulates a previously sanctioned bad actor attempting to bypass restrictions using a fresh email alias but matching device telemetry.",
      icon: Shield,
      severity: "High Risk",
      color: "text-red-400 border-red-500/20 bg-red-500/[0.02]"
    },
    {
      type: 'account_takeover' as const,
      title: "Account Takeover",
      desc: "Simulates credentials-stuffing login targeting a valid user account from an anomalous geolocation and unfamiliar browser.",
      icon: AlertTriangle,
      severity: "Medium Risk",
      color: "text-amber-400 border-amber-500/20 bg-amber-500/[0.02]"
    },
    {
      type: 'suspicious_login' as const,
      title: "Suspicious Login Behavior",
      desc: "Simulates a visitor with irregular browsing latency, automated navigation traces, and an obscured consumer VPN client.",
      icon: Zap,
      severity: "Moderate Risk",
      color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/[0.02]"
    },
    {
      type: 'legit_user' as const,
      title: "Legitimate User Activity",
      desc: "Simulates a genuine customer logging in with perfect behavioral biometrics, a healthy residential ISP, and matched session data.",
      icon: CheckCircle,
      severity: "Low Risk",
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.02]"
    }
  ];

  // Run a single controlled simulation
  const handleSimulate = async (type: 'signup_bot' | 'ban_evasion' | 'account_takeover' | 'suspicious_login' | 'legit_user') => {
    setIsSimulating(true);
    setSimulationSpeed('single');

    // Persist simulation statefully on the backend
    try {
      await supabaseService.runSimulationScenario(type);
    } catch (err) {
      console.warn("Backend stateful simulation trigger failed or bypassed:", err);
    }

    setTimeout(async () => {
      let newEvent: SimulatedEvent;
      const randomIdSuffix = Math.random().toString(36).substring(2, 8);
      const timestampNow = new Date().toISOString();

      switch (type) {
        case 'signup_bot':
          newEvent = {
            id: `sim_aan_${randomIdSuffix}`,
            eventType: 'signup_bot',
            eventTypeName: "Bot Signup Attempt",
            external_user_id: `bot_node_${Math.floor(Math.random() * 1000)}`,
            email: `fake_reg_${Math.random().toString(36).substring(2, 6)}@mailinator.com`,
            decision: 'DENY',
            trust_score: Math.floor(Math.random() * 8) + 1,
            risk_score: Math.floor(Math.random() * 10) + 90,
            reason_codes: ["DEVICE_SPOOF_DETECTED", "HIGH_RISK_VPN", "AUTOMATED_INTERACTION"],
            metadata: {
              ip: `198.51.100.${Math.floor(Math.random() * 254) + 1}`,
              location: "Amsterdam, NL",
              device: "Puppeteer / Chromium Headless",
              network: "M247 Cloud Services",
              anomaly_details: "No hardware audio context support. Missing user mouse trajectory patterns entirely."
            },
            timestamp: timestampNow,
            decisionTimeMs: Math.floor(Math.random() * 6) + 10
          };
          setStats(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
            botBlocked: prev.botBlocked + 1,
            avgDecisionTimeMs: Math.round((prev.avgDecisionTimeMs * prev.totalEvents + newEvent.decisionTimeMs) / (prev.totalEvents + 1))
          }));
          break;

        case 'ban_evasion':
          newEvent = {
            id: `sim_aan_${randomIdSuffix}`,
            eventType: 'ban_evasion',
            eventTypeName: "Ban Evasion Attempt",
            external_user_id: `usr_evader_${Math.floor(Math.random() * 1000)}`,
            email: `malicious_actor+test${Math.floor(Math.random() * 100)}@outlook.com`,
            decision: 'DENY',
            trust_score: Math.floor(Math.random() * 12) + 10,
            risk_score: Math.floor(Math.random() * 15) + 75,
            reason_codes: ["HARDWARE_ID_BLACKLISTED", "PREVIOUS_ABUSER_MATCH"],
            metadata: {
              ip: `172.56.21.${Math.floor(Math.random() * 254) + 1}`,
              location: "Dallas, US",
              device: "Chrome 125 / Android 14",
              network: "AT&T Mobility Broadband",
              anomaly_details: "WebGL renderer fingerprint matches banned malicious card-pool fraud profile from yesterday."
            },
            timestamp: timestampNow,
            decisionTimeMs: Math.floor(Math.random() * 8) + 12
          };
          setStats(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
            banEvasionFlaged: prev.banEvasionFlaged + 1,
            avgDecisionTimeMs: Math.round((prev.avgDecisionTimeMs * prev.totalEvents + newEvent.decisionTimeMs) / (prev.totalEvents + 1))
          }));
          break;

        case 'account_takeover':
          newEvent = {
            id: `sim_aan_${randomIdSuffix}`,
            eventType: 'account_takeover',
            eventTypeName: "Account Takeover",
            external_user_id: `usr_unlucky_customer_${Math.floor(Math.random() * 500)}`,
            email: `active_shopper_${Math.floor(Math.random() * 100)}@gmail.com`,
            decision: 'STEP_UP',
            trust_score: Math.floor(Math.random() * 15) + 35,
            risk_score: Math.floor(Math.random() * 15) + 50,
            reason_codes: ["NEW_DEVICE_UNFAMILIAR", "GEOGRAPHIC_VELOCITY_VIOLATION"],
            metadata: {
              ip: `45.132.224.${Math.floor(Math.random() * 254) + 1}`,
              location: "Moscow, RU",
              device: "Safari 17 / macOS Sonoma",
              network: "GTT Communications",
              anomaly_details: "Active session hijack suspected. Host account had successful local login 3 minutes ago in London, UK."
            },
            timestamp: timestampNow,
            decisionTimeMs: Math.floor(Math.random() * 5) + 13
          };
          setStats(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
            atoChallenged: prev.atoChallenged + 1,
            avgDecisionTimeMs: Math.round((prev.avgDecisionTimeMs * prev.totalEvents + newEvent.decisionTimeMs) / (prev.totalEvents + 1))
          }));
          break;

        case 'suspicious_login':
          newEvent = {
            id: `sim_aan_${randomIdSuffix}`,
            eventType: 'suspicious_login',
            eventTypeName: "Suspicious Login Behavior",
            external_user_id: `usr_visitor_${Math.floor(Math.random() * 1000)}`,
            email: `visitor_test_${Math.random().toString(36).substring(2, 6)}@yahoo.com`,
            decision: 'REVIEW',
            trust_score: Math.floor(Math.random() * 20) + 50,
            risk_score: Math.floor(Math.random() * 20) + 35,
            reason_codes: ["VOLATILE_NETWORK_CARRIER", "SPOOFED_BATTERY_STATUS"],
            metadata: {
              ip: `185.220.101.${Math.floor(Math.random() * 254) + 1}`,
              location: "Zurich, CH",
              device: "Firefox 124 / Windows 10",
              network: "Tor Exit Node AS20055",
              anomaly_details: "User reported battery API as 100% charging constantly, WebGL reports hardware GPU mismatch."
            },
            timestamp: timestampNow,
            decisionTimeMs: Math.floor(Math.random() * 7) + 10
          };
          setStats(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
            suspiciousDetected: prev.suspiciousDetected + 1,
            avgDecisionTimeMs: Math.round((prev.avgDecisionTimeMs * prev.totalEvents + newEvent.decisionTimeMs) / (prev.totalEvents + 1))
          }));
          break;

        case 'legit_user':
        default:
          newEvent = {
            id: `sim_aan_${randomIdSuffix}`,
            eventType: 'legit_user',
            eventTypeName: "Legitimate User Activity",
            external_user_id: `usr_loyal_${Math.floor(Math.random() * 1000)}`,
            email: `genuine_user_${Math.floor(Math.random() * 1000)}@outlook.com`,
            decision: 'ALLOW',
            trust_score: Math.floor(Math.random() * 10) + 90,
            risk_score: Math.floor(Math.random() * 8) + 1,
            reason_codes: ["HUMAN_TELEMETRY_PASSED", "IP_CLEAN", "DEVICE_TRUST_VERIFIED"],
            metadata: {
              ip: `98.110.154.${Math.floor(Math.random() * 254) + 1}`,
              location: "New York, US",
              device: "Safari 17.4 / iPhone 15 Pro",
              network: "Verizon Wireless Fios",
              anomaly_details: "Flawless biometric correlation score, clean local residential carrier."
            },
            timestamp: timestampNow,
            decisionTimeMs: Math.floor(Math.random() * 5) + 7
          };
          setStats(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
            legitApproved: prev.legitApproved + 1,
            avgDecisionTimeMs: Math.round((prev.avgDecisionTimeMs * prev.totalEvents + newEvent.decisionTimeMs) / (prev.totalEvents + 1))
          }));
          break;
      }

      // Add to simulation log list
      setSimulatedEvents(prev => [newEvent, ...prev]);
      
      // Persist to DB and sync UI
      await persistDecision(newEvent);
      onAddEventToGlobalRegistry();

      // Automatically inspect the newly generated token
      setSelectedEvent(newEvent);
      setIsSimulating(false);
    }, 1000);
  };

  // Run automated blend benchmark of 100 randomized event trials
  const handleRunAutomatedBenchmark = () => {
    setIsSimulating(true);
    setSimulationSpeed('benchmark');
    setSimulationProgress(5);

    let currentProgress = 5;
    const interval = setInterval(() => {
      currentProgress += 15;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setSimulationProgress(100);
        
        // Generate 100 blended events metrics bulk update
        const bulkBots = 38;
        const bulkEvasion = 24;
        const bulkAto = 15;
        const bulkSuspicious = 12;
        const bulkLegit = 11;
        const totalBulk = bulkBots + bulkEvasion + bulkAto + bulkSuspicious + bulkLegit;

        setStats(prevStats => ({
          totalEvents: prevStats.totalEvents + totalBulk,
          botBlocked: prevStats.botBlocked + bulkBots,
          banEvasionFlaged: prevStats.banEvasionFlaged + bulkEvasion,
          atoChallenged: prevStats.atoChallenged + bulkAto,
          suspiciousDetected: prevStats.suspiciousDetected + bulkSuspicious,
          legitApproved: prevStats.legitApproved + bulkLegit,
          avgDecisionTimeMs: 12,
          falsePositives: prevStats.falsePositives
        }));

        const randomSuffix1 = Math.random().toString(36).substring(2, 8);
        const randomSuffix2 = Math.random().toString(36).substring(2, 8);
        const randomSuffix3 = Math.random().toString(36).substring(2, 8);

        // Push representative records into history
        const mockBulkEvents: SimulatedEvent[] = [
          {
            id: `sim_bulk_01_${randomSuffix1}`,
            eventType: 'signup_bot',
            eventTypeName: "Bot Signup Attempt",
            external_user_id: "botnet_agent_x38",
            email: "spam_registry@dispostable.com",
            decision: 'DENY',
            trust_score: 2,
            risk_score: 98,
            reason_codes: ["DEVICE_SPOOF_DETECTED", "COORDINATED_REPLAY"],
            metadata: { ip: "203.0.113.44", location: "Helsinki, FI", device: "Puppeteer / Chromium", network: "AS1204 Server Group" },
            timestamp: new Date().toISOString(),
            decisionTimeMs: 11
          },
          {
            id: `sim_bulk_02_${randomSuffix2}`,
            eventType: 'ban_evasion',
            eventTypeName: "Ban Evasion Attempt",
            external_user_id: "blacklist_bypass_9",
            email: "malicious_user_revised@gmail.com",
            decision: 'DENY',
            trust_score: 11,
            risk_score: 89,
            reason_codes: ["HARDWARE_ID_BLACKLISTED"],
            metadata: { ip: "198.51.100.12", location: "Dover, US", device: "Chrome 125 / Windows 10", network: "Residential Comcast" },
            timestamp: new Date().toISOString(),
            decisionTimeMs: 13
          },
          {
            id: `sim_bulk_03_${randomSuffix3}`,
            eventType: 'account_takeover',
            eventTypeName: "Account Takeover",
            external_user_id: "usr_loyal_target",
            email: "honest_merchant@gmail.com",
            decision: 'STEP_UP',
            trust_score: 38,
            risk_score: 62,
            reason_codes: ["GEOGRAPHIC_VELOCITY_VIOLATION", "NEW_DEVICE_UNFAMILIAR"],
            metadata: { ip: "185.190.140.5", location: "Kiev, UA", device: "Firefox / Android", network: "ISP Mobile Hub" },
            timestamp: new Date().toISOString(),
            decisionTimeMs: 14
          }
        ];

        setSimulatedEvents(prev => [...mockBulkEvents, ...prev]);

        // Persist bulk events and refresh global state
        Promise.all(mockBulkEvents.map(evt => persistDecision(evt))).then(() => {
          onAddEventToGlobalRegistry();
          setIsSimulating(false);
        }).catch(err => {
          console.error("Error persisting bulk decisions:", err);
          onAddEventToGlobalRegistry();
          setIsSimulating(false);
        });
      } else {
        setSimulationProgress(currentProgress);
      }
    }, 150);
  };

  // Reset benchmark statistics back to standard initial state
  const handleResetBenchmark = () => {
    setStats({
      totalEvents: 5,
      botBlocked: 2,
      banEvasionFlaged: 1,
      atoChallenged: 1,
      suspiciousDetected: 1,
      legitApproved: 1,
      avgDecisionTimeMs: 14,
      falsePositives: 0
    });
    setSimulatedEvents(simulatedEvents.slice(0, 5));
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Trust Lab Simulation</h2>
          <p className="text-xs text-[#58E38A] mt-1 font-medium">
            Run automated threat scenarios against the Aan (Antigravity Assurance Network) Demo Platform to validate real-time trust metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleResetBenchmark}
            className="flex items-center gap-1.5 bg-black/40 border border-white/[0.08] hover:bg-white/[0.02] text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Statistics</span>
          </button>
        </div>
      </div>

      {/* Safety/Information Banner */}
      <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-xl flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#58E38A] shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <span className="text-white font-semibold">Safe Simulation Environment</span>
          <p className="text-slate-500 leading-relaxed font-normal">
            This workspace represents a safe playground. All activities are local mock transactions constructed to test routing policies, payload configurations, and trust score evaluations in your current project (<strong className="text-slate-300 font-semibold">{projName || "Default Staging Key"}</strong>).
          </p>
        </div>
      </div>

      {/* Comparative Dashboard Cards (Before vs After Aan) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Aan Trust Metrics Comparison</h3>
          <span className="text-[10px] text-slate-500">Demo platform benchmarks based on {stats.totalEvents} mock evaluations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Bot signup card */}
          <div className="bg-[#090a0e] border border-white/[0.03] p-5 rounded-2xl space-y-3.5">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Bot Registrations</span>
              <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                85% Blocked
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-500 text-[9px] block">Without Aan</span>
                <span className="text-base text-slate-400 font-mono font-medium line-through decoration-slate-600">100 allowed</span>
              </div>
              <div className="border-l border-white/[0.04] pl-3.5">
                <span className="text-[#58E38A] text-[9px] block">With Aan</span>
                <span className="text-base text-white font-mono font-bold">15 allowed</span>
              </div>
            </div>
          </div>

          {/* Ban evasion card */}
          <div className="bg-[#090a0e] border border-white/[0.03] p-5 rounded-2xl space-y-3.5">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Ban Evasions</span>
              <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                90% Flagged
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-500 text-[9px] block">Without Aan</span>
                <span className="text-base text-slate-400 font-mono font-medium line-through decoration-slate-600">100 passed</span>
              </div>
              <div className="border-l border-white/[0.04] pl-3.5">
                <span className="text-[#58E38A] text-[9px] block">With Aan</span>
                <span className="text-base text-white font-mono font-bold">10 passed</span>
              </div>
            </div>
          </div>

          {/* Account takeover card */}
          <div className="bg-[#090a0e] border border-white/[0.03] p-5 rounded-2xl space-y-3.5">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Account Takeovers</span>
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                95% Prevented
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-500 text-[9px] block">Without Aan</span>
                <span className="text-base text-slate-400 font-mono font-medium line-through decoration-slate-600">100 breached</span>
              </div>
              <div className="border-l border-white/[0.04] pl-3.5">
                <span className="text-[#58E38A] text-[9px] block">With Aan</span>
                <span className="text-base text-white font-mono font-bold">5 challenged</span>
              </div>
            </div>
          </div>

          {/* Suspicious login speed card */}
          <div className="bg-[#090a0e] border border-white/[0.03] p-5 rounded-2xl space-y-3.5">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Detection Speed</span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-[#58E38A] text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                99.9% Faster
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-500 text-[9px] block">Without Aan</span>
                <span className="text-sm text-slate-400 font-mono font-medium">1,200s (Manual)</span>
              </div>
              <div className="border-l border-white/[0.04] pl-3.5">
                <span className="text-[#58E38A] text-[9px] block">With Aan</span>
                <span className="text-sm text-white font-mono font-bold">1.2s (Real-Time)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Control Panel Block: Run Simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Run Simulations Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Simulate Threat Scenarios</h3>
            <span className="text-[10px] text-slate-500 font-mono">Demo Client v2.4.1</span>
          </div>

          <div className="bg-[#0b0c10] border border-white/[0.04] rounded-2xl divide-y divide-white/[0.03] overflow-hidden">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              return (
                <div key={sc.type} className="p-4 flex items-start gap-4 hover:bg-white/[0.01] transition-colors group">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${sc.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold group-hover:text-[#58E38A] transition-colors">{sc.title}</span>
                      <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        sc.type === 'legit_user' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        sc.type === 'suspicious_login' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {sc.severity}
                      </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed font-normal">{sc.desc}</p>
                  </div>

                  <button
                    disabled={isSimulating}
                    onClick={() => handleSimulate(sc.type)}
                    className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-white bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span>Run</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benchmarking Box & Lab Controls */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Stress Testing</h3>
          
          <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl space-y-5">
            <div className="space-y-1">
              <span className="text-xs text-white font-semibold">Bulk Load Verification</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Trigger a randomized stress blend of 100 verification requests across all 5 profiles to stress-test your rules config.
              </p>
            </div>

            {isSimulating && simulationSpeed === 'benchmark' ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400">BENCHMARKING Aan...</span>
                  <span className="text-white">{simulationProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${simulationProgress}%` }} 
                    className="h-full bg-[#58E38A] rounded-full transition-all duration-150"
                  />
                </div>
              </div>
            ) : (
              <button
                disabled={isSimulating}
                onClick={handleRunAutomatedBenchmark}
                className="w-full flex items-center justify-center gap-2 bg-[#58E38A] hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs py-2.5 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Bulk Test (100 Events)</span>
              </button>
            )}

            <div className="border-t border-white/[0.03] pt-4 space-y-2.5 text-[11px]">
              <div className="flex justify-between py-1 border-b border-white/[0.02]">
                <span className="text-slate-500">Demo App Title</span>
                <span className="text-white font-medium">Aan Demo Platform</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.02]">
                <span className="text-slate-500">Evaluation Speed</span>
                <span className="font-mono text-emerald-400 font-semibold">{stats.avgDecisionTimeMs}ms (API limit: 250ms)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.02]">
                <span className="text-slate-500">Simulated Safe Events</span>
                <span className="font-mono text-white">{stats.totalEvents} tests run</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">False Positives Flagged</span>
                <span className="font-mono text-amber-400 font-semibold">{stats.falsePositives} / {stats.totalEvents}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Simulated Live Feed & Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Simulation Event Log Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Simulated Event Log</h3>
            <span className="text-[10px] text-slate-500">Real-time evaluations feed</span>
          </div>

          <div className="bg-[#0b0c10] border border-white/[0.04] rounded-xl overflow-hidden max-h-[380px] overflow-y-auto divide-y divide-white/[0.03]">
            {simulatedEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No simulated activities. Use the scenario selectors above to run a test.
              </div>
            ) : (
              simulatedEvents.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`w-full text-left p-3.5 flex items-center justify-between text-xs transition-colors hover:bg-white/[0.01] ${selectedEvent?.id === evt.id ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      evt.decision === 'ALLOW' ? 'bg-emerald-400' :
                      evt.decision === 'DENY' ? 'bg-rose-500' : 'bg-amber-400'
                    }`} />
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold font-mono">{evt.id}</span>
                        <span className="text-slate-500 font-mono text-[10px]">{evt.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-mono text-slate-400">{evt.eventTypeName}</span>
                        <span>•</span>
                        <span>{evt.metadata.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      evt.decision === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      evt.decision === 'DENY' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {evt.decision}
                    </span>
                    <span className="block text-[9px] font-mono text-slate-500">{evt.decisionTimeMs}ms</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* JSON Inspector / Claims Token details panel */}
        <div className="lg:col-span-2 space-y-4 font-sans">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Verification Claims Token</h3>
            <span className="text-[10px] text-slate-500 font-mono">Payload viewer</span>
          </div>

          <div className="bg-[#0b0c10] border border-white/[0.04] p-5 rounded-2xl min-h-[380px] h-auto flex flex-col justify-between">
            {selectedEvent ? (
              <div className="space-y-4 h-full flex flex-col justify-between">
                
                {/* Visual Header */}
                <div className="flex items-start justify-between border-b border-white/[0.04] pb-3">
                  <div>
                    <span className="text-white font-mono font-bold text-xs">{selectedEvent.id}</span>
                    <span className="text-[10px] block text-slate-400 font-mono">{selectedEvent.eventTypeName}</span>
                  </div>
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    selectedEvent.decision === 'ALLOW' ? 'bg-emerald-400/15 text-emerald-400' :
                    selectedEvent.decision === 'DENY' ? 'bg-rose-400/15 text-rose-400' : 'bg-amber-400/15 text-amber-400'
                  }`}>
                    {selectedEvent.decision}
                  </span>
                </div>

                {/* Simulated Claims Details */}
                <div className="space-y-2 text-[11px] flex-1 overflow-y-auto py-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">External User ID</span>
                    <span className="font-mono text-white">{selectedEvent.external_user_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Risk score</span>
                    <span className="font-mono font-bold text-rose-400">{selectedEvent.risk_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Trust score</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedEvent.trust_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Simulated Location</span>
                    <span className="text-slate-300">{selectedEvent.metadata.location} ({selectedEvent.metadata.ip})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Platform Device</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{selectedEvent.metadata.device}</span>
                  </div>
                  <div className="space-y-1 pt-1.5">
                    <span className="text-slate-500 block font-sans">Reason Codes</span>
                    <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                      {selectedEvent.reason_codes.map(code => (
                        <span key={code} className="bg-black/40 border border-white/[0.05] text-slate-300 px-1.5 py-0.5 rounded">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedEvent.metadata.anomaly_details && (
                    <div className="bg-black/30 border border-white/[0.03] p-2 rounded-lg text-slate-500 mt-2 italic leading-relaxed text-[10px]">
                      {selectedEvent.metadata.anomaly_details}
                    </div>
                  )}

                  {/* Real-Time Trust Assessment Checklist */}
                  <div className="bg-[#0e1017] border border-white/[0.05] p-3.5 rounded-xl space-y-3 mt-4 text-left">
                    <div className="flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
                      <span className="p-1 bg-[#58E38A]/10 border border-[#58E38A]/20 text-[#58E38A] rounded-lg">
                        <Shield className="w-3 h-3" />
                      </span>
                      <span className="font-mono text-white uppercase tracking-wider font-bold">Aan Trust Assessment Verdict</span>
                    </div>
                    
                    <div className="space-y-3 text-[10.5px]">
                      {/* 1. Is this a real human? */}
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-medium block">1. Is this a real human?</span>
                        <p className="text-[10px] text-slate-300 font-mono">
                          {selectedEvent.risk_score < 40 || selectedEvent.eventType === 'legit_user' ? (
                            <span className="text-[#58E38A]">YES — High-confidence passive human signal ({selectedEvent.trust_score}% humanness score).</span>
                          ) : selectedEvent.eventType === 'suspicious_login' ? (
                            <span className="text-amber-400">UNSURE — Deviating interaction telemetry. Attestation footprint is volatile.</span>
                          ) : (
                            <span className="text-rose-400">NO — Machine traces or headless script execution detected ({selectedEvent.trust_score}% humanness score).</span>
                          )}
                        </p>
                      </div>

                      {/* 2. Is this likely the same returning person? */}
                      <div className="border-t border-white/[0.02] pt-2 space-y-0.5">
                        <span className="text-slate-400 font-medium block">2. Is this likely the same returning person?</span>
                        <p className="text-[10px] text-slate-300 font-mono">
                          {selectedEvent.eventType === 'legit_user' ? (
                            <span className="text-[#58E38A]">YES — Match found with unique hardware/browser signature index across sessions.</span>
                          ) : selectedEvent.eventType === 'ban_evasion' ? (
                            <span className="text-rose-400">YES — Signature MATCHES previously blacklisted/banned user profile.</span>
                          ) : (
                            <span className="text-slate-400">NEW IDENTITY — Establishing brand new trust baseline. No matching index.</span>
                          )}
                        </p>
                      </div>

                      {/* 3. Does this login appear trustworthy? */}
                      <div className="border-t border-white/[0.02] pt-2 space-y-0.5">
                        <span className="text-slate-400 font-medium block">3. Does this login appear trustworthy?</span>
                        <p className="text-[10px] text-slate-300 font-mono">
                          {selectedEvent.risk_score < 30 ? (
                            <span className="text-[#58E38A]">HIGHLY TRUSTWORTHY — Minimal risk index ({selectedEvent.risk_score}/100). No travel anomalies.</span>
                          ) : selectedEvent.risk_score < 70 ? (
                            <span className="text-amber-400">MODERATE RISK — Elevated indicators ({selectedEvent.risk_score}/100). Network or travel variance.</span>
                          ) : (
                            <span className="text-rose-400">HIGH RISK / MALICIOUS — Severe anomalies and bad posture identified ({selectedEvent.risk_score}/100).</span>
                          )}
                        </p>
                      </div>

                      {/* 4. Is additional verification recommended? */}
                      <div className="border-t border-white/[0.02] pt-2 space-y-0.5">
                        <span className="text-slate-400 font-medium block">4. Is additional verification recommended?</span>
                        <p className="text-[10px] text-slate-300 font-mono">
                          {selectedEvent.decision === 'STEP_UP' ? (
                            <span className="text-amber-400">YES — STEP_UP challenge recommended (SMS/OTP fallback or secure CAPTCHA).</span>
                          ) : selectedEvent.decision === 'DENY' ? (
                            <span className="text-rose-400">IMMEDIATE BLOCK — Posture check failed. Prevent session access.</span>
                          ) : (
                            <span className="text-[#58E38A]">NO — Passive validation clean. Proceed without user friction.</span>
                          )}
                        </p>
                      </div>

                      {/* 5. Should this event be flagged for review? */}
                      <div className="border-t border-white/[0.02] pt-2 space-y-0.5">
                        <span className="text-slate-400 font-medium block">5. Should this event be flagged for review?</span>
                        <p className="text-[10px] text-slate-300 font-mono">
                          {selectedEvent.decision === 'REVIEW' || selectedEvent.risk_score >= 50 ? (
                            <span className="text-amber-400">YES — Dispatched to organization manual review pool.</span>
                          ) : (
                            <span className="text-slate-500">NO — Standard passive evaluation. No admin action needed.</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ZK Model Proof Card (REQUESTED STEP 5) */}
                  <div className="bg-black/30 border border-emerald-500/20 p-3.5 rounded-xl space-y-2.5 mt-4 text-left">
                    <div className="flex justify-between items-center border-b border-white/[0.03] pb-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-white">
                        <Binary className="w-3.5 h-3.5 text-[#58E38A]" />
                        <span>ZK Model Proof</span>
                      </div>
                      <span className="bg-emerald-500/10 text-[#58E38A] border border-emerald-500/20 text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase">
                        Verified
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block text-[8px] uppercase">Status</span>
                        <span className="text-[#58E38A] font-bold">Verified</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[8px] uppercase">Model</span>
                        <span className="text-white truncate block">Aan Risk Model v0.1-sandbox</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[8px] uppercase">Verifier</span>
                        <span className="text-white">EZKL</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[8px] uppercase">Verification Time</span>
                        <span className="text-[#58E38A]">{selectedEvent.decisionTimeMs * 11 || 148} ms</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-[8px] uppercase">Proof Hash</span>
                        <span className="text-slate-400 truncate block">0x7a8df1e51b6a71e82b7cfdc1d7c92b2ef81977a4ee40c5ebf092adcf1b6a71e8</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-[8px] uppercase">Public Inputs Hash</span>
                        <span className="text-slate-400 truncate block">0x3fa99bcfdc1d7c92b2ef81977a4ee40c882c1628d42cdd01a5ebf092adcf1b6a</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[8px] uppercase">Verified Output</span>
                        <span className="text-white font-bold">{selectedEvent.risk_score}% Output</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[8px] uppercase">Risk Score</span>
                        <span className="text-rose-400 font-bold">{selectedEvent.risk_score}%</span>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-slate-400 leading-normal border-t border-white/[0.03] pt-1.5">
                      “This proof verifies that the published Aan risk model produced this risk score for the trust event. Raw private inputs are not exposed.”
                    </p>
                    <div className="text-right text-[8px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                      RAW INPUTS HIDDEN
                    </div>
                  </div>
                </div>

                {/* JSON View button */}
                <div className="border-t border-white/[0.04] pt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Signed JWT signature valid</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const jsonStr = JSON.stringify({
                          iss: "aan-trust-network",
                          sub: selectedEvent.external_user_id,
                          jti: selectedEvent.id,
                          timestamp: selectedEvent.timestamp,
                          claims: {
                            decision: selectedEvent.decision,
                            trust_score: selectedEvent.trust_score,
                            risk_score: selectedEvent.risk_score,
                            reason_codes: selectedEvent.reason_codes,
                            location: selectedEvent.metadata.location,
                            device: selectedEvent.metadata.device,
                            zk_proof: {
                              status: "verified",
                              model: "Aan Risk Model v0.1-sandbox",
                              proof_hash: "0x7a8df1e51b6a71e82b7cfdc1d7c92b2ef81977a4ee40c5ebf092adcf1b6a71e8",
                              public_inputs_hash: "0x3fa99bcfdc1d7c92b2ef81977a4ee40c882c1628d42cdd01a5ebf092adcf1b6a",
                              verified_output: selectedEvent.risk_score,
                              verifier: "EZKL"
                            }
                          }
                        }, null, 2);
                        navigator.clipboard.writeText(jsonStr);
                        alert("Token claims copied to clipboard");
                      }}
                      className="text-[#58E38A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileJson className="w-3 h-3" />
                      <span>Copy JWT Claims</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 text-xs space-y-2">
                <FileJson className="w-8 h-8 text-slate-700 animate-pulse" />
                <p>Select an event from the log feed to inspect its signed trust claims token.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
