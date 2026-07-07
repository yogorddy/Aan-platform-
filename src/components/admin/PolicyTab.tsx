import React, { useState } from 'react';
import { LibraryPolicy, PolicyVersion, initialPolicyLibrary, policyVersions } from './AdminMockData';
import { 
  Plus, Sliders, Play, Sparkles, RefreshCw, GitBranch, Shield, ToggleLeft, ToggleRight, Trash2, SlidersHorizontal, CheckSquare, CheckCircle, Info, ChevronRight, AlertCircle
} from 'lucide-react';

interface PolicyTabProps {
  compactMode: boolean;
  role: string;
  onLogAudit: (action: string, targetType: string, targetId: string, metadata: any) => void;
}

export default function PolicyTab({ compactMode, role, onLogAudit }: PolicyTabProps) {
  // Built-in Library State
  const [library, setLibrary] = useState<LibraryPolicy[]>(initialPolicyLibrary);
  const [versions, setVersions] = useState<PolicyVersion[]>(policyVersions);
  const [selectedVersionToCompare, setSelectedVersionToCompare] = useState<PolicyVersion | null>(null);

  // Visual Builder States
  const [whenField, setWhenField] = useState<string>('device_trust');
  const [operator, setOperator] = useState<string>('<');
  const [value, setValue] = useState<string>('40');
  const [thenAction, setThenAction] = useState<string>('suspend');
  const [activeVisualRules, setActiveVisualRules] = useState<any[]>([
    { id: 'v-1', when: 'Device Fingerprint Reputation', operator: '<', value: '45', then: 'Demand Human Challenge' },
    { id: 'v-2', when: 'Behavior Anomaly Score', operator: '>', value: '80', then: 'Suspend Active Session' }
  ]);

  // Simulator States
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any | null>({
    tested: '18,492,833',
    blocked: '12,493',
    challenged: '2,013',
    falsePositives: '0.04%',
    impact: 'Negligible (<1.4ms)',
    status: 'Safe To Deploy'
  });

  // AI Assistant States
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');
  const [aiOutputRule, setAiOutputRule] = useState<any | null>(null);
  const [aiCompiling, setAiCompiling] = useState<boolean>(false);

  // Handle Visual Rule Creation
  const handleAddVisualRule = () => {
    if (role === 'read-only' || role === 'auditor') {
      alert("Role Permission Restricted: Read-only accounts cannot deploy security policies.");
      return;
    }
    const whenLabel = whenField === 'device_trust' ? 'Device Trust Score' : whenField === 'vpn' ? 'VPN Proxy' : whenField === 'behavior' ? 'Behavior Risk' : 'Requests Velocity';
    const newRule = {
      id: 'v-' + Date.now(),
      when: whenLabel,
      operator,
      value,
      then: thenAction === 'suspend' ? 'Suspend Session' : thenAction === 'challenge' ? 'Demand Human Challenge' : 'Dispatch Alert Log'
    };
    setActiveVisualRules(prev => [...prev, newRule]);
    onLogAudit('policy.create', 'security_policy', newRule.id, { when: whenLabel, operator, value, then: thenAction });
  };

  const handleDeleteVisualRule = (id: string) => {
    if (role === 'read-only' || role === 'auditor') {
      alert("Role Permission Restricted: Read-only accounts cannot deploy security policies.");
      return;
    }
    setActiveVisualRules(prev => prev.filter(r => r.id !== id));
    onLogAudit('policy.delete', 'security_policy', id, {});
  };

  // Run Simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    onLogAudit('policy.simulate', 'simulation_cluster', 'historic_tests', {});
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult({
        tested: '18,492,833',
        blocked: Math.floor(10000 + Math.random() * 5000).toLocaleString(),
        challenged: Math.floor(1500 + Math.random() * 1000).toLocaleString(),
        falsePositives: (0.01 + Math.random() * 0.05).toFixed(2) + '%',
        impact: 'Negligible (<1.2ms)',
        status: 'Safe To Deploy'
      });
    }, 1500);
  };

  // Translate AI prompt
  const handleAiCompile = () => {
    if (!naturalLanguageInput.trim()) return;
    setAiCompiling(true);
    setAiOutputRule(null);
    setTimeout(() => {
      setAiCompiling(false);
      let parsedRule = {
        when: 'Device Fingerprint creates 5+ Accounts within 20 minutes',
        then: 'Suspend & Require Human Verification',
        metadata: 'Rule compiled safely with 0% logic overlap warnings.'
      };
      if (naturalLanguageInput.toLowerCase().includes('vpn') || naturalLanguageInput.toLowerCase().includes('proxy')) {
        parsedRule = {
          when: 'VPN / Proxy check fails AND Trust Score < 65',
          then: 'Require Biometric Hardware Challenge',
          metadata: 'Identified Proxy bypass criteria safely. Ready for evaluation.'
        };
      } else if (naturalLanguageInput.toLowerCase().includes('unusual') || naturalLanguageInput.toLowerCase().includes('anomaly')) {
        parsedRule = {
          when: 'Behavior Anomaly Score rises above 80',
          then: 'Enforce Session Rate-Limit and Notify Partner',
          metadata: 'Continuous interaction telemetry matching deployed.'
        };
      }
      setAiOutputRule(parsedRule);
      onLogAudit('policy.ai_compile', 'ai_assistant', 'nlp_compiler', { input: naturalLanguageInput });
    }, 1200);
  };

  // Toggle library policies
  const toggleLibraryPolicy = (id: string) => {
    if (role === 'read-only' || role === 'auditor') {
      alert("Role Permission Restricted: Read-only accounts cannot toggle live policies.");
      return;
    }
    setLibrary(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.enabled;
        onLogAudit('policy.toggle_library', 'library_policy', p.name, { enabled: nextState });
        return { ...p, enabled: nextState, mode: nextState ? 'Strict' : 'Disabled' };
      }
      return p;
    }));
  };

  // Change library mode
  const changeLibraryMode = (id: string, mode: 'Strict' | 'Learning' | 'Disabled') => {
    if (role === 'read-only' || role === 'auditor') {
      alert("Role Permission Restricted: Read-only accounts cannot adjust active policy modes.");
      return;
    }
    setLibrary(prev => prev.map(p => {
      if (p.id === id) {
        onLogAudit('policy.mode_change', 'library_policy', p.name, { previous_mode: p.mode, next_mode: mode });
        return { ...p, mode, enabled: mode !== 'Disabled' };
      }
      return p;
    }));
  };

  const handleRollback = (versionCode: string) => {
    if (role === 'read-only' || role === 'auditor') {
      alert("Role Permission Restricted: Read-only accounts cannot deploy rollbacks.");
      return;
    }
    if (!confirm(`Are you sure you want to rollback core policy configuration cluster to version ${versionCode}? Current custom policies will be archived.`)) return;
    onLogAudit('policy.rollback', 'version_control', versionCode, { rollback_by: role });
    alert(`Successfully rolled back and redeployed policy state ${versionCode} to the cluster.`);
  };

  return (
    <div className={`space-y-8 animate-[fadeIn_0.2s_ease-out]`}>
      
      {/* Visual Policy Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 1. Drag-and-Select Builder panel */}
        <div className="lg:col-span-2 bg-[#08090c] border border-white/[0.04] p-5 rounded-2xl space-y-5">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#00E676]" />
              Visual Defense Rule Builder
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Deploy evaluated trust policy variables processed during real-time identity verification and session authorization.
            </p>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/[0.03] space-y-4 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-slate-500 uppercase font-bold text-[10px]">WHEN</span>
              
              <select
                value={whenField}
                onChange={(e) => setWhenField(e.target.value)}
                className="bg-[#050507] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white cursor-pointer focus:outline-none"
              >
                <option value="device_trust">Device Trust Score</option>
                <option value="vpn">VPN proxy Tunnel</option>
                <option value="behavior">Behavior Risk Score</option>
                <option value="velocity">Velocity (20 min window)</option>
              </select>

              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="bg-[#050507] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white cursor-pointer focus:outline-none"
              >
                <option value="<">is Less Than (&lt;)</option>
                <option value=">">is Greater Than (&gt;)</option>
                <option value="==" font-bold>Equals (==)</option>
                <option value="is_detected">is Detected</option>
              </select>

              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-[#050507] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white w-20 text-center focus:outline-none"
              />

              <span className="text-slate-500 uppercase font-bold text-[10px]">THEN</span>

              <select
                value={thenAction}
                onChange={(e) => setThenAction(e.target.value)}
                className="bg-[#050507] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white cursor-pointer focus:outline-none"
              >
                <option value="suspend">Suspend Active Session</option>
                <option value="challenge">Demand Human Challenge</option>
                <option value="flag">Dispatch Alert Log / Flag</option>
              </select>

              <button
                onClick={handleAddVisualRule}
                className="bg-[#00E676] hover:bg-[#00c867] text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0 ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Deploy Rule</span>
              </button>
            </div>
          </div>

          {/* Active Custom Rules Queue */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Active Deployed Custom Policies</span>
            <div className="space-y-2 font-mono text-xs">
              {activeVisualRules.map((rule) => (
                <div key={rule.id} className="bg-black/20 border border-white/[0.02] p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">WHEN</span>
                    <span className="text-white font-medium">{rule.when}</span>
                    <span className="text-slate-500">{rule.operator}</span>
                    <span className="text-white font-medium">{rule.value}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-rose-400 font-bold uppercase text-[10px]">{rule.then}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteVisualRule(rule.id)}
                    className="text-slate-600 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 2. AI Policy Assistant panel */}
        <div className="bg-[#08090c] border border-white/[0.04] p-5 rounded-2xl space-y-4">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              AI Natural Policy Compiler
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Translate plain human security directives instantly into verifiable zero-knowledge criteria.</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <textarea
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder="e.g. Block users creating more than five accounts from one device within twenty minutes..."
              rows={3}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]/40"
            />
            
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setNaturalLanguageInput("Block users creating more than five accounts from one device within twenty minutes.")}
                className="bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-[9px] text-slate-400 px-2 py-1 rounded cursor-pointer"
              >
                Multi-Account Bot Limit
              </button>
              <button
                onClick={() => setNaturalLanguageInput("Require MFA if threat score rises above 75 and VPN is active.")}
                className="bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-[9px] text-slate-400 px-2 py-1 rounded cursor-pointer"
              >
                Proxy Risk Escalation
              </button>
            </div>

            <button
              onClick={handleAiCompile}
              disabled={aiCompiling || !naturalLanguageInput.trim()}
              className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {aiCompiling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00E676]" />
                  <span>AI Compiling Logic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Compile Executable Policy</span>
                </>
              )}
            </button>

            {aiOutputRule && (
              <div className="p-3.5 bg-emerald-950/10 border border-[#00E676]/30 rounded-xl space-y-2 animate-[fadeIn_0.15s_ease-out]">
                <div className="flex items-center gap-1 text-[#00E676] font-bold text-[10px]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>AI COMPILED SUCCESS</span>
                </div>
                <div className="text-[11px] space-y-1">
                  <span className="text-slate-400 block font-bold">WHEN:</span>
                  <p className="text-white">{aiOutputRule.when}</p>
                  <span className="text-slate-400 block font-bold mt-1">THEN:</span>
                  <p className="text-rose-400 font-bold">{aiOutputRule.then}</p>
                </div>
                <p className="text-[9px] text-slate-500 italic mt-1">{aiOutputRule.metadata}</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Policy Simulation panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Built-in policy library (col span 2) */}
        <div className="lg:col-span-2 bg-[#08090c] border border-white/[0.04] p-5 rounded-2xl space-y-4">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#00E676]" />
              Enterprise Defensive Policies Library
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Select, configure, and override built-in platform trust and Sybil protections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
            {library.map((policy) => (
              <div key={policy.id} className="bg-black/20 border border-white/[0.03] p-3.5 rounded-xl space-y-3 font-mono text-xs flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">{policy.category}</span>
                    
                    {/* Toggle Switch Button */}
                    <button
                      onClick={() => toggleLibraryPolicy(policy.id)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      {policy.enabled ? (
                        <ToggleRight className="w-5 h-5 text-[#00E676]" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <h4 className="text-white font-bold leading-tight">{policy.name}</h4>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{policy.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.03] pt-2 mt-2 gap-2">
                  {/* Mode Dropdown Selector */}
                  <select
                    value={policy.mode}
                    onChange={(e) => changeLibraryMode(policy.id, e.target.value as any)}
                    className="bg-black/60 border border-white/[0.06] rounded px-1.5 py-0.5 text-[9px] text-slate-400 focus:outline-none"
                  >
                    <option value="Strict">Strict Mode</option>
                    <option value="Learning">Learning Mode</option>
                    <option value="Disabled">Disabled</option>
                  </select>

                  <div className="text-[10px] text-slate-500">
                    Threshold: <span className="text-white font-bold">{policy.threshold}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulator Dashboard & Rollback Control Panel */}
        <div className="flex flex-col gap-6">
          
          {/* Policy Simulation Card */}
          <div className="bg-[#08090c] border border-white/[0.04] p-5 rounded-2xl flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-[#00E676]" />
                Policy Regression Simulator
              </h3>
              <p className="text-[11px] text-slate-500">
                Simulate the behavioral outcome of current active rules over historic logs before cluster deployment.
              </p>
            </div>

            {simulationResult ? (
              <div className="bg-black/30 border border-white/[0.04] p-4 rounded-xl space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Historical Events:</span>
                  <span className="text-white font-semibold">{simulationResult.tested}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Would Block:</span>
                  <span className="text-rose-400 font-bold">{simulationResult.blocked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Would Challenge:</span>
                  <span className="text-amber-400 font-bold">{simulationResult.challenged}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">False Positives:</span>
                  <span className="text-emerald-400 font-bold">{simulationResult.falsePositives}</span>
                </div>
                <div className="flex justify-between border-t border-white/[0.04] pt-2 mt-1">
                  <span className="text-slate-500">Impact Score:</span>
                  <span className="text-slate-300 font-bold">{simulationResult.impact}</span>
                </div>
                <div className="flex items-center gap-1 text-[#00E676] bg-[#00E676]/5 border border-[#00E676]/15 px-2 py-1 rounded mt-2 justify-center font-bold text-[10px] uppercase">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{simulationResult.status}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-600 font-mono text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Simulating 18M log events...</span>
              </div>
            )}

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30 font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Simulate Cluster Posture</span>
            </button>
          </div>

          {/* Version Control and Rollbacks card */}
          <div className="bg-[#08090c] border border-white/[0.04] p-5 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                Cluster Policy Version History
              </h3>
              <p className="text-[11px] text-slate-500">
                Audited version states. Rollback active configurations immediately.
              </p>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {versions.map((ver) => (
                <div key={ver.version} className="bg-black/20 border border-white/[0.02] p-3 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold text-[11px]">{ver.version}</span>
                      <span className="text-[8px] uppercase font-bold text-[#00E676] bg-[#00E676]/5 px-1 rounded border border-[#00E676]/15">Active</span>
                    </div>
                    <span className="text-[9px] text-slate-500 block">{ver.date} • {ver.changesCount} modifications</span>
                  </div>
                  
                  <button
                    onClick={() => handleRollback(ver.version)}
                    className="bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-[9px] text-slate-400 hover:text-white px-2 py-1 rounded cursor-pointer transition-all"
                  >
                    Rollback
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
