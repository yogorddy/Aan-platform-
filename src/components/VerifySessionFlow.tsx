import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Check, 
  AlertTriangle, 
  Cpu, 
  Database, 
  Loader2, 
  RefreshCw, 
  User, 
  Key, 
  Lock, 
  Laptop, 
  ShieldCheck, 
  Activity, 
  Terminal,
  Smartphone,
  Mail,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface VerifySessionFlowProps {
  sessionId?: string;
  onComplete: () => void;
  onNavigate: (page: string) => void;
}

interface SecurityScenario {
  id: string;
  name: string;
  description: string;
  simulatedRiskScore: number;
  signals: {
    deviceReputation: 'clean' | 'suspicious' | 'emulator' | 'known_primary';
    proxyDetected: boolean;
    impossibleTravel: boolean;
    locationMatch: 'matched' | 'unusual_node' | 'foreign_datacenter';
    browserIntegrityIndex: number;
    behaviorRating: 'natural' | 'high_velocity' | 'mismatch';
  };
}

const SECURITY_SCENARIOS: SecurityScenario[] = [
  {
    id: 'score_low',
    name: 'Low Risk — Legitimate Primary User',
    description: 'Matches known household device signatures, local residential ISP node, and standard historical velocity.',
    simulatedRiskScore: 12,
    signals: {
      deviceReputation: 'known_primary',
      proxyDetected: false,
      impossibleTravel: false,
      locationMatch: 'matched',
      browserIntegrityIndex: 98,
      behaviorRating: 'natural'
    }
  },
  {
    id: 'score_med',
    name: 'Medium Risk — Suspicious Session Drift',
    description: 'An unrecognized hardware environment detected from an unusual network route, requiring challenge attestation.',
    simulatedRiskScore: 48,
    signals: {
      deviceReputation: 'suspicious',
      proxyDetected: false,
      impossibleTravel: false,
      locationMatch: 'unusual_node',
      browserIntegrityIndex: 82,
      behaviorRating: 'natural'
    }
  },
  {
    id: 'score_high',
    name: 'High Risk — Coordinated Proxy Network',
    description: 'Unregistered user-agent headers coupled with active VPN/proxy tunnels and altered keystroke dynamics.',
    simulatedRiskScore: 78,
    signals: {
      deviceReputation: 'suspicious',
      proxyDetected: true,
      impossibleTravel: false,
      locationMatch: 'foreign_datacenter',
      browserIntegrityIndex: 61,
      behaviorRating: 'high_velocity'
    }
  },
  {
    id: 'score_crit',
    name: 'Critical Threat — Emulated Automation Bot',
    description: 'Automated headless framework detected inside a virtualized physical device environment.',
    simulatedRiskScore: 96,
    signals: {
      deviceReputation: 'emulator',
      proxyDetected: true,
      impossibleTravel: true,
      locationMatch: 'foreign_datacenter',
      browserIntegrityIndex: 12,
      behaviorRating: 'high_velocity'
    }
  }
];

