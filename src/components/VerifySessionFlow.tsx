import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Check, AlertTriangle, Cpu, Database, EyeOff, Loader2, RefreshCw, 
  User, Key, Fingerprint, Mail, Smartphone, Eye, Camera, AppWindow,
  Sliders, Lock, Compass, MapPin, Laptop, ShieldCheck, Activity, Terminal
} from 'lucide-react';

interface VerifySessionFlowProps {
  sessionId?: string;
  onComplete: () => void;
  onNavigate: (page: string) => void;
}

// Pre-defined security scenarios for sandbox evaluation
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
    description: 'Matches known household device signatures, local ISP node, and standard historical activity.',
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
    description: 'A new physical device is detected from an unusual country state, requiring security validation.',
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
    description: 'Unregistered user agent with active proxy tunnels and non-standard keyboard velocity indicators.',
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
    description: 'Automated Headless Chromium framework detected on an emulated virtual physical hardware matrix.',
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
  
  // Custom Flow routing states
  // 'username' -> 'primary_auth' -> 'evaluating' -> 'challenge_gate' -> 'final_auth_success' | 'final_auth_blocked'
  const [flowState, setFlowState] = useState<'username' | 'primary_auth' | 'evaluating' | 'challenge_gate' | 'final_auth_success' | 'final_auth_blocked'>('username');
  
  // Simulation Control Center States
  const [activeScenario, setActiveScenario] = useState<SecurityScenario>(SECURITY_SCENARIOS[0]);
  const [riskThresholdMed, setRiskThresholdMed] = useState<number>(30);
  const [riskThresholdHigh, setRiskThresholdHigh] = useState<number>(65);
  const [riskThresholdCrit, setRiskThresholdCrit] = useState<number>(85);

  // Enabled methods state (Organization Control)
  const [enabledMethods, setEnabledMethods] = useState({
    deviceBiometrics: true,
    passkey: true,
    authenticator: true,
    emailToken: true,
    smsToken: true,
    hardwareKey: true,
    cameraLiveness: true // Note carefully: camera liveness is OPTIONAL!
  });

  const [requiredMethod, setRequiredMethod] = useState<string>("any_allowed");

  // Chosen Adaptive verification tool during challenge mode
  const [selectedChallengeType, setSelectedChallengeType] = useState<'biometrics' | 'authenticator' | 'emailToken' | 'smsToken' | 'hardwareKey' | 'cameraLiveness' | null>(null);
  const [challengeStep, setChallengeStep] = useState<'choose' | 'active' | 'success' | 'fail'>('choose');

  // Multi-step challenge tracking state variables
  const [totpInput, setTotpInput] = useState<string>("");
  const [emailTokenInput, setEmailTokenInput] = useState<string>("");
  const [deviceBiometricScanning, setDeviceBiometricScanning] = useState<boolean>(false);
  const [hardwareKeyDetected, setHardwareKeyDetected] = useState<boolean>(false);
  
  // Camera simulation variables
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [cameraChallenge, setCameraChallenge] = useState("Align your face within the frame");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Terminal telemetry logs
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Auto-generate verification session state
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`vss_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [sessionId]);

  // Handle Scenario trigger selection change
  const selectScenario = (scenario: SecurityScenario) => {
    setActiveScenario(scenario);
    // Auto reset flow when changing sandbox variables to make reviewing easy
    setFlowState('username');
    setChallengeStep('choose');
    setSelectedChallengeType(null);
    setScanningProgress(0);
  };

  // Run real-time simulation evaluation logs console
  const runEvaluationAnalytics = () => {
    setFlowState('evaluating');
    setIsEvaluating(true);
    setTelemetryLogs([]);

    const logPoints = [
      `[INIT] Launching AAN Trust Framework for session ID ${sessionId}`,
      `[SECURITY] Assessing identifier primary claim: ${username}`,
      `[HARDWARE] Fingerprinting physical canvas: [${activeScenario.signals.deviceReputation.toUpperCase()}]`,
      `[INTEGRITY] Evaluating browser integrity index: ${activeScenario.signals.browserIntegrityIndex}/100`,
      `[LOCATION] Resolving IP location: ${activeScenario.signals.locationMatch.replace('_', ' ').toUpperCase()}`,
      activeScenario.signals.proxyDetected ? `[WARN] Proxy network tunnel or VPN fingerprint observed` : `[NETWORK] Clean residential ISP gateway validated`,
      activeScenario.signals.impossibleTravel ? `[CRITICAL_ALARM] Geo route mismatch: Impossible velocity travel detected` : `[LOCATION] Sequential travel timeline consistent`,
      `[RISK] Running state policy analytics on aggregate evaluation telemetry...`
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
    }, 400);
  };

  const assessRiskOutcome = () => {
    const score = activeScenario.simulatedRiskScore;
    
    // Determine Risk Level Categorization
    if (score >= riskThresholdCrit) {
      setFlowState('final_auth_blocked');
      // Append timeline & audit logs dynamically to AAN DB
      appendActionLog("Critical Risk Authentication Blocked", `Session login attempted by ${username} blocked due to critical risk factors (${score}/100).`, "Suspended");
    } else if (score >= riskThresholdHigh || score >= riskThresholdMed) {
      setFlowState('challenge_gate');
      setChallengeStep('choose');
      // Auto-focus on first enabled option to simplify testing
      const firstEnabled = getFirstEnabledChallenge();
      setSelectedChallengeType(firstEnabled);
    } else {
      // Low Risk - Dynamic Zero Friction bypass!
      setFlowState('final_auth_success');
      appendActionLog("Dynamic Zero-Friction Authentication Approved", `Session login completed instantly by verified user ${username} under normal risk tolerances (${score}/100).`, "Neutral");
    }
  };

  const getFirstEnabledChallenge = (): any => {
    if (enabledMethods.deviceBiometrics) return 'biometrics';
    if (enabledMethods.passkey) return 'hardwareKey';
    if (enabledMethods.authenticator) return 'authenticator';
    if (enabledMethods.emailToken) return 'emailToken';
    if (enabledMethods.smsToken) return 'smsToken';
    if (enabledMethods.cameraLiveness) return 'cameraLiveness';
    return null;
  };

  const appendActionLog = async (event: string, description: string, scoreChange: string) => {
    try {
      await fetch('/api/internal/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: "usr_b710ef67", // bob primary demo
          sessionId: sessionId,
          event,
          description,
          trustScoreChange: scoreChange
        })
      });
    } catch (e) {
      console.warn("Analytics syncing delayed", e);
    }
  };

  // Start optional camera simulation stream
  const startCamera = async () => {
    setCameraBlocked(false);
    setScanningProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 400, height: 400 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("We webcam blocked. Reverting to interactive simulator", err);
      setCameraBlocked(true);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Handlers for dynamic simulator challengers
  const handleDeviceBiometricTrigger = () => {
    setDeviceBiometricScanning(true);
    setTimeout(() => {
      setDeviceBiometricScanning(false);
      setChallengeStep('success');
    }, 1500);
  };

  const handleHardwareKeyTrigger = () => {
    setHardwareKeyDetected(true);
    setTimeout(() => {
      setHardwareKeyDetected(false);
      setChallengeStep('success');
    }, 1200);
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

  // Camera optional pipeline simulations
  useEffect(() => {
    if (selectedChallengeType !== 'cameraLiveness' || challengeStep !== 'active') return;

    let scanTimer: NodeJS.Timeout;
    scanTimer = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanTimer);
          stopCamera();
          setChallengeStep('success');
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    return () => clearInterval(scanTimer);
  }, [selectedChallengeType, challengeStep]);

  const handleStartCameraChallenge = () => {
    setChallengeStep('active');
    startCamera();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 selection:bg-blue-600">
      
      {/* Platform Banner explaining trust architecture */}
      <div className="max-w-7xl mx-auto w-full mb-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900/40 p-2 rounded-lg border border-blue-900/40 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-blue-400 uppercase tracking-wider font-extrabold block">AAN Adaptive Trust Gateway</span>
              <h1 className="font-sans font-bold text-white text-sm">Friction-Mitigated Identity Assurance</h1>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono max-w-md text-right hidden lg:block">
            We analyze <strong className="text-blue-400">12+ hardware & regional telemetry signals</strong> before demanding user checkpoints. Camera verification is optional and only triggered during anomalous risk transitions.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto">
        
        {/* LEFT COLUMN: THE LOGIN EXPERIENCE (LITERAL END-USER VIEWPORT) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden max-w-xl mx-auto w-full">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400" />
            
            {/* STAGE A: ENTER USERNAME AND ACCOUNT CLAIM */}
            {flowState === 'username' && (
              <div className="p-8 space-y-6">
                <div className="text-center space-y-1">
                  <div className="bg-blue-950/40 text-blue-400 w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white font-sans">Enterprise Authentication Portal</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Verify account status on AAN Trust Hub protected clusters. Entering identifiers evaluates continuous signals.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 font-mono text-xs">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Email or Account Claim</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-slate-500">@</span>
                      <input 
                        type="email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded py-3 pl-8 pr-4 text-xs select-all text-slate-200 focus:outline-none focus:border-blue-600 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setFlowState('primary_auth')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Next Factor Check
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE B: ENTER PRIMARY FACTOR LOGINS */}
            {flowState === 'primary_auth' && (
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-white text-base">Select Primary Primary Factor</h3>
                  <p className="text-xs text-slate-400">Organizations require validating primary credentials prior to evaluation.</p>
                </div>

                {/* Approved Tabs for Authenticating factors */}
                <div className="grid grid-cols-4 gap-2 font-mono text-[9px] border-b border-slate-800 pb-3">
                  {[
                    { id: 'passkey', label: 'Passkey', icon: Fingerprint, color: 'text-indigo-400' },
                    { id: 'password', label: 'Password', icon: Key, color: 'text-sky-400' },
                    { id: 'sso', label: 'SSO Key', icon: AppWindow, color: 'text-emerald-400' },
                    { id: 'saml', label: 'ID Provider', icon: Database, color: 'text-amber-400' }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPrimaryMethod(tab.id as any)}
                        className={`py-2 rounded border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                          primaryMethod === tab.id 
                            ? 'bg-blue-600/10 border-blue-600 text-white font-bold' 
                            : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${tab.color}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-1 font-mono text-xs">
                  {primaryMethod === 'password' && (
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 uppercase block font-bold">Secret Password Match</label>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded text-white text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  )}

                  {primaryMethod === 'passkey' && (
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2.5 text-xs text-slate-350 leading-relaxed font-sans">
                        <Fingerprint className="w-5 h-5 text-indigo-400 shrink-0" />
                        <span>FIDO2 / WebAuthn passkey assertion prompt is configured. Touch the biometric sensor or key when prompted.</span>
                      </div>
                    </div>
                  )}

                  {primaryMethod === 'sso' && (
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl leading-relaxed text-xs text-slate-350">
                       Linked SSO Provider: <strong className="text-emerald-400">Sovereign GitHub OAuth Hub</strong> verified.
                    </div>
                  )}

                  {primaryMethod === 'saml' && (
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-slate-350">
                       Enterprise Federated Relay: Okta / Ping Directory assertion linked automatically.
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFlowState('username')}
                      className="w-1/3 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 text-xs py-3 rounded-lg transition-all font-mono"
                    >
                      Back
                    </button>
                    <button 
                      onClick={runEvaluationAnalytics}
                      className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3 rounded-lg transition-all cursor-pointer"
                    >
                      Authenticate Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE C: RUN EVALUATING LOGS TERMINAL (THE INTEL LEVEL) */}
            {flowState === 'evaluating' && (
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                  <h3 className="font-mono text-sm text-slate-200">Processing AAN Multi-Signal Decision...</h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">Evaluating hardware signatures, proxies and travel history statefully.</p>
                </div>

                {/* Futuristic shell console logs */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] text-slate-300 space-y-1.5 h-48 overflow-y-auto selection:bg-blue-800">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5 text-slate-500 font-bold uppercase tracking-wider text-[8px]">
                    <span>AAN TRUST EVALUATOR CONSOLE</span>
                    <span className="text-blue-400">ACTIVE POLLING</span>
                  </div>
                  {telemetryLogs.map((log, lIdx) => (
                    <div key={lIdx} className="leading-relaxed border-l border-slate-800 pl-1.5 text-slate-400 select-all">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE D: ADAPTIVE CHALLENGE GATE (ONLY GATED DURING ELEVATED RISK SIGNALS!) */}
            {flowState === 'challenge_gate' && (
              <div className="p-8 space-y-6">
                {/* Alert warning about Risk */}
                <div className="bg-yellow-950/30 border border-yellow-900/40 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                  <div className="space-y-1">
                    <span className="text-[10px] text-yellow-400 font-mono font-bold uppercase tracking-widest block">Elevated Risk Assertion Detected ({activeScenario.simulatedRiskScore}/100)</span>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      Your primary credentials matched, but security telemetry warrants dynamic validation (IP Proxy proxy node or unrecognized physical device profile).
                    </p>
                  </div>
                </div>

                {/* Adaptive verification options selection */}
                <div className="space-y-4">
                  {challengeStep === 'choose' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-widest block">Choose Adaptive Factor Checklist</span>
                        <p className="text-[11px] text-slate-500 font-sans">AAN policy allows unlocking the cluster via any enabled challenge. Camera is explicitly optional.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                        {enabledMethods.deviceBiometrics && (
                          <button 
                            onClick={() => { setSelectedChallengeType('biometrics'); setChallengeStep('active'); }}
                            className="bg-slate-950 border border-slate-850 hover:bg-slate-850 hover:border-blue-600/40 p-3 rounded-lg text-left transition text-slate-200 cursor-pointer flex items-center gap-2"
                          >
                            <Fingerprint className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span>Touch ID / Face ID</span>
                          </button>
                        )}

                        {enabledMethods.hardwareKey && (
                          <button 
                            onClick={() => { setSelectedChallengeType('hardwareKey'); setChallengeStep('active'); }}
                            className="bg-slate-950 border border-slate-850 hover:bg-slate-850 hover:border-blue-600/40 p-3 rounded-lg text-left transition text-slate-200 cursor-pointer flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                            <span>USB Security Key</span>
                          </button>
                        )}

                        {enabledMethods.authenticator && (
                          <button 
                            onClick={() => { setSelectedChallengeType('authenticator'); setChallengeStep('active'); }}
                            className="bg-slate-950 border border-slate-850 hover:bg-slate-850 hover:border-blue-600/40 p-3 rounded-lg text-left transition text-slate-200 cursor-pointer flex items-center gap-2"
                          >
                            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Google TOTP App</span>
                          </button>
                        )}

                        {enabledMethods.emailToken && (
                          <button 
                            onClick={() => { setSelectedChallengeType('emailToken'); setChallengeStep('active'); }}
                            className="bg-slate-950 border border-slate-850 hover:bg-slate-850 hover:border-blue-600/40 p-3 rounded-lg text-left transition text-slate-200 cursor-pointer flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                            <span>One-Time Email Code</span>
                          </button>
                        )}

                        {enabledMethods.cameraLiveness && (
                          <button 
                            onClick={() => { setSelectedChallengeType('cameraLiveness'); handleStartCameraChallenge(); }}
                            className="bg-slate-950 border border-slate-850 hover:bg-slate-850 hover:border-blue-600/40 p-3 rounded-lg text-left transition text-slate-300 hover:text-white cursor-pointer flex items-center gap-2 font-bold"
                          >
                            <Camera className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
                            <span>Camera Liveness check</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE STATE CHALLENGES CONTENT */}
                  {challengeStep === 'active' && selectedChallengeType === 'biometrics' && (
                    <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4 text-center">
                      <Fingerprint className={`w-14 h-14 mx-auto ${deviceBiometricScanning ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Touch ID / Private Biometrics Check</h4>
                        <p className="text-xs text-slate-400">AAN prompts your platform device to sign a challenge assertion.</p>
                      </div>
                      
                      <button 
                        onClick={handleDeviceBiometricTrigger}
                        className="bg-blue-600 hover:bg-blue-500 text-xs px-5 py-2 rounded text-white font-mono transition cursor-pointer"
                      >
                        {deviceBiometricScanning ? "Polling Device..." : "Simulate Biometric Consent Touch"}
                      </button>
                    </div>
                  )}

                  {challengeStep === 'active' && selectedChallengeType === 'hardwareKey' && (
                    <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4 text-center">
                      <Shield className={`w-12 h-12 mx-auto ${hardwareKeyDetected ? 'text-indigo-400 animate-bounce' : 'text-slate-400'}`} />
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-white">FIDO2 Hardware Key Verification</h4>
                        <p className="text-xs text-slate-405">Insert and touch your hardware security key token.</p>
                      </div>

                      <button 
                        onClick={handleHardwareKeyTrigger}
                        className="bg-blue-600 hover:bg-blue-500 text-xs px-5 py-2 rounded text-white font-mono transition cursor-pointer"
                      >
                        {hardwareKeyDetected ? "Authenticating WebAuthn Key Token..." : "Simulate Touch Hardware Token"}
                      </button>
                    </div>
                  )}

                  {challengeStep === 'active' && selectedChallengeType === 'authenticator' && (
                    <form onSubmit={submitTotpChallenge} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4 text-center max-w-sm mx-auto">
                      <Smartphone className="w-10 h-10 mx-auto text-emerald-400" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Google Authenticator TOTP</h4>
                        <p className="text-xs text-slate-450">Type the continuously shifting 6-digit credential.</p>
                      </div>

                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000 000"
                        value={totpInput}
                        onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                        className="bg-slate-900 border border-slate-800 text-center font-mono text-lg py-2 rounded w-40 text-emerald-400 focus:outline-none focus:border-emerald-500"
                        required
                      />

                      <div className="pt-2">
                        <button 
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-500 text-xs px-5 py-2 rounded text-white font-mono tracking-wider"
                        >
                          Verify TOTP Token
                        </button>
                      </div>
                    </form>
                  )}

                  {challengeStep === 'active' && selectedChallengeType === 'emailToken' && (
                    <form onSubmit={submitEmailTokenChallenge} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4 text-center max-w-sm mx-auto">
                      <Mail className="w-10 h-10 mx-auto text-blue-400" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">One-Time Security OTP Code</h4>
                        <p className="text-xs text-slate-450">We dispatched code to <b>{username}</b>.</p>
                      </div>

                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Secret Code"
                        value={emailTokenInput}
                        onChange={(e) => setEmailTokenInput(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-center font-mono text-xs py-2 rounded w-48 text-white focus:outline-none focus:border-blue-500"
                        required
                      />

                      <div className="pt-2">
                        <button 
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-500 text-xs px-5 py-2 p-1 text-white font-mono"
                        >
                          Confirm OTP Login
                        </button>
                      </div>
                    </form>
                  )}

                  {challengeStep === 'active' && selectedChallengeType === 'cameraLiveness' && (
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4">
                      <div className="text-center font-mono text-[9px] uppercase tracking-widest text-[8px] text-blue-400">
                        OPTIONAL FACE METRICS CONFIDENCE CHECK
                      </div>
                      
                      {/* Webcam scan guide circle */}
                      <div className="relative w-44 h-44 mx-auto rounded-full border-2 border-slate-800 overflow-hidden bg-black shadow-inner">
                        <div className="absolute inset-0 border border-dashed border-blue-500/20 rounded-full animate-pulse pointer-events-none" />
                        <div className="absolute left-0 w-full h-0.5 bg-blue-500 top-0 animate-[bounce_4s_infinite] pointer-events-none z-10" />

                        {cameraActive && !cameraBlocked ? (
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover rounded-full scale-x-[-1]"
                            muted
                            playsInline
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-center p-3 select-none">
                            <Cpu className="w-8 h-8 text-blue-500/60 animate-pulse mb-1" />
                            <span className="text-[8px] text-slate-500 font-mono uppercase">Feed Initializing</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 max-w-xs mx-auto">
                        <div className="flex justify-between font-mono text-[8px] text-slate-500">
                          <span>MATRIX EVALUATION:</span>
                          <span>{scanningProgress}% Complete</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                          <div className="bg-blue-500 h-full rounded" style={{ width: `${scanningProgress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {challengeStep === 'success' && (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 p-6 rounded-xl text-center space-y-4">
                      <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-emerald-400">Factor Validation Approved</h4>
                        <p className="text-xs text-slate-350">The selected factor successfully verified your returning human signature.</p>
                      </div>

                      <button 
                        onClick={completeAdaptiveAuthFlow}
                        className="bg-blue-600 hover:bg-blue-500 text-xs px-5 py-2.5 rounded text-white font-medium transition cursor-pointer"
                      >
                        Navigate to Portal Access
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-850">
                    <button 
                      onClick={() => { setFlowState('primary_auth'); setSelectedChallengeType(null); }}
                      className="text-slate-500 hover:text-slate-350 font-mono"
                    >
                       Restart Login
                    </button>

                    {challengeStep !== 'choose' && challengeStep !== 'success' && (
                      <button 
                        onClick={() => { setChallengeStep('choose'); stopCamera(); }}
                        className="text-blue-400 hover:text-blue-300 font-mono"
                      >
                         Choose different factor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STAGE E: AUTHENTICATION FINALIZED SUCCESS */}
            {flowState === 'final_auth_success' && (
              <div className="p-8 space-y-6 text-center">
                <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                
                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">AUTHENTICATION VALID</span>
                  <h2 className="text-xl font-bold font-sans text-white">Trust Assured. Welcome Back.</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    AAN evaluated continuous signals to securely authenticate <strong className="text-white select-all">{username}</strong>. Adaptive evaluation mitigated unnecessary friction.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-left font-mono text-[10px] space-y-2 select-all">
                  <div className="flex justify-between text-slate-500 text-[9px] uppercase font-bold border-b border-slate-900 pb-1">
                    <span>SECURITY PROOF ATTESTATION</span>
                    <span className="text-emerald-400">PASSED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Claim:</span>
                    <span className="text-slate-300">{username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mitigation Risk Score:</span>
                    <span className="text-emerald-400 font-bold">{activeScenario.simulatedRiskScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Challenge Factor Applied:</span>
                    <span className="text-blue-400 uppercase font-bold">{selectedChallengeType || "NONE (LOW_RISK_BYPASS)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ephemeral Session Key:</span>
                    <span className="text-slate-450 truncate max-w-[150px]">{sessionId}</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => { setFlowState('username'); setSelectedChallengeType(null); }}
                    className="w-1/2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 font-mono text-xs py-2.5 rounded-lg transition"
                  >
                    Login Another Account
                  </button>
                  <button 
                    onClick={onComplete}
                    className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs py-2.5 rounded-lg transition cursor-pointer"
                  >
                    Return to Portal
                  </button>
                </div>
              </div>
            )}

            {/* STAGE F: AUTHENTICATION FINALIZED BLOCKED */}
            {flowState === 'final_auth_blocked' && (
              <div className="p-8 space-y-6 text-center animate-pulse">
                <div className="bg-red-950 border border-red-800 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-red-400 font-extrabold uppercase tracking-widest block">MALICIOUS SIGNATURE BLOCKED</span>
                  <h2 className="text-lg font-bold text-white font-sans">Access Request Terminated</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    AAN's risk engine registered a critical threat scoring <strong className="text-red-400">{activeScenario.simulatedRiskScore}/100</strong>. Active proxy tunnels or browser emulators violated policy templates.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-left font-mono text-[10px] space-y-1.5 text-slate-400">
                  <div className="text-slate-500 font-bold uppercase text-[9px] border-b border-slate-900 pb-1 mb-1">AUTOMATED INCIDENT TRIGGER</div>
                  <div>• Claim: {username}</div>
                  <div>• Indicators: Emulator Framework Active</div>
                  <div>• Geography: Impossible travel location mismatch</div>
                  <div>• Outcome: Hardware key revoke; IP addresses shadowlisted</div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setFlowState('username')}
                    className="w-full bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 font-mono text-xs py-2.5 rounded-lg transition"
                  >
                     Restart Gateway Evaluation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RECONFIGURABLE GATEWAY DECISION CONTROLLER */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Controls: Threat Multi-Preset simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wide">Threat Simulation Presets</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Toggle live client signals to review how the AAN engine adapts verified challenge paths instantaneously.</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {SECURITY_SCENARIOS.map((scen) => {
                const isActive = activeScenario.id === scen.id;
                return (
                  <button
                    key={scen.id}
                    onClick={() => selectScenario(scen)}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all flex justify-between items-start cursor-pointer ${
                      isActive 
                        ? 'bg-slate-950 border-blue-600 shadow-lg' 
                        : 'bg-slate-900 border-slate-850 hover:bg-slate-950/40'
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
                      <p className="text-[10px] text-slate-400 select-none normal-case leading-snug">{scen.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold block leading-none">Risk</span>
                      <span className={`text-base font-black ${
                        scen.simulatedRiskScore < 25 ? 'text-emerald-400' :
                        scen.simulatedRiskScore < 65 ? 'text-yellow-400' : 'text-red-400'
                      }`}>{scen.simulatedRiskScore}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Institutional Policy Toggles */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
            <div>
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wide">Organization Controls</h3>
              </div>
              <p className="text-[11px] text-slate-450 font-mono mt-0.5">Define allowed verification factor methods. Camera is explicitly optional.</p>
            </div>

            {/* Allowed Checklist */}
            <div className="space-y-3">
              <span className="text-[9px] text-slate-500 uppercase font-bold block border-b border-slate-850 pb-1">Enabled Verification Factors</span>
              
              <div className="grid grid-cols-2 gap-2.5 text-[10px]">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.deviceBiometrics}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, deviceBiometrics: e.target.checked })}
                    className="accent-indigo-500"
                  />
                  <span>Touch/Face ID</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.hardwareKey}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, hardwareKey: e.target.checked })}
                    className="accent-sky-500"
                  />
                  <span>FIDO2 Keys</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.authenticator}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, authenticator: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Google TOTP</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.emailToken}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, emailToken: e.target.checked })}
                    className="accent-blue-500"
                  />
                  <span>Email Access</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none col-span-2 border-t border-slate-850 pt-1.5 mt-1">
                  <input 
                    type="checkbox" 
                    checked={enabledMethods.cameraLiveness}
                    onChange={(e) => setEnabledMethods({ ...enabledMethods, cameraLiveness: e.target.checked })}
                    className="accent-purple-500"
                  />
                  <span className="font-bold text-white flex items-center gap-1.5">
                    Camera Liveness check <span className="bg-purple-950 text-purple-400 font-mono text-[8px] px-1 py-0.2 rounded border border-purple-900">OPTIONAL</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Configurable Risk Thresholds dial */}
            <div className="space-y-2 border-t border-slate-850 pt-3">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">Configurable Risk Thresholds</span>
              
              <div className="space-y-2 text-[10px] text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Medium Risk (Start Challenge):</span>
                  <span className="text-yellow-400 font-bold">{riskThresholdMed}%</span>
                </div>
                <input 
                  type="range" 
                  min={10} 
                  max={50} 
                  value={riskThresholdMed} 
                  onChange={(e) => setRiskThresholdMed(Number(e.target.value))}
                  className="w-full h-1 accent-yellow-500 bg-slate-905 rounded" 
                />

                <div className="flex justify-between items-center">
                  <span>High Risk (Stricter Challenges):</span>
                  <span className="text-red-400 font-bold">{riskThresholdHigh}%</span>
                </div>
                <input 
                  type="range" 
                  min={51} 
                  max={80} 
                  value={riskThresholdHigh} 
                  onChange={(e) => setRiskThresholdHigh(Number(e.target.value))}
                  className="w-full h-1 accent-red-400 bg-slate-905 rounded" 
                />

                <div className="flex justify-between items-center">
                  <span>Critical Risk (Force Shutdown):</span>
                  <span className="text-red-600 font-bold">{riskThresholdCrit}%</span>
                </div>
                <input 
                  type="range" 
                  min={81} 
                  max={99} 
                  value={riskThresholdCrit} 
                  onChange={(e) => setRiskThresholdCrit(Number(e.target.value))}
                  className="w-full h-1 accent-red-600 bg-slate-905 rounded" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floater footer compliance note */}
      <div className="text-center mt-8 text-[10px] text-slate-500 max-w-lg mx-auto leading-relaxed">
        <span className="text-slate-400">Compliance Assurance Audit:</span> Custom policies execute transparently. Camera based face scan is never mandatory and is treated strictly as an isolated, optional security factor under CCPA guidelines.
      </div>
    </div>
  );
}
