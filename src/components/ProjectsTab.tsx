import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  HelpCircle, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2,
  Server
} from 'lucide-react';

interface ProjectsTabProps {
  projName: string;
  projectId: string;
  projEnv: 'sandbox' | 'production';
  onToggleEnv: () => void;
  onUpdateProjName: (name: string) => void;
}

export default function ProjectsTab({ projName, projectId, projEnv, onToggleEnv, onUpdateProjName }: ProjectsTabProps) {
  const [newProjName, setNewProjName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [activeProjects, setActiveProjects] = useState<any[]>([
    { id: projectId || "proj_sb_aan_201", name: projName || "Default Auth Layer", env: projEnv, status: "active", volume: "1k-10k req/mo" }
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    const newId = "proj_sb_" + Math.random().toString(36).substring(2, 10);
    const updated = [
      ...activeProjects,
      { id: newId, name: newProjName, env: "sandbox", status: "active", volume: "0-1k req/mo" }
    ];
    setActiveProjects(updated);
    setNewProjName("");
    setShowCreate(false);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Technical Project Environments</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure technical boundaries, deployment environments, and client application origins.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showCreate ? "Hide Creator" : "Create New Project"}</span>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 max-w-md">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">New Project Setup</h3>
          <div className="space-y-1.5 text-xs">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">Project Name</label>
            <input
              type="text"
              placeholder="e.g., Gaming Production Boundary"
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
            />
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs py-2 px-4 rounded-xl">
            Provision Project Enclave
          </button>
        </form>
      )}

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeProjects.map((proj) => (
          <div key={proj.id} className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block">{proj.id}</span>
                  <h3 className="text-sm font-bold text-slate-900">{proj.name}</h3>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                  proj.env === 'production' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {proj.env}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Monthly Request Cap</span>
                <span className="text-slate-900 font-bold">{proj.volume}</span>
              </div>
            </div>

            {/* Toggle Env Control for sandbox/production */}
            {proj.id === projectId && (
              <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Toggle Environment</span>
                  <p className="text-[9.5px] text-slate-400 font-light">Switch active scopes from testing sandbox to live traffic.</p>
                </div>
                
                <button
                  onClick={onToggleEnv}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all border ${
                    projEnv === 'production'
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-700 hover:bg-amber-500/15"
                  }`}
                >
                  {projEnv === 'production' ? "Active Live Mode" : "Sandbox Active"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
