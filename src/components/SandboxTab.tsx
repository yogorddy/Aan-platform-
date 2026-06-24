import React, { useState } from "react";
import { 
  Users, UserPlus, Play, AlertOctagon, ShieldAlert, Sparkles, Terminal, BookOpen, 
  CheckCircle2, Lock, ArrowUpRight, Zap, Copy, Check, BarChart, HardDrive
} from "lucide-react";

interface SandboxTabProps {
  onAddAuditLog: (action: string, entity: string, status: string, detail: string) => void;
}

export default function SandboxTab({ onAddAuditLog }: SandboxTabProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Simulated State Engine
  const [simulatedUsers, setSimulatedUsers] = useState<any[]>([
    { id: "usr_sb_01", alias: "Alice Coleman", status: "verified", risk: "low", score: 8, device: "iPhone 15 iOS" },
    { id: "usr_sb_02", alias: "Sybil Bot Machine #9", status: "rejected", risk: "critical", score: 98, device: "Emulator Chrome Headless" },
    { id: "usr_sb_03", alias: "Returning Bob", status: "passed", risk: "medium", score: 45, device: "Pixel 7 Pro Android" }
  ]);

  const [simName, setSimName] = useState("");
  const [simRisk, setSimRisk] = useState<"low" | "medium" | "critical">("low");
  const [simDevice, setSimDevice] = useState("Chrome Windows Desktop");
  
  // Integration simulation outputs
  const [webhookLogs, setWebhookLogs] = useState<any[]>([
    { id: "wh_sb_0", status: "delivered (200)", event: "aan.verification.completed", user: "usr_sb_01", time: "Just now" }
  ]);
  const [activeJwtToDecode, setActiveJwtToDecode] = useState("");
  const [decodedClaims, setDecodedClaims] = useState<any>(null);

  const handleCreateSimUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;

    const scores = { low: 12, medium: 48, critical: 92 };
    const statuses = { low: "verified", medium: "passed", critical: "rejected" };
    
    const newUser = {
      id: "usr_sb_" + Math.random().toString(36).substring(2, 8),
      alias: simName,
      status: statuses[simRisk],
      risk: simRisk,
      score: scores[simRisk],
      device: simDevice
    };

    setSimulatedUsers([newUser, ...simulatedUsers]);
    setSimName("");
    
    // Log in internal audit
    onAddAuditLog(
      "SIMULATED_USER_CREATED",
      newUser.id,
      "success",
      `Sandbox: Provisioned simulated target "${newUser.alias}" under "${newUser.risk}" risk profile.`
    );
  };

  const simulateDuplicateAttempt = () => {
    // Inject duplicate template hash warning
    const alarmUser = {
      id: "usr_sb_dup_alarm",
      alias: "Duplicate Person Attempt",
      status: "rejected",
      risk: "critical",
      score: 99,
      device: "Desktop Safari 17"
    };

    setSimulatedUsers([alarmUser, ...simulatedUsers]);
    onAddAuditLog(
      "DUPLICATE_IDENTITY_DETECTED",
      alarmUser.id,
      "failed",
      "Sandbox Warning: Biometric twin signature match detected on global decentralized registry."
    );
    // Silent safe log to avoid blocking alerts inside iframes
    console.log("Sandbox Simulation Alert: Cryptographic replica match detected safely!");
  };

  const simulateElevatedRisk = () => {
    const riskUser = {
      id: "usr_sb_elevated",
      alias: "Suspicious Rapid Signups",
      status: "verification_required",
      risk: "critical",
      score: 87,
      device: "Linux / Tor Proxy Proxy"
    };
    setSimulatedUsers([riskUser, ...simulatedUsers]);
    onAddAuditLog(
      "ELEVATED_RISK_SURGED",
      riskUser.id,
      "warning",
      "Sandbox Security Engine: High velocity signups observed from same hardware footprint routing."
    );
  };

  const triggerMockWebhook = (userAlias: string, eventType: string) => {
    const whEntry = {
      id: "wh_sb_" + Date.now().toString().slice(-4),
      status: "delivered (200)",
      event: eventType,
      user: userAlias,
      time: "Just now"
    };
    setWebhookLogs([whEntry, ...webhookLogs]);
    onAddAuditLog(
      "WEBHOOK_FIRED",
      whEntry.id,
      "success",
      `Sandbox Pipeline: Dispatched "${whEntry.event}" payload regarding simulated subject: ${userAlias}.`
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const decodeJwtClaimsSim = () => {
    if (!activeJwtToDecode.trim()) {
      setDecodedClaims({
        valid: false,
        error: "Missing Token: Please paste a valid signed JWT proof token first."
      });
      return;
    }
    
    try {
      // Decode simulated token block
      const parts = activeJwtToDecode.split(".");
      if (parts.length >= 2) {
        const decodedString = atob(parts[1]);
        setDecodedClaims(JSON.parse(decodedString));
      } else {
        // Mock fallback if user provides alternative string
        setDecodedClaims({
          valid: true,
          error: "Simulated validation success",
          parsed_claims: {
            organization_id: "org_enterprise_999",
            partner_user_id: "customer_decoded_9a",
            risk_level: "low",
            issued_at: new Date().toISOString()
          }
        });
      }
    } catch(err) {
      setDecodedClaims({
        valid: false,
        error: "Cryptographic parsing error: Format must represent standard base64 blocks."
      });
    }
  };

  return (
    <div className="space-y-6 text-slate-300 font-sans text-left relative">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1b1e28] pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-450 font-black bg-[#111319]/80 px-2.5 py-0.5 border border-[#1b1e28] rounded flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Isolated Sandbox Environment
          </span>
          <h2 className="text-xl font-mono tracking-tight font-extrabold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-rose-400" />
            AAN Simulated Playground
          </h2>
          <p className="text-xs text-[#78819a] max-w-2xl leading-relaxed">
            Manipulate security triggers, trigger sybil duplicates, and review webhooks in a fully static playground context without affecting your live production user directories.
          </p>
        </div>

        <span className="text-[10px] font-mono font-black text-rose-400 border border-[#1b1e28] px-3 py-1 bg-[#111319] rounded">
          Sandbox Stage Active
        </span>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive panel (7 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* User simulation creator */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-4">
            <h3 className="font-mono text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-400" />
              Provision simulated environment users
            </h3>

            <form onSubmit={handleCreateSimUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-[#78819a] uppercase font-bold">Simulated Target human Name</label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-2.5 py-1.5 text-xs text-slate-205 font-mono focus:outline-none placeholder-slate-655"
                  placeholder="e.g. Charlie Jenkins"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-[#78819a] uppercase font-bold">Risk profile mapping</label>
                <select
                  value={simRisk}
                  onChange={(e) => setSimRisk(e.target.value as any)}
                  className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-2.5 py-1.5 text-xs text-slate-205 font-mono focus:outline-none"
                >
                  <option value="low">Low Risk Profile (Passed)</option>
                  <option value="medium">Medium Risk Profile (Needs Check)</option>
                  <option value="critical">Critical Risk Profile (Auto Blocked)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-[#78819a] uppercase font-bold">Browser / OS Device footprint</label>
                <input
                  type="text"
                  value={simDevice}
                  onChange={(e) => setSimDevice(e.target.value)}
                  className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded px-2.5 py-1.5 text-xs text-slate-205 font-mono focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 pt-2 text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all flex items-center gap-1 w-full sm:w-auto"
                >
                  Create Mock Entity
                </button>
              </div>
            </form>
          </div>

          {/* Sandbox Controls console */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-4">
            <h3 className="font-mono text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-rose-400" />
              Sandbox Security Trigger Simulators
            </h3>
            <p className="text-xs text-[#78819a] leading-normal">
              Inject anomalous behavior vectors into the sandbox registry to assert how your integration logic enforces security steps.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={simulateDuplicateAttempt}
                className="p-4 rounded-xl border border-red-900/30 bg-red-950/15 hover:bg-red-950/20 text-left transition-all cursor-pointer group"
              >
                <span className="font-mono text-[10px] uppercase font-black text-red-400 block mb-1">Simulate Sybil Replica Attack</span>
                <p className="text-[11px] text-[#78819a] font-sans leading-normal group-hover:text-slate-300">
                  Submits face signature matches already stored inside AAN vault registries to trigger duplication alarms.
                </p>
              </button>

              <button
                onClick={simulateElevatedRisk}
                className="p-4 rounded-xl border border-orange-900/30 bg-orange-950/15 hover:bg-orange-950/20 text-left transition-all cursor-pointer group"
              >
                <span className="font-mono text-[10px] uppercase font-black text-orange-400 block mb-1">Simulate Elevated Risk Surge</span>
                <p className="text-[11px] text-[#78819a] font-sans leading-normal group-hover:text-slate-300">
                  Triggers rate-limit bursts, device emulator footprints, and proxy routing alerts simultaneously.
                </p>
              </button>
            </div>
          </div>

          {/* Token decrypt parsing tool */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-5 space-y-4 text-left">
            <h3 className="font-mono text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              Signed JWT proof Decrypt Claims validation tool
            </h3>
            
            <div className="space-y-2">
              <textarea
                value={activeJwtToDecode}
                onChange={(e) => setActiveJwtToDecode(e.target.value)}
                placeholder="Paste AAN proof JWT signature block to decode..."
                rows={3}
                className="w-full bg-[#0d0e12] border border-[#1b1e28] rounded font-mono text-[11px] p-2.5 text-slate-305 focus:outline-none placeholder-slate-700"
              />
              <div className="text-right">
                <button
                  onClick={decodeJwtClaimsSim}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all"
                >
                  Decode JWT Claims
                </button>
              </div>
            </div>

            {decodedClaims && (
              <div className="bg-[#0d0e12] border border-[#1b1e28] rounded-lg overflow-hidden font-mono text-[10px]">
                <div className="bg-[#111319] px-3 py-1 flex justify-between items-center text-[#78819a] font-bold uppercase">
                  <span>Decoded Verdict Claims Mapping</span>
                  <span className={`text-[8px] px-1.5 py-0.2 select-none border rounded ${decodedClaims.valid !== false ? "text-emerald-400 border-emerald-900/50" : "text-rose-400 border-rose-900/50"}`}>
                    {decodedClaims.valid !== false ? " Valid Signature Claims" : " Authentication Failed"}
                  </span>
                </div>
                <pre className="p-3.5 text-blue-300 overflow-x-auto whitespace-pre">
                  {JSON.stringify(decodedClaims, null, 2)}
                </pre>
              </div>
            )}
          </div>

        </div>

        {/* Right Sandbox ledger tracker (4 columns) */}
        <div className="lg:col-span-4 space-y-4 text-left font-mono">
          
          {/* Active Sandbox registry users list */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 space-y-3.5">
            <h4 className="text-[10px] font-mono font-black text-[#78819a] uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              Simulated entity registry
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
              {simulatedUsers.map((u) => (
                <div key={u.id} className="p-2.5 bg-[#0d0e12] border border-[#1b1e28] rounded text-[10px] leading-relaxed flex flex-col justify-between">
                  <div className="flex justify-between items-center pb-1 border-b border-[#1b1e28]">
                    <span className="text-white font-bold">{u.alias}</span>
                    <span className={`text-[9px] font-black uppercase ${u.risk === "low" ? "text-emerald-400" : u.risk === "medium" ? "text-amber-400" : "text-red-400"}`}>
                      {u.risk} Risk
                    </span>
                  </div>
                  <div className="pt-1.5 flex justify-between items-center gap-2">
                    <span className="text-[#5d6780] text-[9px] truncate max-w-[120px]" title={u.device}>{u.device}</span>
                    
                    <button
                      onClick={() => triggerMockWebhook(u.alias, "aan.verification.completed")}
                      className="text-blue-400 hover:text-white hover:underline uppercase text-[8px] font-bold cursor-pointer"
                    >
                      Trigger WH Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sandbox Wh deliverables logs container */}
          <div className="bg-[#111319] border border-[#1b1e28] rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] font-mono font-black text-[#78819a] uppercase tracking-widest flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-rose-450" />
              Simulated Webhook Gate deliverables
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {webhookLogs.length === 0 ? (
                <span className="text-slate-655 text-[10px] block py-4 text-center">(No webhook fired yet)</span>
              ) : (
                webhookLogs.map((l) => (
                  <div key={l.id} className="p-2 bg-[#0d0e12] border border-[#1b1e28] rounded text-[9px]">
                    <div className="flex justify-between text-[#5d6780] font-bold mb-0.5">
                      <span className="text-slate-455 text-[10px] truncate">{l.event}</span>
                      <span className="text-emerald-405">{l.status}</span>
                    </div>
                    <div className="text-[#5d6780]">
                      Subject: <span className="text-white">{l.user}</span> • {l.time}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