export default function VerifySessionFlow({ sessionId: initialSessionId, onComplete, onNavigate }: VerifySessionFlowProps) {
  const [sessionId, setSessionId] = useState<string>(initialSessionId || "");
  const [username, setUsername] = useState<string>("enterprise_developer@aan.trust");
  const [primaryMethod, setPrimaryMethod] = useState<'password' | 'passkey' | 'sso' | 'saml'>('passkey');
  const [password, setPassword] = useState<string>("••••••••••••");
  
  // Custom Flow routing states: 'username' -> 'primary_auth' -> 'evaluating' -> 'challenge_gate' -> 'final_auth_success' | 'final_auth_blocked'
  const [flowState, setFlowState] = useState<'username' | 'primary_auth' | 'evaluating' | 'challenge_gate' | 'final_auth_success' | 'final_auth_blocked'>('username');
  
  // Simulation Control Center States
  const [activeScenario, setActiveScenario] = useState<SecurityScenario>(SECURITY_SCENARIOS[0]);
  const [riskThresholdMed, setRiskThresholdMed] = useState<number>(30);
  const [riskThresholdHigh, setRiskThresholdHigh] = useState<number>(65);
  const [riskThresholdCrit, setRiskThresholdCrit] = useState<number>(85);

  // Enabled methods state
  const [enabledMethods, setEnabledMethods] = useState({
    deviceConsistency: true,
    passkey: true,
    authenticator: true,
    emailToken: true,
    smsToken: true,
    hardwareKey: true,
    sessionIntegrity: true
  });

  // Chosen Adaptive verification tool during challenge mode
  const [selectedChallengeType, setSelectedChallengeType] = useState<'deviceConsistency' | 'authenticator' | 'emailToken' | 'smsToken' | 'hardwareKey' | 'sessionIntegrity' | null>(null);
  const [challengeStep, setChallengeStep] = useState<'choose' | 'active' | 'success' | 'fail'>('choose');

  // Input states for verification challenges
  const [totpInput, setTotpInput] = useState<string>("");
  const [emailTokenInput, setEmailTokenInput] = useState<string>("");
  const [deviceScanning, setDeviceScanning] = useState<boolean>(false);
  const [hardwareKeyDetected, setHardwareKeyDetected] = useState<boolean>(false);
  
  // Handshake progress tracking
  const [handshakeProgress, setHandshakeProgress] = useState(0);

  // Terminal telemetry logs
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionId) {
      setSessionId(`vss_${Math.random().toString(36).substring(2, 11)}`);
    }
  }, [sessionId]);

  const selectScenario = (scenario: SecurityScenario) => {
    setActiveScenario(scenario);
    setFlowState('username');
    setChallengeStep('choose');
    setSelectedChallengeType(null);
    setHandshakeProgress(0);
  };

  const runEvaluationAnalytics = () => {
    setFlowState('evaluating');
    setIsEvaluating(true);
    setTelemetryLogs([]);

    const logPoints = [
      `[INIT] Booting AAN Protocol attestation layers for session ${sessionId}`,
      `[CLAIM] Processing identity claim identifier: ${username}`,
      `[HARDWARE] Evaluating device rep signatures: [${activeScenario.signals.deviceReputation.toUpperCase()}]`,
      `[INTEGRITY] Analyzing system posture rating: ${activeScenario.signals.browserIntegrityIndex}/100`,
      `[LOCATION] Correlating route travel constraints: ${activeScenario.signals.locationMatch.toUpperCase()}`,
      activeScenario.signals.proxyDetected ? `[WARN] Proxy / VPN routing endpoint observed` : `[NETWORK] Clean residential IP address verified`,
      activeScenario.signals.impossibleTravel ? `[THREAT] Impossible spatial-velocity travel sequence logged` : `[LOCATION] Localized travel timeline approved`,
      `[CALCULATE] Compiling multi-signal posture score against enterprise threshold templates...`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logPoints.length) {
        setTelemetryLogs(prev => [...prev, logPoints[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsEvaluating(false);
          assessRiskOutcome();
        }, 800);
      }
    }, 450);
  };

  const assessRiskOutcome = () => {
    const score = activeScenario.simulatedRiskScore;
    
    if (score >= riskThresholdCrit) {
      setFlowState('final_auth_blocked');
      appendActionLog("Critical Risk Authentication Blocked", `Session login attempted by ${username} blocked due to critical risk factors (${score}/100).`, "Suspended");
    } else if (score >= riskThresholdHigh || score >= riskThresholdMed) {
      setFlowState('challenge_gate');
      setChallengeStep('choose');
      const firstEnabled = getFirstEnabledChallenge();
      setSelectedChallengeType(firstEnabled);
    } else {
      setFlowState('final_auth_success');
      appendActionLog("Dynamic Zero-Friction Authentication Approved", `Session login completed instantly by verified user ${username} under normal risk tolerances (${score}/100).`, "Neutral");
    }
  };

  const getFirstEnabledChallenge = (): any => {
    if (enabledMethods.deviceConsistency) return 'deviceConsistency';
    if (enabledMethods.hardwareKey) return 'hardwareKey';
    if (enabledMethods.authenticator) return 'authenticator';
    if (enabledMethods.emailToken) return 'emailToken';
    if (enabledMethods.sessionIntegrity) return 'sessionIntegrity';
    return null;
  };

  const appendActionLog = async (event: string, description: string, scoreChange: string) => {
    try {
      await fetch('/api/internal/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: "usr_b710ef67",
          sessionId: sessionId,
          event,
          description,
          trustScoreChange: scoreChange
        })
      });
    } catch (e) {
      console.warn("Analytics syncing deferred", e);
    }
  };

  const handleDeviceConsistencyTrigger = () => {
    setDeviceScanning(true);
    setTimeout(() => {
      setDeviceScanning(false);
      setChallengeStep('success');
    }, 1200);
  };

  const handleHardwareKeyTrigger = () => {
    setHardwareKeyDetected(true);
    setTimeout(() => {
      setHardwareKeyDetected(false);
      setChallengeStep('success');
    }, 1000);
  };

  const submitTotpChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpInput.length < 4) return;
    setChallengeStep('success');
  };

  const submitEmailTokenChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailTokenInput.length < 4) return;
    setChallengeStep('success');
  };

  useEffect(() => {
    if (selectedChallengeType !== 'sessionIntegrity' || challengeStep !== 'active') return;

    let scanTimer: NodeJS.Timeout;
    scanTimer = setInterval(() => {
      setHandshakeProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanTimer);
          setChallengeStep('success');
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(scanTimer);
  }, [selectedChallengeType, challengeStep]);

  const handleStartSessionIntegrityChallenge = () => {
    setChallengeStep('active');
    setHandshakeProgress(0);
  };

  const completeAdaptiveAuthFlow = () => {
    appendActionLog(
      "Elevated Risk Challenge Completed", 
      `Login authorized for ${username} after successfully clearing adaptive verification checks [${selectedChallengeType?.toUpperCase()}]. Risk score mitigated.`, 
      "+35 (Trust Approved)"
    );
    setFlowState('final_auth_success');
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#e3e5eb] flex flex-col justify-between py-12 px-8 selection:bg-[#202533]">
      
      {/* Top Header Panel */}
      <div className="max-w-7xl mx-auto w-full mb-10">
        <div className="bg-[#111319] border border-[#1b1e28] p-5 rounded-xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-950/40 p-2 rounded border border-blue-900/30 text-blue-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-[#5d6780] uppercase tracking-wider font-bold block">AAN Session Verification Environment</span>
              <h1 className="font-sans font-bold text-white text-base tracking-tight">Trust Verification Hub</h1>
            </div>
          </div>
          <div className="text-[11px] text-[#78819a] font-mono max-w-lg text-right hidden lg:block leading-relaxed">
            Evaluating <span className="text-blue-500 font-bold">12+ dynamic signal matrices</span>. User credentials remain completely secure and localized. No biometric or sovereign data is persistently logged.
          </div>
        </div>
      </div>

      {/* Main Column Split */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 my-auto items-start">
        
        {/* LEFT COLUMN: THE LOGIN VIEWPORT */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl relative overflow-hidden max-w-xl mx-auto w-full shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
            
            {/* STATE A: IDENTITY INTAKE */}
            {flowState === 'username' && (
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#5d6780] uppercase tracking-wider font-bold">STAGE 01 — IDENTITY STATEMENT</span>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SECURE
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-white tracking-tight">Enter Your Corporate Account</h2>
                  <p className="text-xs text-[#78819a] leading-relaxed">
                    AAN is a privacy-first identity standard. It confirms you are a real, unique returning human actor without exposing your raw private details to external platforms.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 font-mono text-xs">
                    <label className="text-[10px] text-[#78819a] uppercase tracking-wider font-bold">Account Claimant Identifier</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-[#5d6780]">@</span>
                      <input 
                        type="email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded py-3 pl-8 pr-4 text-xs text-[#e3e5eb] focus:outline-none focus:border-blue-600 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setFlowState('primary_auth')}
                    className="w-full bg-white hover:bg-[#e2e5eb] text-[#0d0e12] font-mono text-xs font-bold py-3.5 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Verification</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STATE B: PRIMARY AUTHORIZATION FACTORS */}
            {flowState === 'primary_auth' && (
              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-[#5d6780] uppercase tracking-wider font-bold">STAGE 02 — PRIMARY SECURITY CHECK</span>
                  <h3 className="font-bold text-white text-lg tracking-tight">Select Primary Authentication Method</h3>
                  <p className="text-xs text-[#78819a]">Organizations mandate validating standard passwords or keys before postural checking.</p>
                </div>

                {/* Authentication Method Tabs */}
                <div className="grid grid-cols-4 gap-2 font-mono text-[10px]">
                  {[
                    { id: 'passkey', label: 'Passkey', icon: Cpu, color: 'text-indigo-400' },
                    { id: 'password', label: 'Password', icon: Key, color: 'text-blue-400' },
                    { id: 'sso', label: 'SSO key', icon: Database, color: 'text-emerald-400' },
                    { id: 'saml', label: 'SAML Hub', icon: Shield, color: 'text-[#d2ab6c]' }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPrimaryMethod(tab.id as any)}
                        className={`py-3 rounded border flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                          primaryMethod === tab.id 
                            ? 'bg-[#141822] border-blue-600 text-white font-bold' 
                            : 'bg-[#0d0e12] border-[#1b1e28] text-[#78819a] hover:text-[#e3e5eb]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${tab.color}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-2 font-mono text-xs">
                  {primaryMethod === 'password' && (
                    <div className="space-y-2">
                      <label className="text-[10px] text-[#78819a] uppercase block font-bold">Account Access Key</label>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#0d0e12] border border-[#1b1e28] px-3.5 py-3 rounded text-white text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  )}

                  {primaryMethod === 'passkey' && (
                    <div className="bg-[#0d0e12] border border-[#1b1e28] p-4 rounded-lg space-y-2">
                      <div className="flex items-start gap-3 text-xs text-[#78819a] leading-relaxed font-sans">
                        <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>FIDO2 / WebAuthn cryptographic hardware prompt configured. Touch your system key, biometric reader, or hardware authenticator when prompted.</span>
                      </div>
                    </div>
                  )}

                  {primaryMethod === 'sso' && (
                    <div className="bg-[#0d0e12] border border-[#1b1e28] p-4 rounded-lg leading-relaxed text-xs text-[#78819a]">
                      SSO Pipeline Active: Linked securely via <strong className="text-emerald-400 font-mono">Sovereign GitHub Keyring</strong>.
                    </div>
                  )}

                  {primaryMethod === 'saml' && (
                    <div className="bg-[#0d0e12] border border-[#1b1e28] p-4 rounded-lg text-xs text-[#78819a]">
                      Federated Identity Active: Linked to your enterprise <strong className="text-blue-400 font-mono">OKTA Directory Relay</strong>.
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setFlowState('username')}
                      className="w-1/3 bg-[#0d0e12] border border-[#1b1e28] hover:bg-[#111319] text-[#78819a] text-xs py-3 rounded font-mono transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={runEvaluationAnalytics}
                      className="w-2/3 bg-white hover:bg-[#e2e5eb] text-[#0d0e12] font-mono font-bold text-xs py-3 rounded transition-all cursor-pointer"
                    >
                      Evaluate Posture
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STATE C: LOG TERMINAL */}
            {flowState === 'evaluating' && (
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                  <h3 className="font-mono text-xs text-white uppercase tracking-wider">Processing Posture Signals...</h3>
                  <p className="text-[11px] text-[#78819a] font-sans">AAN is computing non-fingerprinting network & travel velocities.</p>
                </div>

                <div className="bg-[#0d0e12] border border-[#1b1e28] rounded-lg p-5 font-mono text-[10.5px] text-[#a5b0cb] space-y-1.5 h-48 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#1b1e28] pb-2 mb-2 text-[#5d6780] font-bold uppercase tracking-wider text-[9px]">
                    <span>POSTURE SIGNAL COMPILATION</span>
                    <span className="text-blue-500">LIVE FEED</span>
                  </div>
                  {telemetryLogs.map((log, lIdx) => (
                    <div key={lIdx} className="leading-relaxed border-l border-[#1b1e28] pl-2 text-[#78819a]">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATE D: ADAPTIVE CHALLENGE CHANNELS */}
            {flowState === 'challenge_gate' && (
              <div className="p-8 space-y-6">
                <div className="bg-[#1a1412] border border-amber-900/30 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-[#d2ab6c] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#d2ab6c] font-mono font-bold uppercase tracking-wider block">Elevated Threat Triggered ({activeScenario.simulatedRiskScore}/100)</span>
                    <p className="text-xs text-[#a5b0cb] font-sans leading-relaxed">
                      Primary credentials accepted, but anomalous environmental parameters (proxy usage or unknown hardware profile) warrant explicit verification.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {challengeStep === 'choose' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#5d6780] font-black tracking-widest block">Allowed Attestation Protocols</span>
                        <p className="text-[11px] text-[#78819a] font-sans">Select any active system parameter checkpoint to resolve the session block.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                        {enabledMethods.deviceConsistency && (
                          <button 
                            onClick={() => { setSelectedChallengeType('deviceConsistency'); setChallengeStep('active'); }}
                            className="bg-[#0d0e12] border border-[#1b1e28] hover:border-[#2b3143] p-3 rounded text-left transition text-[#e3e5eb] cursor-pointer flex items-center gap-2.5"
                          >
                            <Laptop className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span>Device Attestation</span>
                          </button>
                        )}

                        {enabledMethods.hardwareKey && (
                          <button 
                            onClick={() => { setSelectedChallengeType('hardwareKey'); setChallengeStep('active'); }}
                            className="bg-[#0d0e12] border border-[#1b1e28] hover:border-[#2b3143] p-3 rounded text-left transition text-[#e3e5eb] cursor-pointer flex items-center gap-2.5"
                          >
                            <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                            <span>FIDO2 Token check</span>
                          </button>
                        )}

                        {enabledMethods.authenticator && (
                          <button 
                            onClick={() => { setSelectedChallengeType('authenticator'); setChallengeStep('active'); }}
                            className="bg-[#0d0e12] border border-[#1b1e28] hover:border-[#2b3143] p-3 rounded text-left transition text-[#e3e5eb] cursor-pointer flex items-center gap-2.5"
                          >
                            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>TOTP Authenticator</span>
                          </button>
                        )}

                        {enabledMethods.emailToken && (
                          <button 
                            onClick={() => { setSelectedChallengeType('emailToken'); setChallengeStep('active'); }}
                            className="bg-[#0d0e12] border border-[#1b1e28] hover:border-[#2b3143] p-3 rounded text-left transition text-[#e3e5eb] cursor-pointer flex items-center gap-2.5"
                          >
                            <Mail className="w-4 h-4 text-[#d2ab6c] shrink-0" />
                            <span>One-Time Email Code</span>
                          </button>
                        )}

                        {enabledMethods.sessionIntegrity && (
                          <button 
                            onClick={() => { setSelectedChallengeType('sessionIntegrity'); handleStartSessionIntegrityChallenge(); }}
                            className="bg-[#0d0e12] border border-blue-600/30 p-3 rounded text-left transition text-[#e3e5eb] cursor-pointer flex items-center gap-2.5 col-span-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
                            <span className="font-bold text-white flex items-center gap-1.5">
                              Run Handshake Integrity <span className="bg-blue-950 text-blue-400 font-mono text-[8px] px-1.5 py-0.5 rounded border border-blue-900/40">RECOMMENDED</span>
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE STEPS FOR SPECIFIC CHALLENGES */}
                  {challengeStep === 'active' && selectedChallengeType === 'deviceConsistency' && (
                    <div className="bg-[#0d0e12] border border-[#1b1e28] p-6 rounded-lg space-y-4 text-center">
                      <Laptop className={`w-12 h-12 mx-auto ${deviceScanning ? 'text-blue-500 animate-pulse' : 'text-[#78819a]'}`} />
                      <div className="space-y-1">
                        <h4 className="text-sm font-mono font-bold text-white">Cryptographic Device Assessment</h4>
                        <p className="text-xs text-[#78819a]">AAN calculates physical CPU registers and hardware timing loops.</p>
                      </div>
                      
                      <button 
                        onClick={handleDeviceConsistencyTrigger}
                        className="bg-white hover:bg-[#e2e5eb] text-[#0d0e12] text-xs px-5 py-2.5 rounded font-mono font-bold transition cursor-pointer"
                      >
                        {deviceScanning ? "Reading hardware state..." : "Trigger Device Handshake"}
                      </button>
                    </div>
                  )}

                  {challengeStep === 'active' && selectedChallengeType === 'hardwareKey' && (
                    <div className="bg-[#0d0e12] border border-[#1b1e28] p-6 rounded-lg space-y-4 text-center">
                      <Shield className={`w-12 h-12 mx-auto ${hardwareKeyDetected ? 'text-blue-400 animate-bounce' : 'text-[#78819a]'}`} />
                      <div className="space-y-1">
                        <h4 className="text-sm font-mono font-bold text-white">Touch Security Token Check</h4>
                        <p className="text-xs text-[#78819a]">Insert your credential token and touch the verification contact pad.</p>
                      </div>

                      <button 
                        onClick={handleHardwareKeyTrigger}
                        className="bg-white hover:bg-[#e2e5eb] text-[#0d0e12] text-xs px-5 py-2.5 rounded font-mono font-bold transition cursor-pointer"
                      >
                        {hardwareKeyDetected ? "Authenticating WebAuthn Key Token..." : "Simulate Touch Token"}
                      </button>
                    </div>
                  )}

                  {challengeStep === 'active' && selectedChallengeType === 'authenticator' && (
                    <form onSubmit={submitTotpChallenge} className="bg-[#0d0e12] border border-[#1b1e28] p-6 rounded-lg space-y-4 text-center max-w-sm mx-auto">
                      <Smartphone className="w-10 h-10 mx-auto text-emerald-500" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-mono font-bold text-white">Google Authenticator OTP</h4>
                        <p className="text-xs text-[#78819a]">Input your 6-digit dynamically changing credential.</p>
                      </div>

                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        value={totpInput}
                        onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                        className="bg-[#111319] border border-[#1b1e28] text-center font-mono text-lg py-2 rounded.5 w-40 text-emerald-400 focus:outline-none focus:border-emerald-500"
                        required
                      />

                      <div className="pt-2">
                        <button 
                          type="submit"
                          className="bg-white hover:bg-[#e2e5eb] text-[#0d0e12] text-xs px-5 py-2.5 rounded font-mono font-bold transition cursor-pointer"
                        >
                          Verify TOTP Token
                        </button>
                      </div>
                    </form>
                  )}

                  {challengeStep === 'active' && selectedChallengeType === 'emailToken' && (
                    <form onSubmit={submitEmailTokenChallenge} className="bg-[#0d0e12] border border-[#1b1e28] p-6 rounded-lg space-y-4 text-center max-w-sm mx-auto">
                      <Mail className="w-10 h-10 mx-auto text-blue-400" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-mono font-bold text-white">One-Time Security Pin</h4>
                        <p className="text-xs text-[#78819a]">We dispatched a single-use authorization token to: <b>{username}</b></p>
                      </div>

                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Security Pin"
                        value={emailTokenInput}
                        onChange={(e) => setEmailTokenInput(e.target.value)}
                        className="bg-[#111319] border border-[#1b1e28] text-center font-mono text-xs py-2.5 rounded w-48 text-white focus:outline-none focus:border-blue-500"
                        required
                      />

                      <div className="pt-2">
                        <button 
                          type="submit"
                          className="bg-white hover:bg-[#e2e5eb] text-[#0d0e12] text-xs px-5 py-2.5 rounded font-mono font-bold transition cursor-pointer"
                        >
                          Confirm Pin Check
                        </button>
                      </div>
                    </form>
                  )}

                  {challengeStep === 'active' && selectedChallengeType === 'sessionIntegrity' && (
                    <div className="bg-[#0d0e12] border border-[#1b1e28] p-5 rounded-lg space-y-4">
                      <div className="text-left font-mono text-[9px] uppercase tracking-widest text-blue-500 font-black">
                        INTEGRITY PIPELINE ANALYSIS
                      </div>
                      
                      <div className="bg-[#111319] border border-[#1b1e28] p-4 rounded font-mono text-[10px] text-[#78819a] space-y-2 text-left leading-relaxed">
                        <div className="flex items-center gap-2 text-blue-500 font-bold">
                          <Terminal className="w-4 h-4 animate-pulse" />
                          <span>Establishing Secure Connection Attestation...</span>
                        </div>
                        <div className="text-[9px] text-[#5d6780] pl-5 space-y-1">
                          <div>&gt; Generating unique ECDSA challenge key...</div>
                          <div>&gt; Signing postural payload state...</div>
                          {handshakeProgress > 30 && <div className="text-blue-500">&gt; Encrypted postural hash calculated.</div>}
                          {handshakeProgress > 70 && <div className="text-emerald-500">&gt; Single-use proof token compiled successfully.</div>}
                        </div>
                      </div>

                      <div className="space-y-2 max-w-xs mx-auto">
                        <div className="flex justify-between font-mono text-[8px] text-[#5d6780] font-bold">
                          <span>ANALYSIS PROGRESS:</span>
                          <span>{handshakeProgress}% COMPLETE</span>
                        </div>
                        <div className="w-full bg-[#111319] h-1.5 rounded overflow-hidden">
                          <div className="bg-blue-600 h-full transition-all duration-150" style={{ width: `${handshakeProgress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {challengeStep === 'success' && (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 p-6 rounded-lg text-center space-y-4">
                      <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-mono font-bold text-emerald-400">Attestation Completed</h4>
                        <p className="text-xs text-[#a5b0cb]">The verification check successfully validated your returning human identity.</p>
                      </div>

                      <button 
                        onClick={completeAdaptiveAuthFlow}
                        className="bg-white hover:bg-[#e2e5eb] text-[#0d0e12] text-xs font-mono font-bold px-6 py-2.5 rounded transition-colors cursor-pointer"
                      >
                        Authorize Secure Handshake
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs pt-4 border-t border-[#1b1e28]">
                    <button 
                      onClick={() => { setFlowState('primary_auth'); setSelectedChallengeType(null); }}
                      className="text-[#5d6780] hover:text-[#78819a] font-mono cursor-pointer"
                    >
                      Reset factors
                    </button>

                    {challengeStep !== 'choose' && challengeStep !== 'success' && (
                      <button 
                        onClick={() => { setChallengeStep('choose'); }}
                        className="text-blue-500 hover:text-blue-400 font-mono cursor-pointer"
                      >
                        Change factor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STATE E: VERIFICATION SUCCESS */}
            {flowState === 'final_auth_success' && (
              <div className="p-8 space-y-6 text-center">
                <div className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                
                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-emerald-500 font-black uppercase tracking-widest block">SESSION SECURED</span>
                  <h2 className="text-xl font-bold font-sans text-white">Identity Assured</h2>
                  <p className="text-xs text-[#78819a] max-w-sm mx-auto leading-relaxed">
                    AAN Protocol evaluated the session signature to authenticate <strong className="text-white font-mono select-all">{username}</strong> without risk flags.
                  </p>
                </div>

                <div className="bg-[#0d0e12] border border-[#1b1e28] p-4 rounded-lg text-left font-mono text-[10.5px] space-y-2 select-all text-[#78819a]">
                  <div className="flex justify-between text-[#5d6780] text-[9px] uppercase font-bold border-b border-[#1b1e28] pb-1.5 mb-1">
                    <span>SECURITY PROOF ATTESTATION</span>
                    <span className="text-emerald-500">AUTHORIZED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Claim:</span>
                    <span className="text-[#e3e5eb]">{username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Evaluated Posture Score:</span>
                    <span className="text-emerald-400 font-bold">{activeScenario.simulatedRiskScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dynamic Attestation Factor:</span>
                    <span className="text-blue-400 font-bold uppercase">{selectedChallengeType || "NONE (PASSED)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proof Session Key:</span>
                    <span className="text-[#a5b0cb] truncate max-w-[140px]">{sessionId}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 font-mono text-xs">
                  <button 
                    onClick={() => { setFlowState('username'); setSelectedChallengeType(null); }}
                    className="w-1/2 bg-[#0d0e12] border border-[#1b1e28] hover:bg-[#111319] text-[#78819a] py-2.5 rounded transition-colors"
                  >
                    Reset Check
                  </button>
                  <button 
                    onClick={onComplete}
                    className="w-1/2 bg-white hover:bg-[#e2e5eb] text-[#0d0e12] font-bold py-2.5 rounded transition-colors cursor-pointer"
                  >
                    Enter Console
                  </button>
                </div>
              </div>
            )}

            {/* STATE F: VERIFICATION TERMINATED */}
            {flowState === 'final_auth_blocked' && (
              <div className="p-8 space-y-6 text-center">
                <div className="bg-red-950/40 border border-red-900/50 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-red-400 font-bold uppercase tracking-widest block">MALICIOUS SIGNATURE BLOCKED</span>
                  <h2 className="text-lg font-bold text-white tracking-tight">Access Request Denied</h2>
                  <p className="text-xs text-[#78819a] max-w-sm mx-auto leading-relaxed">
                    AAN Protocol registered severe postural anomalies scoring <strong className="text-red-500">{activeScenario.simulatedRiskScore}/100</strong>. Access blocked due to emulators, automated scripting, or key mismatch.
                  </p>
                </div>

                <div className="bg-[#0d0e12] border border-[#1b1e28] p-4 rounded-lg text-left font-mono text-[10.5px] space-y-2 text-[#78819a]">
                  <div className="text-[#5d6780] font-bold uppercase text-[9px] border-b border-[#1b1e28] pb-1.5 mb-1">INCIDENT SUMMARY RECORD</div>
                  <div>• Identifier: {username}</div>
                  <div>• Violation: System virtualization frame detected</div>
                  <div>• Geo Posture: Suspicious datacenter routing route</div>
                  <div>• Resolve: Hardware key revocation; address blocked</div>
                </div>

                <div className="pt-2 font-mono text-xs">
                  <button 
                    onClick={() => setFlowState('username')}
                    className="w-full bg-[#0d0e12] border border-[#1b1e28] hover:bg-[#111319] text-[#78819a] py-3 rounded transition-colors"
                  >
                    Restart Attestation Pipeline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RECONFIGURABLE DECISION CONTROLLER */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Controls: Presets */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-500" />
                <h3 className="font-mono font-bold text-white text-xs uppercase tracking-wider">Threat Simulation Controls</h3>
              </div>
              <p className="text-[11px] text-[#78819a] font-sans leading-relaxed">Toggle physical client signals to test how the AAN posture comparator dynamically triggers security challenges.</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {SECURITY_SCENARIOS.map((scen) => {
                const isActive = activeScenario.id === scen.id;
                return (
                  <button
                    key={scen.id}
                    onClick={() => selectScenario(scen)}
                    className={`p-3.5 rounded border text-left text-xs font-mono transition-all flex justify-between items-start cursor-pointer ${
                      isActive 
                        ? 'bg-[#0d0e12] border-blue-600 shadow-lg' 
                        : 'bg-[#111319] border-[#1b1e28] hover:bg-[#0d0e12]'
                    }`}
                  >
                    <div className="space-y-1.5 max-w-[85%]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          scen.simulatedRiskScore < 25 ? 'bg-emerald-500' :
                          scen.simulatedRiskScore < 65 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="font-bold text-white block">{scen.name}</span>
                      </div>
                      <p className="text-[11px] text-[#78819a] normal-case leading-relaxed font-sans">{scen.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-[#5d6780] font-bold block leading-none uppercase">Risk</span>
                      <span className={`text-sm font-black ${
                        scen.simulatedRiskScore < 25 ? 'text-emerald-400' :
                        scen.simulatedRiskScore < 65 ? 'text-yellow-400' : 'text-red-400'
                      }`}>{scen.simulatedRiskScore}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Policies */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-500" />
                <h3 className="font-mono font-bold text-white text-xs uppercase tracking-wider">Verification Policies</h3>
              </div>
              <p className="text-[11px] text-[#78819a] font-sans">Enforce required validation metrics for current sessions.</p>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] text-[#5d6780] uppercase font-bold block border-b border-[#1b1e28] pb-1">Enabled Verification Factors</span>
              
              <div className="grid grid-cols-2 gap-2.5 text-[10px]">
                <label className="flex items-center gap-2 text-[#a5b0cb] cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.deviceConsistency}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, deviceConsistency: e.target.checked })}
                    className="accent-blue-600"
                  />
                  <span>Device Posture</span>
                </label>

                <label className="flex items-center gap-2 text-[#a5b0cb] cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.hardwareKey}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, hardwareKey: e.target.checked })}
                    className="accent-blue-600"
                  />
                  <span>FIDO2 Keys</span>
                </label>

                <label className="flex items-center gap-2 text-[#a5b0cb] cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.authenticator}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, authenticator: e.target.checked })}
                    className="accent-blue-600"
                  />
                  <span>TOTP Code</span>
                </label>

                <label className="flex items-center gap-2 text-[#a5b0cb] cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.emailToken}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, emailToken: e.target.checked })}
                    className="accent-blue-600"
                  />
                  <span>Email Access</span>
                </label>

                <label className="flex items-center gap-2 text-[#a5b0cb] cursor-pointer select-none col-span-2 border-t border-[#1b1e28] pt-2.5 mt-1">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.sessionIntegrity}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, sessionIntegrity: e.target.checked })}
                    className="accent-blue-600"
                  />
                  <span className="font-bold text-white flex items-center gap-1.5">
                    Session Integrity Handshake <span className="bg-blue-950 text-blue-400 font-mono text-[8px] px-1.5 py-0.5 rounded border border-blue-900/40">RECOMMENDED</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Thresholds */}
            <div className="space-y-2 border-t border-[#1b1e28] pt-3">
              <span className="text-[9px] text-[#5d6780] uppercase font-bold block">Risk Threshold Tiers</span>
              
              <div className="space-y-2.5 text-[10px] text-[#78819a]">
                <div className="flex justify-between items-center">
                  <span>Medium Risk (Gate Factor):</span>
                  <span className="text-yellow-400 font-bold font-mono">{riskThresholdMed}%</span>
                </div>
                <input 
                  type="range" 
                  min={10} 
                  max={50} 
                  value={riskThresholdMed} 
                  onChange={(e) => setRiskThresholdMed(Number(e.target.value))}
                  className="w-full h-1 accent-blue-600 bg-[#0d0e12] rounded" 
                />

                <div className="flex justify-between items-center">
                  <span>High Risk (Stricter Challenges):</span>
                  <span className="text-red-400 font-bold font-mono">{riskThresholdHigh}%</span>
                </div>
                <input 
                  type="range" 
                  min={51} 
                  max={80} 
                  value={riskThresholdHigh} 
                  onChange={(e) => setRiskThresholdHigh(Number(e.target.value))}
                  className="w-full h-1 accent-blue-600 bg-[#0d0e12] rounded" 
                />

                <div className="flex justify-between items-center">
                  <span>Critical Risk (Force Shutdown):</span>
                  <span className="text-red-600 font-bold font-mono">{riskThresholdCrit}%</span>
                </div>
                <input 
                  type="range" 
                  min={81} 
                  max={99} 
                  value={riskThresholdCrit} 
                  onChange={(e) => setRiskThresholdCrit(Number(e.target.value))}
                  className="w-full h-1 accent-blue-600 bg-[#0d0e12] rounded" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance footer note */}
      <div className="text-center mt-10 text-[10.5px] text-[#5d6780] max-w-lg mx-auto leading-relaxed font-mono">
        <span className="text-[#78819a]">Regulatory Audit Compliance:</span> System actions, dynamic challenges, and posture computations execute securely under sandbox specifications without physical identification logs.
      </div>
    </div>
  );
}
