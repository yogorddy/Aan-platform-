import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Clock, 
  Zap, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Settings2, 
  TrendingUp, 
  Gauge, 
  TrendingDown, 
  Flame, 
  RefreshCw,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function SessionHealthTab() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(3000); // 3s default
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h');
  
  // Simulation states
  const [spikeActive, setSpikeActive] = useState<boolean>(false);
  const [latencyActive, setLatencyActive] = useState<boolean>(false);

  // Stats
  const [avgDuration, setAvgDuration] = useState<number>(340);
  const [p99Latency, setP99Latency] = useState<number>(720);
  const [successRate, setSuccessRate] = useState<number>(99.98);
  const [activeSessions, setActiveSessions] = useState<number>(1420);

  // Generate initial historic data for API throughput (requests/min)
  const [apiUsageData, setApiUsageData] = useState<any[]>(() => {
    const data = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const timeStr = new Date(now.getTime() - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      data.push({
        time: timeStr,
        requests: Math.floor(Math.random() * 40) + 60,
        errors: Math.random() > 0.85 ? Math.floor(Math.random() * 2) : 0,
        capacity: 200
      });
    }
    return data;
  });

  // Generate initial historic data for Session Duration (ms)
  const [sessionDurationData, setSessionDurationData] = useState<any[]>(() => {
    const data = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const timeStr = new Date(now.getTime() - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      data.push({
        time: timeStr,
        duration: Math.floor(Math.random() * 80) + 300,
        target: 500
      });
    }
    return data;
  });

  // Keep references to active state for the interval handler to avoid stale closures
  const stateRef = useRef({ spikeActive, latencyActive });
  useEffect(() => {
    stateRef.current = { spikeActive, latencyActive };
  }, [spikeActive, latencyActive]);

  // Real-time loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Calculate new API request volume
      let newRequests = Math.floor(Math.random() * 30) + 70;
      let newErrors = Math.random() > 0.9 ? Math.floor(Math.random() * 2) : 0;
      
      if (stateRef.current.spikeActive) {
        newRequests = Math.floor(Math.random() * 80) + 220; // Massive traffic bump
        newErrors = Math.floor(Math.random() * 6) + 3; // Elevated error count
      }

      // Calculate new session duration
      let newDuration = Math.floor(Math.random() * 60) + 310;
      if (stateRef.current.latencyActive) {
        newDuration = Math.floor(Math.random() * 400) + 850; // High latency simulation
      }

      // Append new points and shift oldest points
      setApiUsageData(prev => {
        const shifted = prev.slice(1);
        return [...shifted, { time: timeStr, requests: newRequests, errors: newErrors, capacity: 200 }];
      });

      setSessionDurationData(prev => {
        const shifted = prev.slice(1);
        return [...shifted, { time: timeStr, duration: newDuration, target: 500 }];
      });

      // Gradually update summary numbers for realism
      setAvgDuration(prev => {
        const target = stateRef.current.latencyActive ? 890 : 340;
        return Math.round(prev * 0.8 + target * 0.2);
      });

      setP99Latency(prev => {
        const target = stateRef.current.latencyActive ? 1420 : 720;
        return Math.round(prev * 0.8 + target * 0.2);
      });

      setSuccessRate(prev => {
        const target = stateRef.current.spikeActive ? 97.45 : 99.98;
        return parseFloat((prev * 0.7 + target * 0.3).toFixed(2));
      });

      setActiveSessions(prev => {
        const target = stateRef.current.spikeActive ? 3240 : 1420;
        const wiggle = Math.floor(Math.random() * 80) - 40;
        return Math.max(100, Math.round(prev * 0.9 + target * 0.1) + wiggle);
      });

    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isPlaying, refreshInterval]);

  // Triggers
  const handleTriggerSpike = () => {
    setSpikeActive(true);
    setTimeout(() => setSpikeActive(false), 12000); // Autoreset after 12s
  };

  const handleTriggerLatency = () => {
    setLatencyActive(true);
    setTimeout(() => setLatencyActive(false), 12000); // Autoreset after 12s
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-left">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-600" />
            <span>Node Health & Session Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry analysis mapping credential throughput, validation latencies, and ZK-proof generation performance.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#00D632] animate-pulse' : 'bg-slate-300'}`} />
            <span className="font-mono text-slate-700 font-bold uppercase text-[9px] tracking-wider">
              {isPlaying ? 'Live Streaming' : 'Stream Paused'}
            </span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase border cursor-pointer transition-all ${
              isPlaying 
                ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" 
                : "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            {isPlaying ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Sessions */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 relative overflow-hidden group">
          {spikeActive && (
            <div className="absolute top-0 right-0 bg-amber-500 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-wide flex items-center gap-1 animate-pulse">
              <Flame className="w-2.5 h-2.5" />
              <span>Load Surge</span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Active Sessions</span>
            <Wifi className={`w-4 h-4 ${isPlaying ? 'text-[#00D632]' : 'text-slate-300'}`} />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-950 block tracking-tight">
              {activeSessions.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-light block mt-0.5 leading-none">
              Client nodes actively validating
            </span>
          </div>
        </div>

        {/* Card 2: Average Session Duration */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 relative overflow-hidden group">
          {latencyActive && (
            <div className="absolute top-0 right-0 bg-rose-500 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-wide flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Latency Warning</span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Avg Session Duration</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-950 block tracking-tight">
              {avgDuration} ms
            </span>
            <span className="text-[10px] text-slate-400 font-light block mt-0.5 leading-none">
              Latency (Telemetry to ZK Proof)
            </span>
          </div>
        </div>

        {/* Card 3: P99 Latency limit */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">P99 Maximum Latency</span>
            <Gauge className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-950 block tracking-tight">
              {p99Latency} ms
            </span>
            <span className="text-[10px] text-slate-400 font-light block mt-0.5 leading-none">
              99th percentile worst-case
            </span>
          </div>
        </div>

        {/* Card 4: Success rate */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Node Success SLA</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className={`text-2xl font-black block tracking-tight ${successRate < 98 ? 'text-amber-600' : 'text-slate-950'}`}>
              {successRate}%
            </span>
            <span className="text-[10px] text-slate-400 font-light block mt-0.5 leading-none">
              No-error attestation pipeline
            </span>
          </div>
        </div>

      </div>

      {/* Main Charts & Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Recharts Visualizations */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Chart 1: API Throughput & Errors (Usage metrics) */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">API Throughput & Error Rate</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-light">
                  Requests per minute (RPM) processed by your decentralized AAN node credentials
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                  <span className="text-slate-500">API Requests</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block animate-pulse" />
                  <span className="text-slate-500">Validation Errors</span>
                </div>
              </div>
            </div>

            <div className="h-[240px] w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apiUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  />
                  <Bar dataKey="requests" name="API Requests" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
                  <Bar dataKey="errors" name="Validation Errors" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Session Duration Latency (Area chart) */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Session Duration / Telemetry Latency</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-light">
                  Time elapsed in milliseconds to run integrity assertions and output ZK proofs
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1.5 rounded bg-emerald-500 inline-block" />
                  <span className="text-slate-500">Duration (ms)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-rose-400 border-t border-dashed inline-block" />
                  <span className="text-slate-500">SLA Cap (500ms)</span>
                </div>
              </div>
            </div>

            <div className="h-[240px] w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sessionDurationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorDuration)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Side: Configuration & Real-Time Simulators */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Simulator Panel */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Node Diagnostics</h3>
            </div>

            <div className="space-y-4">
              
              {/* Speed Config */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  Update Resolution
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Fast (1s)', ms: 1000 },
                    { label: 'Normal (3s)', ms: 3000 },
                    { label: 'Slow (5s)', ms: 5000 }
                  ].map((speed) => (
                    <button
                      key={speed.ms}
                      onClick={() => setRefreshInterval(speed.ms)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold text-center border cursor-pointer transition-all ${
                        refreshInterval === speed.ms 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Simulator buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                  Node Stress Simulator
                </span>
                
                <div className="space-y-2">
                  <button
                    onClick={handleTriggerSpike}
                    disabled={spikeActive}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                      spikeActive 
                        ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' 
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-900 text-white shadow-sm'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{spikeActive ? "Surging API Traffic (12s)..." : "Simulate API Traffic Surge"}</span>
                  </button>

                  <button
                    onClick={handleTriggerLatency}
                    disabled={latencyActive}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                      latencyActive 
                        ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{latencyActive ? "Elevated Latency (12s)..." : "Simulate Telemetry Latency"}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Simulated alert notifications */}
            {(spikeActive || latencyActive) && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 space-y-1 text-xs text-rose-800 leading-normal font-light">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Node SLA Threshold Alerted</span>
                </div>
                <p className="text-[10.5px] text-slate-500">
                  {spikeActive && "Anomalous traffic spike is triggering auto-scaling mechanisms. Response error thresholds rose slightly."}
                  {latencyActive && "Node verification latency exceeded the standard 500ms SLA recommendation. Checking hardware virtualization limits."}
                </p>
              </div>
            )}
          </div>

          {/* Node Infrastructure Metrics */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">Node Hardware Specs</h3>
            </div>

            <div className="space-y-3 text-xs leading-normal font-light">
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span className="text-slate-400">Attestation Protocol</span>
                <span className="font-mono text-slate-800 font-bold">EZKL-ZK-Snark v2.1</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span className="text-slate-400">Deployment Type</span>
                <span className="font-mono text-slate-800">Edge WebAssembly Cluster</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span className="text-slate-400">Host Virtualization</span>
                <span className="font-mono text-slate-800">gVisor Container Sandbox</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Average Proving Overhead</span>
                <span className="font-mono text-slate-800 font-bold text-[#00D632]">18.4 ms</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
