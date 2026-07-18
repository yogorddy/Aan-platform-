import React, { useState, useEffect } from 'react';
import { ThreatEvent, initialThreats } from './AdminMockData';
import { 
  Shield, Activity, AlertTriangle, Check, Search, Filter, RefreshCw, Globe, ArrowUpRight, Cpu, Server, Wifi, Play, CheckCircle2 
} from 'lucide-react';

interface HealthTabProps {
  compactMode: boolean;
  searchQuery: string;
  role: string;
  onLogAudit: (action: string, targetType: string, targetId: string, metadata: any) => void;
}

export default function HealthTab({ compactMode, searchQuery, role, onLogAudit }: HealthTabProps) {
  const [threats, setThreats] = useState<ThreatEvent[]>(initialThreats);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'custom'>('24h');
  
  // Dynamic tickers to simulate active production traffic
  const [metrics, setMetrics] = useState({
    latency: 18,
    requestsToday: 1429283,
    threatsPrevented: 12833,
    proofsIssued: 842910,
    humanVerifications: 621411,
    successRate: 99.82,
    duplicatesPrevented: 2189
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        latency: Math.max(12, Math.min(24, Math.round(prev.latency + (Math.random() - 0.5) * 4))),
        requestsToday: prev.requestsToday + Math.round(Math.random() * 5 + 1),
        proofsIssued: prev.proofsIssued + Math.round(Math.random() * 3 + 1),
        humanVerifications: prev.humanVerifications + (Math.random() > 0.4 ? 1 : 0),
        threatsPrevented: prev.threatsPrevented + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMitigate = (threatId: string, type: string) => {
    if (role === 'read-only' || role === 'auditor') {
      alert("Role Permission Restricted: Read-only accounts cannot modify security posture states.");
      return;
    }
    setThreats(prev => prev.map(t => {
      if (t.id === threatId) {
        const nextStatus = type === 'block' ? 'Blocked' : 'Mitigated';
        onLogAudit(`threat.${type}`, 'security_event', threatId, { previous_status: t.status, next_status: nextStatus });
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // Filter threats
  const filteredThreats = threats.filter(t => {
    const matchesSearch = t.threatType.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.partner.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.ip.includes(searchQuery) || 
                          t.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || t.severity === selectedSeverity;
    const matchesPartner = selectedPartner === 'all' || t.partner === selectedPartner;
    const matchesStatus = selectedStatus === 'all' || t.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesSeverity && matchesPartner && matchesStatus;
  });

  // SVG Line Graph Helpers for Latency and Requests
  const getGraphData = () => {
    if (timeRange === '24h') {
      return {
        requests: [450, 480, 520, 610, 580, 640, 710, 780, 890, 820, 940, 1050],
        threats: [4, 6, 8, 12, 10, 14, 11, 15, 22, 18, 25, 14],
        labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00', '02:00', '04:00', '06:00']
      };
    } else if (timeRange === '7d') {
      return {
        requests: [820, 950, 1100, 1050, 1200, 1400, 1350],
        threats: [18, 24, 31, 28, 35, 42, 38],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      };
    } else {
      return {
        requests: [1000, 1120, 1300, 1250, 1450, 1500, 1600, 1550, 1750, 1800, 1950, 2100],
        threats: [35, 41, 52, 48, 59, 65, 71, 62, 80, 88, 95, 78],
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8', 'Wk 9', 'Wk 10', 'Wk 11', 'Wk 12']
      };
    }
  };

  const currentData = getGraphData();
  const maxReq = Math.max(...currentData.requests);
  const maxThr = Math.max(...currentData.threats) || 1;

  return (
    <div className={`space-y-8 animate-[fadeIn_0.2s_ease-out]`}>
      
      {/* 1. Infrastructure Health Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Platform Status</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-[#00D632] animate-pulse" />
              Operational
            </span>
          </div>
          <Server className="w-4 h-4 text-emerald-600 opacity-60" />
        </div>

        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Identity Engine</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-[#00D632] animate-pulse" />
              Healthy
            </span>
          </div>
          <Cpu className="w-4 h-4 text-emerald-600 opacity-60" />
        </div>

        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Proof Engine</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-[#00D632] animate-pulse" />
              Healthy
            </span>
          </div>
          <Shield className="w-4 h-4 text-emerald-600 opacity-60" />
        </div>

        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Avg API Latency</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{metrics.latency}ms</span>
          </div>
          <Activity className="w-4 h-4 text-emerald-600 opacity-60" />
        </div>

      </div>

      {/* Services Health Matrix */}
      <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-4">Core Infrastructure Cluster Posture</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Risk Engine</span>
            <span className="text-[#00C853] font-bold">ONLINE</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex items-center justify-between">
            <span className="text-slate-500 font-semibold">API Gateway</span>
            <span className="text-[#00C853] font-bold">HEALTHY</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Verify Queue</span>
            <span className="text-[#00C853] font-bold">ACTIVE</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex items-center justify-between">
            <span className="text-slate-500 font-semibold">DB Replication</span>
            <span className="text-[#00C853] font-bold">SYNCHRONIZED</span>
          </div>
        </div>
      </div>

      {/* 2. Today's Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold tracking-wider">Protected Requests Today</span>
          <span className="text-lg md:text-xl font-bold text-slate-950 mt-1 block font-mono">{metrics.requestsToday.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold tracking-wider">Proofs Issued Today</span>
          <span className="text-lg md:text-xl font-bold text-slate-950 mt-1 block font-mono">{metrics.proofsIssued.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold tracking-wider">Threats Prevented Today</span>
          <span className="text-lg md:text-xl font-bold text-rose-600 mt-1 block font-mono">{metrics.threatsPrevented.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold tracking-wider">Verification Success Rate</span>
          <span className="text-lg md:text-xl font-bold text-[#00C853] mt-1 block font-mono">{metrics.successRate}%</span>
        </div>
      </div>

      {/* 3. Interactive Historical Performance Metrics Graph */}
      <div className="bg-white border border-slate-200/60 p-6 rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-800 font-bold">Enterprise Traffic & Posture Analytics</h2>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Sovereign identity verification and anomalous requests traffic comparison.</p>
          </div>
          <div className="flex gap-1 bg-slate-50 p-1 border border-slate-200/40 rounded-full">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`text-[9px] font-mono px-3 py-1.5 rounded-full uppercase tracking-wider cursor-pointer font-bold ${timeRange === r ? 'bg-white text-slate-950 shadow-sm border border-slate-200/30' : 'text-slate-400 hover:text-slate-800'}`}
              >
                {r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Vector SVG Graph Plotting */}
        <div className="h-44 relative flex items-end">
          <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
            {/* Draw grid lines */}
            <line x1="0" y1="20" x2="100%" y2="20" stroke="black" strokeOpacity="0.03" strokeDasharray="3,3" />
            <line x1="0" y1="60" x2="100%" y2="60" stroke="black" strokeOpacity="0.03" strokeDasharray="3,3" />
            <line x1="0" y1="100" x2="100%" y2="100" stroke="black" strokeOpacity="0.03" strokeDasharray="3,3" />
            <line x1="0" y1="140" x2="100%" y2="140" stroke="black" strokeOpacity="0.03" strokeDasharray="3,3" />

            {/* Blue Request Line */}
            <path
              d={currentData.requests.map((val, idx) => {
                const x = (idx / (currentData.requests.length - 1)) * 100;
                const y = 160 - (val / maxReq) * 120;
                return `${idx === 0 ? 'M' : 'L'} ${x}% ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#00D632"
              strokeWidth="2.5"
              strokeOpacity="0.8"
            />

            {/* Red Threat Line */}
            <path
              d={currentData.threats.map((val, idx) => {
                const x = (idx / (currentData.threats.length - 1)) * 100;
                const y = 160 - (val / maxThr) * 100;
                return `${idx === 0 ? 'M' : 'L'} ${x}% ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeOpacity="0.8"
              strokeDasharray="4,2"
            />
          </svg>

          {/* Graph Legend Overlay */}
          <div className="absolute top-0 right-0 flex items-center gap-4 text-[9px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#00D632] rounded-full inline-block" />
              <span className="text-slate-400 font-semibold">Attestation Queries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-rose-500 rounded-full inline-block border-dashed" />
              <span className="text-slate-400 font-semibold">Threat Indicators</span>
            </div>
          </div>
        </div>

        {/* Labels X-Axis */}
        <div className="flex justify-between text-[8px] font-mono text-slate-400 border-t border-slate-100 pt-2 font-semibold">
          {currentData.labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      </div>

      {/* 4. Real-time Threat Center Panel */}
      <div className="bg-white border border-slate-200/60 p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-800 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
              Real-Time Platform Threat Center
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Live mitigation monitoring and proactive endpoint containment.</p>
          </div>

          {/* Interactive Threat Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-transparent border-none text-[10px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Severity: All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 rounded-xl px-2.5 py-1.5">
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="bg-transparent border-none text-[10px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Partner: All</option>
                <option value="Stripe Connect">Stripe</option>
                <option value="Supabase Core">Supabase</option>
                <option value="Bybit Auth">Bybit</option>
                <option value="Coinbase Pay">Coinbase</option>
                <option value="Kraken Prime">Kraken</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 rounded-xl px-2.5 py-1.5">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent border-none text-[10px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="blocked">Blocked</option>
                <option value="mitigated">Mitigated</option>
                <option value="suspended">Suspended</option>
                <option value="quarantined">Quarantined</option>
              </select>
            </div>
          </div>
        </div>

        {/* Threat Table */}
        <div className="border border-slate-200/50 rounded-2xl overflow-hidden bg-slate-50/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                  <th className="py-3 px-4 font-bold">Threat Context</th>
                  <th className="py-3 px-4 font-bold">Partner Scope</th>
                  <th className="py-3 px-4 font-bold">Severity</th>
                  <th className="py-3 px-4 font-bold">IP & Origin</th>
                  <th className="py-3 px-4 font-bold">Risk Score</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {filteredThreats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matching threats found in current time window.
                    </td>
                  </tr>
                ) : (
                  filteredThreats.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-slate-900 block font-semibold">{t.threatType}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{t.timestamp} • {t.device}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-bold">{t.partner}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${t.severity === 'critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' : t.severity === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                          {t.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        <span className="block font-bold">{t.ip}</span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5 font-semibold">
                          <Globe className="w-2.5 h-2.5" />
                          {t.country}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right pr-8">
                        <span className="text-slate-900 font-bold">{t.riskScore}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${t.status === 'Blocked' || t.status === 'Suspended' ? 'bg-rose-50 text-rose-600 border border-rose-100' : t.status === 'Mitigated' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {t.status !== 'Blocked' && t.status !== 'Mitigated' && t.status !== 'Suspended' ? (
                           <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleMitigate(t.id, 'block')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[8px] font-bold uppercase px-2.5 py-1 rounded-md border border-rose-200 cursor-pointer"
                            >
                              Block
                            </button>
                            <button
                              onClick={() => handleMitigate(t.id, 'mitigate')}
                              className="bg-emerald-50 hover:bg-emerald-100 text-[#00C853] text-[8px] font-bold uppercase px-2.5 py-1 rounded-md border border-emerald-200 cursor-pointer"
                            >
                              Mitigate
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-400 flex items-center gap-1 justify-end font-bold uppercase">
                            <Check className="w-3.5 h-3.5 text-[#00D632]" /> Securing Posture
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
