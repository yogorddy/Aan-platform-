import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Cpu, Shield, Bot, Terminal, RefreshCw, ChevronRight, 
  Check, AlertTriangle, Play, HelpCircle, ArrowRight, User, Key, Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AICopilotConsoleProps {
  sessions: any[];
  securityEvents: any[];
}

interface AIProviderSchema {
  id: string;
  name: string;
  isLive: boolean;
  costUnit: string;
  speedRating: string;
}

export function AICopilotConsole({ sessions, securityEvents }: AICopilotConsoleProps) {
  // Config & State
  const [providers, setProviders] = useState<AIProviderSchema[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('gemini');
  const [fetchingConfig, setFetchingConfig] = useState(false);
  const [configuring, setConfiguring] = useState<string | null>(null);

  // Risk Explainer state
  const [selectedType, setSelectedType] = useState<'user' | 'session' | 'security-event'>('user');
  const [selectedId, setSelectedId] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explainingModel, setExplainingModel] = useState('');
  const [explainingLatency, setExplainingLatency] = useState<number | null>(null);

  // Copilot Chat state
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'user' | 'assistant';
    text: string;
    modelUsed?: string;
    latencyMs?: number;
    provider?: string;
  }>>([
    {
      role: 'assistant',
      text: '### AI Security Copilot Workspace Active\nSelect a preset prompt below or ask any audit question. As an auxiliary Layer 3 assistant, I have access to filtered compliance metadata. I do not hold keys and cannot authorize or reverse security actions.',
      modelUsed: 'System Prompt',
      provider: 'aan_layer2'
    }
  ]);

  // Fetch AI engine config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  // Sync default selectable target when selected type changes
  useEffect(() => {
    if (selectedType === 'user') {
      setSelectedId('usr_df990a31'); // Hardcoded default key from seeds (Charlie)
    } else if (selectedType === 'session') {
      setSelectedId('vss_session_failed_df9');
    } else if (selectedType === 'security-event') {
      setSelectedId('sec_event_b1a23'); // Default from seeds if exists, or first event
    }
  }, [selectedType]);

  const fetchConfig = async () => {
    setFetchingConfig(true);
    try {
      const res = await fetch('/api/internal/ai/config');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
        setActiveProvider(data.activeProvider || 'gemini');
      }
    } catch (err) {
      console.error("Error fetching AI Config:", err);
    } finally {
      setFetchingConfig(false);
    }
  };

  const handleProviderChange = async (providerId: string) => {
    setConfiguring(providerId);
    try {
      const res = await fetch('/api/internal/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveProvider(data.activeProvider);
        
        // Add announcement to chat message list
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: `🔄 **AI Routing Swapped Successfully**\n\nThe AI Engine has dynamically re-routed the Layer 2 interface to **${providerId.toUpperCase()}**. All downstream cognitive summaries, forensic briefings, and logs parsing are now running through the selected adapter node. AAN Core deterministic state remains isolated.`,
            provider: providerId,
            modelUsed: `Swapped to ${providerId}`
          }
        ]);
      }
    } catch (err) {
      console.error("Error changing provider:", err);
    } finally {
      setConfiguring(null);
    }
  };

  const handleExplainRisk = async () => {
    if (!selectedId) return;
    setExplanationLoading(true);
    setExplanation('');
    try {
      const res = await fetch('/api/internal/ai/explain-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, targetId: selectedId })
      });
      if (res.ok) {
        const data = await res.json();
        setExplanation(data.text);
        setExplainingModel(data.modelUsed);
        setExplainingLatency(data.latencyMs);
      } else {
        const err = await res.json();
        setExplanation(`Failed to generate explanation: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      setExplanation(`Failed to connect to the AAN AI Engine: ${err}`);
    } finally {
      setExplanationLoading(false);
    }
  };

  const handleChatSubmit = async (customPrompt?: string) => {
    const promptToSend = customPrompt || chatPrompt;
    if (!promptToSend.trim()) return;

    if (!customPrompt) setChatPrompt('');
    
    // Add user message
    const userMsg = { role: 'user' as const, text: promptToSend };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/internal/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToSend })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: data.text,
            modelUsed: data.modelUsed,
            latencyMs: data.latencyMs,
            provider: data.provider
          }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: 'An error occurred while communicating with the AI Engine. Please check your credentials or network configuration.',
            provider: 'system_error'
          }
        ]);
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Failed to connect to the AI Gateway: ${err}`,
          provider: 'system_error'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const getProviderBadgeColor = (provider?: string) => {
    switch (provider) {
      case 'gemini': return 'text-sky-400 bg-sky-950/40 border-sky-900/30';
      case 'openai': return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30';
      case 'anthropic': return 'text-amber-400 bg-amber-950/40 border-amber-900/30';
      case 'local_llm': return 'text-purple-400 bg-purple-950/40 border-purple-900/30';
      default: return 'text-slate-400 bg-slate-950/40 border-slate-900/30';
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Visual Header */}
      <div className="bg-[#0c0d12] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Layer 2 Integration</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Independent Architecture</span>
          </div>
          <h3 className="font-semibold text-white text-base mt-2 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            AI Provider Independence Console
          </h3>
          <p className="text-[11px] text-[#646e7a] max-w-2xl mt-1">
            Configure AAN’s decoupled AI adapters at runtime. AAN owns the trust algorithms, identity database, and proof signatures (Layer 1). AI is restricted strictly to assisting, pattern explaining, and anomaly translation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchConfig}
            className="p-2 border border-white/5 hover:bg-white/5 text-[#646e7a] hover:text-white rounded-lg transition-all cursor-pointer"
            title="Refresh AI Configuration"
          >
            <RefreshCw className={`w-4 h-4 ${fetchingConfig ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3-Layer Visual Topology Flow diagram */}
      <div className="bg-[#0c0d12] border border-white/5 rounded-2xl p-6 space-y-4">
        <span className="font-mono text-[9px] text-purple-400 font-extrabold block uppercase tracking-widest">
          AAN PLATFORM SECURITY HYBRID FLOW DESIGN
        </span>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Layer 1 */}
          <div className="bg-[#111319] border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 font-mono text-[8px] font-bold border-l border-b border-emerald-500/20 rounded-bl-lg">
              LAYER 1: DETERMINISTIC CORE
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-4 h-4" />
                <span className="font-semibold text-xs">AAN Cryptographic Core</span>
              </div>
              <p className="text-[10px] text-[#646e7a] leading-relaxed">
                Executes biometric checks, stateful validation rules, ZKP signatures, database updates, and compliance bans.
              </p>
              <div className="space-y-1 font-mono text-[9px] text-slate-450 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Zero AI-driven trust decisions</div>
                <div className="flex items-center gap-1"><span className="text-emerald-500">✔</span> 100% Cryptographic math proof</div>
                <div className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Policy Engine (Non-override)</div>
              </div>
            </div>
          </div>

          {/* Layer 2 */}
          <div className="bg-[#111319] border border-purple-500/20 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-purple-500/10 text-purple-400 px-2 py-0.5 font-mono text-[8px] font-bold border-l border-b border-purple-500/20 rounded-bl-lg">
              LAYER 2: ADAPTER LAYER
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-1.5 text-purple-400">
                <Cpu className="w-4 h-4" />
                <span className="font-semibold text-xs">Central AI Engine API</span>
              </div>
              <p className="text-[10px] text-[#646e7a] leading-relaxed">
                Standard internal interface. Code uses unified methods. Translates structured database records into natural prompts.
              </p>
              <div className="space-y-1 font-mono text-[9px] text-slate-450 pt-2 border-t border-white/5">
                <div className="flex justify-between"><span>Active Router:</span> <span className="text-purple-400 font-bold">{activeProvider.toUpperCase()}</span></div>
                <div className="flex justify-between"><span>Integrations:</span> <span className="text-slate-300">4 Adapters Loaded</span></div>
                <div className="flex justify-between"><span>Decoupled:</span> <span className="text-emerald-400 font-bold">Yes</span></div>
              </div>
            </div>
          </div>

          {/* Layer 3 */}
          <div className="bg-[#111319] border border-white/5 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-white/5 text-slate-400 px-2 py-0.5 font-mono text-[8px] font-bold border-l border-b border-white/5 rounded-bl-lg">
              LAYER 3: COGNITIVE SERVICES
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-1.5 text-slate-350">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-xs">Interchangeable LLMs</span>
              </div>
              <p className="text-[10px] text-[#646e7a] leading-relaxed">
                Responsible only for generating human-readable context, summarizing database audits, and explaining security alerts.
              </p>
              <div className="flex flex-wrap gap-1 pt-2 border-t border-white/5">
                {providers.map(p => (
                  <span 
                    key={p.id} 
                    className={`font-mono text-[8px] px-1.5 py-0.5 rounded border transition-all ${
                      activeProvider === p.id 
                        ? 'bg-purple-950/40 text-purple-200 border-purple-500/30 font-bold' 
                        : 'bg-black/20 text-[#646e7a] border-white/5'
                    }`}
                  >
                    {p.id.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Layer 3 Provider Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Active Provider Node Configurations</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providers.map((p) => {
            const isSelected = activeProvider === p.id;
            const isWorking = configuring === p.id;
            
            return (
              <div 
                key={p.id}
                onClick={() => !isWorking && handleProviderChange(p.id)}
                className={`border rounded-xl p-4 text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between h-32 ${
                  isSelected 
                    ? 'bg-purple-600/[0.04] border-purple-500 shadow-xl' 
                    : 'bg-[#0c0d12] border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-slate-950 px-2 py-0.5 font-mono text-[8px] font-bold rounded-bl-lg">
                    ACTIVE ROUTE
                  </div>
                )}
                
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#646e7a]">ADAPTER NODE</span>
                  <p className="font-semibold text-white text-xs">{p.name}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5 font-mono text-[9px] text-[#646e7a]">
                  <div className="flex justify-between">
                    <span>Performance:</span>
                    <span className="text-slate-350">{p.speedRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost unit:</span>
                    <span className="text-slate-350">{p.costUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credential:</span>
                    <span className={p.id === 'gemini' && !p.isLive ? 'text-amber-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                      {p.id === 'gemini' && !p.isLive ? 'No Key (Simulated)' : 'Loaded'}
                    </span>
                  </div>
                </div>

                {isWorking && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="font-mono text-[10px] text-purple-200 uppercase font-bold">Routing...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main interactive split pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Forensic Risk Explainer */}
        <div className="lg:col-span-6 bg-[#0c0d12] border border-white/5 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="font-mono text-[9px] text-purple-400 font-extrabold block uppercase tracking-widest">MODULE A</span>
              <h4 className="font-semibold text-white text-sm mt-0.5">AI Forensic Risk Explainer</h4>
              <p className="text-[10px] text-[#646e7a] leading-relaxed">
                Query the AI Adapter Layer to retrieve, analyze, and translate security log records into human-readable briefings explaining the threat vectors.
              </p>
            </div>

            {/* Selection form */}
            <div className="space-y-3 font-sans text-xs bg-[#111319] border border-white/5 rounded-xl p-4">
              <div className="space-y-1.5">
                <label className="text-[#646e7a] font-mono text-[9px] uppercase tracking-wider font-semibold">Select Metadata Class</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['user', 'session', 'security-event'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setSelectedType(type); setExplanation(''); }}
                      className={`py-1.5 px-2 rounded-lg font-mono text-[9px] uppercase font-bold border cursor-pointer text-center transition-all ${
                        selectedType === type
                          ? 'bg-purple-950/40 text-purple-200 border-purple-500/30'
                          : 'bg-black/20 text-[#646e7a] border-white/5 hover:border-white/10'
                      }`}
                    >
                      {type === 'security-event' ? 'Intrusion Alert' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID list dynamic selector dropdown */}
              <div className="space-y-1.5">
                <label className="text-[#646e7a] font-mono text-[9px] uppercase tracking-wider font-semibold">Select Target ID Record</label>
                <select
                  value={selectedId}
                  onChange={(e) => { setSelectedId(e.target.value); setExplanation(''); }}
                  className="w-full bg-black/40 border border-white/5 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none font-mono focus:border-purple-500"
                >
                  {selectedType === 'user' && (
                    <>
                      <option value="usr_df990a31">Charlie (usr_df990a31) - Biometric Duplicate Profile</option>
                      <option value="usr_9a48f2c0">Alice (usr_9a48f2c0) - Hardware Link Candidate</option>
                      <option value="usr_b710ef67">Bob (usr_b710ef67) - Cleared Base Identity</option>
                    </>
                  )}
                  {selectedType === 'session' && (
                    <>
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.id} ({s.status.toUpperCase()} - Risk: {s.risk_score})
                        </option>
                      ))}
                    </>
                  )}
                  {selectedType === 'security-event' && (
                    <>
                      {securityEvents.length > 0 ? (
                        securityEvents.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.id} - [{e.severity.toUpperCase()}] {e.event_type}
                          </option>
                        ))
                      ) : (
                        <option value="sec_event_b1a23">sec_event_b1a23 - Impossible State Transition Block</option>
                      )}
                    </>
                  )}
                </select>
              </div>

              <button
                onClick={handleExplainRisk}
                disabled={explanationLoading || !selectedId}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 px-3 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/10 disabled:opacity-50"
              >
                {explanationLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Security Logs...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Generate AI Diagnostic Briefing</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Explanation Terminal Block */}
          <div className="flex-1 mt-4 flex flex-col justify-between min-h-[220px]">
            <div className="bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-[10.5px] leading-relaxed text-slate-300 flex-1 overflow-y-auto max-h-[280px] relative select-all scrollbar-thin">
              <div className="absolute top-2 right-2 text-[8px] bg-white/5 border border-white/5 text-[#646e7a] py-0.5 px-1.5 rounded uppercase font-bold">
                Output
              </div>
              
              {explanationLoading && (
                <div className="flex flex-col items-center justify-center h-full text-[#646e7a] gap-2 py-10">
                  <Cpu className="w-6 h-6 text-purple-400 animate-spin" />
                  <span className="uppercase tracking-widest text-[9px] animate-pulse">Running Decentralized Prompt Parser...</span>
                </div>
              )}

              {!explanationLoading && !explanation && (
                <div className="text-[#646e7a] flex flex-col items-center justify-center h-full gap-2 py-10">
                  <Terminal className="w-5 h-5 text-slate-700" />
                  <span>Awaiting diagnostic triggers. Select a class above to generate real-time AI security analysis.</span>
                </div>
              )}

              {!explanationLoading && explanation && (
                <div className="space-y-2 whitespace-pre-wrap text-left pt-2">
                  {explanation}
                </div>
              )}
            </div>

            {explanation && explainingLatency && (
              <div className="flex items-center justify-between mt-2 font-mono text-[9px] text-slate-450 px-1">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Model: <strong>{explainingModel}</strong></span>
                </div>
                <span>Latency: <strong className="text-purple-400">{explainingLatency}ms</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Compliance Copilot Chat */}
        <div className="lg:col-span-6 bg-[#0c0d12] border border-white/5 rounded-2xl p-6 space-y-4 flex flex-col justify-between min-h-[480px]">
          <div>
            <span className="font-mono text-[9px] text-purple-400 font-extrabold block uppercase tracking-widest">MODULE B</span>
            <h4 className="font-semibold text-white text-sm mt-0.5">Interactive Security Co-pilot Terminal</h4>
            <p className="text-[10px] text-[#646e7a] leading-relaxed">
              Ask questions about network intrusion, check transaction anomalies, draft bug bounty payouts, or investigate registered users with the decentralized LLM node.
            </p>
          </div>

          {/* Message Thread container */}
          <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 overflow-y-auto space-y-4 max-h-[280px] min-h-[220px] scrollbar-thin">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1 text-[8px] font-mono uppercase font-bold text-slate-450 px-1">
                  {msg.role === 'user' ? (
                    <span>Compliance Officer</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Bot className="w-3 h-3 text-purple-400" />
                      <span>AAN AI Engine ({msg.provider?.toUpperCase()})</span>
                    </div>
                  )}
                </div>

                <div className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed whitespace-pre-wrap border ${
                  msg.role === 'user' 
                    ? 'bg-purple-950/20 text-purple-200 border-purple-500/20 rounded-tr-none' 
                    : 'bg-black/30 text-slate-350 border-white/5 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>

                {msg.role === 'assistant' && msg.latencyMs && (
                  <div className="text-[7.5px] font-mono text-[#646e7a] px-2 flex gap-3">
                    <span>Model: {msg.modelUsed}</span>
                    <span>Latency: {msg.latencyMs}ms</span>
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-[#646e7a] font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span className="animate-pulse">Thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="font-mono text-[8px] text-[#646e7a] block uppercase font-bold tracking-wider">COMPLIANCE INVESTIGATION PATTERN QUICK-PROMPTS</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Analyze Charlie's risk profile", prompt: "Explain the risk vectors for user usr_df990a31 (Charlie). What are the duplicate biometric patterns?" },
                { label: "Audit JWT Signature bypass", prompt: "Analyze security report rep_auth_bypass_01. Explain the JWT blank signature vulnerability and how we patched it." },
                { label: "Summarize State Transition guard", prompt: "Explain the impossible_session_state_transition security alert. Why did the deterministic state machine prevent this transition?" }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChatSubmit(preset.prompt)}
                  disabled={chatLoading}
                  className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg py-1 px-2 text-[9.5px] text-slate-400 hover:text-white font-mono cursor-pointer transition-all disabled:opacity-50 text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* TextInput bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }}
            className="flex items-center gap-2 bg-[#111319] border border-white/5 rounded-xl p-1 px-2"
          >
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              disabled={chatLoading}
              placeholder="Ask the compliance co-pilot about anomalies, logs, or metrics..."
              className="flex-1 bg-transparent py-1.5 text-xs text-white focus:outline-none placeholder-[#646e7a]"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatPrompt.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-slate-950 p-1.5 rounded-lg font-bold transition-all cursor-pointer disabled:bg-purple-650"
            >
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
