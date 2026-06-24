import React, { useState, useEffect } from "react";
import { 
  getCompleteLessonsList, 
  findLessonById, 
  AcademyLesson 
} from "../academyData";
import { 
  BookOpen, 
  Search, 
  CheckCircle, 
  Brain, 
  Code, 
  Database, 
  Layers, 
  ShieldAlert, 
  HelpCircle, 
  ChevronRight, 
  Play, 
  ArrowLeft, 
  Flame, 
  Compass, 
  FileCode, 
  Terminal, 
  RefreshCw, 
  Sparkles, 
  Check, 
  ExternalLink,
  Shield,
  Users,
  Lock,
  Unlock,
  Settings,
  Plus,
  Trash2,
  AlertTriangle,
  Fingerprint,
  Info
} from "lucide-react";
import {
  AcademyRole,
  AcademyVisibility,
  CustomRoleDefinition,
  LESSON_VISIBILITY_MAP,
  ROLE_VISIBILITY_RULES,
  ROLE_DESCRIPTION_MAP,
  getStoredCustomRoles,
  saveStoredCustomRoles,
  canRoleAccessLesson
} from "../academyPermissions";

interface AANAcademyProps {
  initialLessonId?: string;
  onNavigatePage?: (pageId: string) => void;
}

export default function AANAcademy({ initialLessonId, onNavigatePage }: AANAcademyProps) {
  const [lessons] = useState<AcademyLesson[]>(() => {
    const list = getCompleteLessonsList();
    const unique: AcademyLesson[] = [];
    const seen = new Set<string>();
    for (const item of list) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  });
  
  // RBAC Roles states
  const [activeRole, setActiveRole] = useState<string>(() => {
    return localStorage.getItem("aan_academy_active_role") || "Super Administrator";
  });
  
  const [customRoles, setCustomRoles] = useState<Record<string, CustomRoleDefinition>>(() => {
    return getStoredCustomRoles();
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Custom Role Creator Fields
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleLessons, setNewRoleLessons] = useState<string[]>(["intro", "developer_sdk"]);
  const [showRbacSettings, setShowRbacSettings] = useState(false);
  const [rbacNotification, setRbacNotification] = useState("");

  const [activeLesson, setActiveLesson] = useState<AcademyLesson>(() => {
    // Initial load checks if target lesson is allowed; if not, falls back to first allowed
    const requested = lessons.find(l => l.id === initialLessonId) || lessons[0];
    return requested;
  });
  
  // Learning State Tracking
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("aan_academy_completed");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Quiz State Tracking
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"learn" | "quiz">("learn");

  // Interactive Simulators State
  const [riskEngineInputs, setRiskEngineInputs] = useState({
    failedLiveness: false,
    duplicateHash: false,
    manyDeviceAccounts: false,
    newDeviceExistingUser: false,
    rapidAttempts: false,
    missingConsent: false,
    expiredSession: false,
  });

  const [apiKeyPlaintext, setApiKeyPlaintext] = useState("aan_live_8f3d1e9a78bc2b");
  const [apiKeyHashed, setApiKeyHashed] = useState("");
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const [simulatedWebhookEvent, setSimulatedWebhookEvent] = useState("session.completed");
  const [simulatedWebhookResponse, setSimulatedWebhookResponse] = useState("");
  const [simulatedWebhookLoading, setSimulatedWebhookLoading] = useState(false);

  // Sync active lesson with initialLessonId prop if changed
  useEffect(() => {
    if (initialLessonId) {
      const found = lessons.find(l => l.id === initialLessonId);
      if (found) {
        setActiveLesson(found);
      }
    }
  }, [initialLessonId, lessons]);

  // Compute SHA-256 Mock hash for and database row simulator
  useEffect(() => {
    // Basic deterministic mock hash representation for display
    let hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // Empty hash
    if (apiKeyPlaintext) {
      let numericalValue = 0;
      for (let i = 0; i < apiKeyPlaintext.length; i++) {
        numericalValue = (numericalValue << 5) - numericalValue + apiKeyPlaintext.charCodeAt(i);
        numericalValue |= 0;
      }
      hash = Math.abs(numericalValue).toString(16).padStart(16, "0") + "ea819a3b9042b31cb902f891bca7a9829";
    }
    setApiKeyHashed(hash);
  }, [apiKeyPlaintext]);

  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = { ...prev, [lessonId]: !prev[lessonId] };
      localStorage.setItem("aan_academy_completed", JSON.stringify(next));
      return next;
    });
  };

  const handleQuizAnswer = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${activeLesson.id}_${questionIndex}`]: optionIndex
    }));
  };

  const submitQuiz = (questionIndex: number) => {
    setQuizSubmitted(prev => ({
      ...prev,
      [`${activeLesson.id}_${questionIndex}`]: true
    }));
  };

  const executeSimulatedWebhook = () => {
    setSimulatedWebhookLoading(true);
    setTimeout(() => {
      const payload = {
        id: "evt_" + Math.random().toString(36).substring(2, 9),
        event_type: simulatedWebhookEvent,
        created_at: new Date().toISOString(),
        data: {
          session_id: "vss_" + Math.random().toString(36).substring(2, 9),
          user_id: "usr_" + Math.random().toString(36).substring(2, 9),
          risk_status: simulatedWebhookEvent === "session.failed" ? "high_risk" : "verified",
          timestamp: Date.now()
        }
      };
      setSimulatedWebhookResponse(JSON.stringify(payload, null, 2));
      setSimulatedWebhookLoading(false);
    }, 700);
  };

  // Compute risk score based on simulator toggles
  const calculateRiskMetrics = () => {
    let score = 10; // baseline healthy score
    const factors: string[] = [];

    if (riskEngineInputs.failedLiveness) {
      score += 55;
      factors.push("Failed attestation handshake indicating anomalous or spoofed client request");
    }
    if (riskEngineInputs.duplicateHash) {
      score += 40;
      factors.push("Duplicate posture signature recognized across existing identities");
    }
    if (riskEngineInputs.manyDeviceAccounts) {
      score += 25;
      factors.push("Abnormally high distinct account counts on same hardware environment");
    }
    if (riskEngineInputs.newDeviceExistingUser) {
      score += 15;
      factors.push("Fresh hardware environment logged on highly consistent user index");
    }
    if (riskEngineInputs.rapidAttempts) {
      score += 20;
      factors.push("Aggressive burst attempts detected in a narrow timestamp interval");
    }
    if (riskEngineInputs.missingConsent) {
      score += 100;
      factors.push("Consent indicator missing entirely. Operation processing illegal.");
    }
    if (riskEngineInputs.expiredSession) {
      score += 30;
      factors.push("Session security TTL limit exceeded");
    }

    score = Math.min(score, 100);
    
    let tier: "LOW" | "STAGE_1_REVIEW" | "CRITICAL_FRAUD" = "LOW";
    let colorClass = "text-emerald-400 bg-emerald-950 border border-emerald-900";
    if (score >= 70) {
      tier = "CRITICAL_FRAUD";
      colorClass = "text-rose-400 bg-rose-950 border border-rose-900";
    } else if (score >= 40) {
      tier = "STAGE_1_REVIEW";
      colorClass = "text-amber-400 bg-amber-950 border border-amber-900";
    }

    return { score, factors, tier, colorClass };
  };

  const calculatedRisk = calculateRiskMetrics();

  // Sync active role change and update custom roles
  useEffect(() => {
    localStorage.setItem("aan_academy_active_role", activeRole);
  }, [activeRole]);

  // Unified Multi-Tier Search Engine (Show all lessons for complete discovery and simulation testing)
  const filterLessons = () => {
    const activeList = lessons;

    if (!searchQuery) {
      if (selectedCategory === "all") return activeList;
      return activeList.filter(l => l.category === selectedCategory);
    }

    const q = searchQuery.toLowerCase();
    return activeList.filter(l => {
      // 1. Title/Overview Match
      if (l.title.toLowerCase().includes(q) || l.overview.toLowerCase().includes(q)) return true;
      
      // 2. Glossary Elements Match
      if (l.glossary && l.glossary.some(g => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q))) return true;
      
      // 3. Database Metadata Match
      if (l.databaseTables && l.databaseTables.some(t => 
        t.name.toLowerCase().includes(q) || 
        t.purpose.toLowerCase().includes(q) ||
        t.columns.some(col => col.toLowerCase().includes(q))
      )) return true;

      // 4. API pathways Match
      if (l.apiEndpoints && l.apiEndpoints.some(api => 
        api.path.toLowerCase().includes(q) || 
        api.purpose.toLowerCase().includes(q)
      )) return true;

      return false;
    });
  };

  const searchFiltered = filterLessons();

  const categories = [
    { id: "all", name: "All Modules" },
    { id: "core", name: "Core Architecture" },
    { id: "auth-identity", name: "Identity & Auth" },
    { id: "security-privacy", name: "Security & Privacy" },
    { id: "developer-api", name: "APIs & Webhooks" },
    { id: "infrastructure-deployment", name: "Infrastructure & Ops" },
  ];

  const totalCompleted = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = Math.round((totalCompleted / lessons.length) * 100);

  // Navigate between related lessons seamlessly
  const handleSelectLessonById = (id: string) => {
    const found = lessons.find(l => l.id === id);
    if (found) {
      setActiveLesson(found);
      setActiveTab("learn");
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col md:flex-row min-h-[calc(100vh-45px)] pr-[2px]" id="aan-academy-viewport">
      
      {/*  LEFT ACADEMY SIDEBAR: LIST & SEARCH */}
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-auto md:h-[calc(100vh-45px)] sticky top-0 md:top-[45px]">
        {/* Search header container */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">AAN Academy</span>
            </div>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 border border-blue-900 rounded">
              LIVING DOCS
            </span>
          </div>
          
          {/* Progress Tracker Widget */}
          <div className="mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-400 font-mono">Academic Progress</span>
              <span className="text-[10px] font-bold font-mono text-emerald-400">{progressPercent}% ({totalCompleted}/{lessons.length})</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* RBAC ROLE SELECTOR FOR INTEGRATION TESTING */}
          <div className="mb-4 bg-slate-950 p-3 rounded-lg border border-blue-950 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-400" />
                Active Security Role
              </span>
              <button 
                onClick={() => setShowRbacSettings(true)}
                className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                title="Manage Custom Roles & Permissions"
              >
                <Settings className="w-3 h-3 animate-spin duration-1000" />
                Manage
              </button>
            </div>
            <select
              value={activeRole}
              onChange={(e) => {
                const newRole = e.target.value;
                setActiveRole(newRole);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-[11px] cursor-pointer"
            >
              <optgroup label="Default Enterprise Roles">
                {Object.keys(ROLE_VISIBILITY_RULES).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </optgroup>
              {Object.keys(customRoles).length > 0 && (
                <optgroup label="Custom Roles (Database)">
                  {Object.keys(customRoles).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Search components, SQL, APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg py-2 pl-9 pr-3 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Category switcher */}
        <div className="px-3 py-2 border-b border-slate-800 max-h-32 overflow-y-auto flex md:flex-wrap gap-1.5 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery(""); // clear search query on category drift
              }}
              className={`text-[10px] px-2.5 py-1 rounded-md font-sans transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id 
                  ? "bg-slate-100 text-slate-950 font-semibold" 
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dynamic Lesson Selection Ledger */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {searchFiltered.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-slate-500 font-mono">No matching lessons found.</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-2 text-[10px] text-blue-400 hover:underline"
              >
                Clear Search
              </button>
            </div>
          ) : (
            searchFiltered.map(lesson => {
              const isSelected = activeLesson.id === lesson.id;
              const isDone = completedLessons[lesson.id];
              const isAccessible = canRoleAccessLesson(activeRole, lesson.id, customRoles);
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setActiveLesson(lesson);
                    setActiveTab("learn");
                  }}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between group transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-blue-950 border border-blue-800 shadow-md"
                      : "hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-mono leading-none tracking-wide text-xs font-semibold ${
                        isSelected ? "text-blue-400" : "text-slate-200"
                      } ${!isAccessible ? "text-slate-400" : ""}`}>
                        {lesson.title}
                      </span>
                      {isDone && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950 shrink-0" />
                      )}
                      {!isAccessible && (
                        <span className="text-[8px] font-mono bg-rose-950 text-rose-400 border border-rose-900 px-1 rounded shrink-0">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      {lesson.overview}
                    </p>
                  </div>
                  <div className="shrink-0 ml-1.5">
                    {!isAccessible ? (
                      <Lock className="w-3 h-3 text-rose-400" />
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-500 select-none transition-transform ${
                        isSelected ? "translate-x-0.5 text-blue-400" : "group-hover:translate-x-0.5"
                      }`} />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
        
        {/* Suggested Searches Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 hidden md:block select-none">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">Suggested Queries</span>
          <div className="flex flex-wrap gap-1 leading-normal">
            {["GDPR compliance", "Risk Engine", "Row Level Security", "API Keys", "Liveness Check"].map(term => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="text-[9px] font-mono hover:text-blue-400 hover:border-slate-700 bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-slate-400 cursor-pointer"
              >
                "{term}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/*  RIGHT ACADEMY ACTIVE LESSON GRID */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {showRbacSettings ? (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
            {/* Header banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-extrabold bg-rose-950/80 px-2.5 py-0.5 border border-rose-900/40 rounded">
                  ADMINISTRATIVE PORTAL
                </span>
                <h1 className="text-xl sm:text-2xl font-mono tracking-tight font-extrabold text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-500 animate-pulse" />
                  Enterprise RBAC & Identity System
                </h1>
                <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
                  Configure real-time Role-Based Access Control policies. Switch user identities to simulate client compliance boundaries or spin up dynamic custom roles with custom lesson permissions.
                </p>
              </div>
              <button
                onClick={() => setShowRbacSettings(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Lessons
              </button>
            </div>

            {rbacNotification && (
              <div className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs py-3 px-4 rounded-lg flex items-center gap-2 animate-fadeIn font-mono">
                <Check className="w-4 h-4 animate-bounce" />
                <span>{rbacNotification}</span>
              </div>
            )}

            {/* Grid for policy listings and custom role creator */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Left Column: Role Directory (7 cols) */}
              <div className="xl:col-span-7 space-y-6">
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Enterprise Roles Directory & Policies
                  </h3>
                  
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {/* Default roles list */}
                    {Object.keys(ROLE_VISIBILITY_RULES).map((roleName) => {
                      const permissionsList = ROLE_VISIBILITY_RULES[roleName as AcademyRole];
                      const isAc = activeRole === roleName;
                      return (
                        <div 
                          key={roleName}
                          className={`p-3.5 rounded-lg border transition-all ${
                            isAc 
                              ? "bg-blue-950/30 border-blue-800/80 shadow-md shadow-blue-950/40" 
                              : "bg-slate-950/60 border-slate-900"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3 text-left">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-white">{roleName}</span>
                                {isAc && (
                                  <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded font-black font-mono">
                                    Active Simulation Identity
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">
                                {ROLE_DESCRIPTION_MAP[roleName as AcademyRole] || "Default preconfigured standard enterprise policy model."}
                              </p>
                            </div>
                            {!isAc && (
                              <button
                                onClick={() => {
                                  setActiveRole(roleName);
                                  setRbacNotification(`Simulated profile updated to: ${roleName}`);
                                  setTimeout(() => setRbacNotification(""), 3000);
                                }}
                                className="px-2.5 py-1 text-[10px] font-mono text-blue-400 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-900/30 rounded cursor-pointer transition-all shrink-0"
                              >
                                Test Role
                              </button>
                            )}
                          </div>
                          
                          <div className="mt-3 pt-2.5 border-t border-slate-900/50 flex flex-wrap items-center gap-1.5">
                            <span className="text-[9px] font-mono uppercase text-slate-500 mr-1.5">Authorized Level:</span>
                            {permissionsList.map((vis) => (
                              <span 
                                key={vis}
                                className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-405 px-1.5 py-0.5 rounded"
                              >
                                {vis}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Custom roles listing */}
                    {(Object.values(customRoles) as CustomRoleDefinition[]).map((cr) => {
                      const isAc = activeRole === cr.name;
                      return (
                        <div 
                          key={cr.name}
                          className={`p-3.5 rounded-lg border transition-all ${
                            isAc 
                              ? "bg-blue-950/30 border-blue-800/80 shadow-md shadow-blue-950/40" 
                              : "bg-slate-950/60 border-slate-900"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="text-left">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-black text-white">{cr.name}</span>
                                <span className="text-[9px] font-mono uppercase bg-purple-950 text-purple-400 border border-purple-900/30 px-1.5 py-0.5 rounded font-black leading-none">
                                  Custom Role (Saved)
                                </span>
                                {isAc && (
                                  <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded font-black px-1 leading-none py-0.2">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-sans mt-2 leading-relaxed">
                                {cr.description || "Database persistent user custom role definitions."}
                              </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              {!isAc && (
                                <button
                                  onClick={() => {
                                    setActiveRole(cr.name);
                                    setRbacNotification(`Simulated profile updated to: ${cr.name}`);
                                    setTimeout(() => setRbacNotification(""), 3000);
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-mono text-blue-400 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-900/30 rounded cursor-pointer transition-all"
                                >
                                  Test
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  const updated = { ...customRoles };
                                  delete updated[cr.name];
                                  setCustomRoles(updated);
                                  saveStoredCustomRoles(updated);
                                  if (activeRole === cr.name) {
                                    setActiveRole("Super Administrator");
                                  }
                                  setRbacNotification(`Role "${cr.name}" removed successfully.`);
                                  setTimeout(() => setRbacNotification(""), 3000);
                                }}
                                className="px-2 py-1 text-[10px] font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 bg-slate-950 border border-rose-950 rounded cursor-pointer transition-all"
                                title="Delete Custom Role"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-2.5 border-t border-slate-900/50 flex flex-wrap items-center gap-1.5 font-mono">
                            <span className="text-[9px] font-mono uppercase text-slate-500 mr-1.5">Allowed Lessons:</span>
                            <span className="text-[9px] font-mono bg-purple-950/40 border border-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded font-black leading-none">
                              {cr.allowedLessonIds.length} of {lessons.length} Modules
                            </span>
                            <div className="text-[9px] text-slate-500 line-clamp-1 truncate max-w-sm">
                              ({cr.allowedLessonIds.join(", ")})
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Custom Role Creator (5 cols) */}
              <div className="xl:col-span-5 space-y-6">
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
                  <div className="space-y-1 text-left">
                    <h3 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Dynamic Custom Role Creator
                    </h3>
                    <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                      Establish custom role records securely inside current database state tables.
                    </p>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Role Name / Handle</label>
                    <input
                      type="text"
                      placeholder="e.g., Compliance Auditor-1"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* Description field */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Description</label>
                    <textarea
                      placeholder="e.g., Handles network privacy compliance reports."
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  {/* Lessons selection checklist */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-950 px-2 py-1 border border-slate-850 rounded">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Topic Permissions ({newRoleLessons.length})</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewRoleLessons(lessons.map(l => l.id))}
                          className="text-[9px] font-mono text-blue-400 hover:underline cursor-pointer"
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRoleLessons(["intro"])}
                          className="text-[9px] font-mono text-slate-500 hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    
                    <div className="h-44 overflow-y-auto border border-slate-900 rounded-lg p-2.5 bg-slate-950/50 space-y-1.5 scrollbar-thin">
                      {lessons.map((lesson) => {
                        const isChecked = newRoleLessons.includes(lesson.id);
                        return (
                          <label 
                            key={lesson.id}
                            className="flex items-center gap-2 cursor-pointer py-1 hover:bg-slate-900/40 rounded px-1 min-w-0"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setNewRoleLessons(newRoleLessons.filter(id => id !== lesson.id));
                                } else {
                                  setNewRoleLessons([...newRoleLessons, lesson.id]);
                                }
                              }}
                              className="rounded border-slate-800 text-blue-500 bg-slate-1000 focus:ring-blue-500 focus:ring-offset-slate-950 h-3.5 w-3.5 cursor-pointer shrink-0"
                            />
                            <div className="min-w-0 leading-none text-left">
                              <span className="font-mono text-[10px] font-black block text-slate-300 truncate">{lesson.title}</span>
                              <span className="text-[8px] font-mono text-slate-500 uppercase font-bold pr-1">{LESSON_VISIBILITY_MAP[lesson.id]} Mode</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submission */}
                  <button
                    onClick={() => {
                      const trimmedName = newRoleName.trim();
                      if (!trimmedName) {
                        alert("Please provide a valid role name string.");
                        return;
                      }
                      if (ROLE_VISIBILITY_RULES[trimmedName as AcademyRole]) {
                        alert("Cannot overwrite default core enterprise roles.");
                        return;
                      }
                      
                      const newRoleDef: CustomRoleDefinition = {
                        name: trimmedName,
                        isCustom: true,
                        allowedLessonIds: newRoleLessons,
                        description: newRoleDesc.trim() || undefined
                      };

                      const updated = { ...customRoles, [trimmedName]: newRoleDef };
                      setCustomRoles(updated);
                      saveStoredCustomRoles(updated);
                      
                      setNewRoleName("");
                      setNewRoleDesc("");
                      setNewRoleLessons(["intro", "developer_sdk"]);
                      setRbacNotification(`Role "${trimmedName}" created and persistent in database!`);
                      setTimeout(() => setRbacNotification(""), 3000);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all shadow-lg active:scale-[0.98] text-center"
                  >
                    Save Custom Role Record
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : !canRoleAccessLesson(activeRole, activeLesson.id, customRoles) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-950/40 border border-rose-800 flex items-center justify-center shadow-lg shadow-rose-950/50 animate-pulse mt-8">
              <Lock className="w-8 h-8 text-rose-500" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase bg-rose-950/60 text-rose-400 border border-rose-900/30 px-2.5 py-1 rounded font-bold font-mono">
                SECURE ACCESS PROTOCOL BLOCKED
              </span>
              <h2 className="text-xl font-mono font-extrabold text-white tracking-tight">
                Section Level Restricted
              </h2>
            </div>

            <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 text-left w-full space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-3">
                <span className="text-slate-400">Target Resource:</span>
                <span className="text-white text-right font-bold">{activeLesson.title}</span>
                <span className="text-slate-400">Class Rating:</span>
                <span className="text-blue-400 text-right font-bold uppercase">{LESSON_VISIBILITY_MAP[activeLesson.id] || "Super Admin"} Level</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-400">Authenticated Identity:</span>
                <span className="text-amber-400 text-right font-bold">{activeRole}</span>
                <span className="text-slate-400">Permission Check:</span>
                <span className="text-rose-500 text-right font-bold">DENIED </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-sans text-slate-400 leading-relaxed">
              Explain This Integration error: You do not have permission to view the technical specifications, database architecture, or endpoints for <strong className="text-slate-200">"{activeLesson.title}"</strong> under your current simulated role profiles.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                onClick={() => {
                  // Switch to a role that's authorized to view this
                  const requiredLevel = LESSON_VISIBILITY_MAP[activeLesson.id] || "Super Admin";
                  let recommendedRole = "Super Administrator";
                  
                  // Simple matching to see what works
                  if (requiredLevel === "Public") recommendedRole = "Guest";
                  else if (requiredLevel === "Developer") recommendedRole = "Developer";
                  else if (requiredLevel === "Partner") recommendedRole = "Partner Administrator";
                  else if (requiredLevel === "Organization") recommendedRole = "Organization Administrator";
                  else if (requiredLevel === "Support") recommendedRole = "Support";
                  else if (requiredLevel === "Security") recommendedRole = "Security Analyst";
                  else if (requiredLevel === "Internal") recommendedRole = "Internal Engineer";
                  else if (requiredLevel === "Executive") recommendedRole = "Executive";
                  
                  setActiveRole(recommendedRole);
                }}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-mono text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                Switch Role to Authorized Profile
              </button>
              <button
                onClick={() => setShowRbacSettings(true)}
                className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 font-mono text-xs font-bold transition-all hover:border-slate-700 cursor-pointer"
              >
                Configure Custom Policies
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Topic Banner Header */}
            <div className="p-6 border-b border-slate-900/40 bg-slate-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-extrabold bg-blue-950/80 px-2 py-0.5 border border-blue-900/40 rounded">
                Category: {activeLesson.category.replace("-", " & ").toUpperCase()}
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-900/85 px-2 py-0.5 rounded">
                Version: {activeLesson.version}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                activeLesson.status === "Production Ready" 
                  ? "bg-emerald-950/60 border-emerald-900/40 text-emerald-400" 
                  : activeLesson.status === "MVP"
                  ? "bg-blue-950/60 border-blue-900/40 text-blue-400"
                  : "bg-amber-950/60 border-amber-900/40 text-amber-400"
              }`}>
                {activeLesson.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-mono tracking-tight font-extrabold text-white">
              {activeLesson.title}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 select-none">
            {/* Completion checkbox toggler */}
            <button
              onClick={() => toggleLessonCompleted(activeLesson.id)}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                completedLessons[activeLesson.id]
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {completedLessons[activeLesson.id] ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Topic Completed</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </>
              )}
            </button>
            
            {/* Action trigger to Sandbox view */}
            {onNavigatePage && activeLesson.id !== "intro" && (
              <button
                onClick={() => {
                  const viewMap: Record<string, string> = {
                    organizations: "admin",
                    projects: "partner",
                    users: "admin",
                    api_keys: "partner",
                    verification_sessions: "verify",
                    duplicate_detection: "admin",
                    device_trust: "admin",
                    webhook_system: "partner",
                    audit_logs: "admin",
                    partner_dashboard: "partner",
                  };
                  onNavigatePage(viewMap[activeLesson.id] || "landing");
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <Terminal className="w-4 h-4" />
                <span>Test in Sandbox</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tabs: Learn Content vs. Quiz Check */}
        <div className="border-b border-slate-900 flex px-6 select-none">
          <button
            onClick={() => setActiveTab("learn")}
            className={`px-4 py-3 text-xs font-mono font-bold border-b-2 uppercase tracking-wide cursor-pointer transition-colors ${
              activeTab === "learn" 
                ? "border-blue-500 text-blue-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
             Learn Lesson
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-3 text-xs font-mono font-bold border-b-2 uppercase tracking-wide cursor-pointer transition-colors ${
              activeTab === "quiz" 
                ? "border-blue-500 text-blue-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
             Knowledge Test
          </button>
        </div>

        {/*  VIEWPORT SCROLL FOR CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
          
          {activeTab === "learn" ? (
            <>
              {/* Highlight Overlay: Overview Text */}
              <div className="bg-slate-900/30 border-l-4 border-blue-500 p-4 rounded-r-lg space-y-1">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-extrabold">OVERVIEW</span>
                <p className="text-sm font-sans text-slate-300 leading-relaxed font-medium">
                  {activeLesson.overview}
                </p>
              </div>

              {/* 1. WHY THIS EXISTS */}
              <div className="space-y-2">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold">
                  1. Why This Exists / Problem Statement
                </h3>
                <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
                  {activeLesson.whyExists}
                </p>
              </div>

              {/* 2. PLAIN ENGLISH ANALOGY */}
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-extrabold flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5" />
                  2. Plain English explanation (Analogy): {activeLesson.plainEnglish.analogy}
                </span>
                <p className="text-xs sm:text-sm font-sans italic text-slate-400 leading-relaxed pl-3 border-l-2 border-slate-800">
                  "{activeLesson.plainEnglish.analogyText}"
                </p>
                <p className="text-xs sm:text-sm font-sans text-slate-200 leading-relaxed">
                  {activeLesson.plainEnglish.simplifiedText}
                </p>
              </div>

              {/* 3. TECHNICAL EXPLANATION */}
              <div className="space-y-4">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold">
                  3. Under the Hood (Technical Math)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Process Inputs & Outputs</span>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300 font-sans">
                      {activeLesson.technicalExplanation.inputs.map((inp, idx) => (
                        <li key={idx}><span className="font-semibold text-slate-300">Input:</span> {inp}</li>
                      ))}
                      {activeLesson.technicalExplanation.outputs?.map((out, idx) => (
                        <li key={idx}><span className="font-semibold text-slate-300">Output:</span> {out}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Key Libraries & Controls</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeLesson.technicalExplanation.dependencies.map((dep, idx) => (
                        <span key={idx} className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded font-mono border border-slate-800">
                          {dep}
                        </span>
                      ))}
                    </div>
                    <ul className="text-xs space-y-1.5 text-slate-300 font-sans mt-2">
                      {activeLesson.technicalExplanation.security?.map((sec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{sec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Logical Flow Description</span>
                  <div className="space-y-1.5">
                    {activeLesson.technicalExplanation.processing.map((proc, idx) => (
                      <p key={idx} className="text-xs text-slate-300 font-sans leading-relaxed">
                        <span className="text-blue-400 font-mono font-bold mr-1">{`[Step ${idx + 1}]`}</span> {proc}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. HIGH FIDELITY SYSTEM WORKFLOW */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold">
                  4. High-Fidelity Sequence Workflow
                </h3>
                <div className="bg-slate-900/20 border border-slate-850/80 p-5 rounded-xl space-y-4">
                  <span className="text-[10px] font-mono text-blue-500 uppercase tracking-wider block font-bold">Sequential Execution Path</span>
                  <div className="relative pl-6 space-y-4">
                    {activeLesson.workflow.map((step, idx) => (
                      <div key={idx} className="relative flex items-start gap-3">
                        {/* Timeline dot */}
                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-slate-950" />
                        {idx !== activeLesson.workflow.length - 1 && (
                          <div className="absolute -left-5 top-3 w-0.5 h-6 bg-slate-800" />
                        )}
                        <span className="text-xs font-mono text-slate-500 font-bold shrink-0">{`0${idx + 1}.`}</span>
                        <p className="text-xs sm:text-sm font-sans text-slate-300 font-medium">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. DYNAMIC INTERACTIVE VISUAL SIMULATORS FOR KEY TOPICS */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  5. Interactive Sandbox Simulator Widget
                </h3>
                
                {activeLesson.id === "risk_engine" ? (
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase">Risk Evaluation Simulator</span>
                      <span className="text-[10px] font-mono text-slate-400">Toggle parameters to view computed risk output</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Control checkbox buttons */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Threat Indicators Context</span>
                        <div className="space-y-1.5 select-none">
                          <label className="flex items-center gap-2 text-xs text-slate-300 font-sans cursor-pointer hover:text-white transition-colors">
                            <input 
                              type="checkbox"
                              checked={riskEngineInputs.failedLiveness}
                              onChange={(e) => setRiskEngineInputs(p => ({ ...p, failedLiveness: e.target.checked }))}
                              className="accent-slate-250 w-3.5 h-3.5"
                            />
                            <span>Failed Liveness (+55 Risk)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-300 font-sans cursor-pointer hover:text-white transition-colors">
                            <input 
                              type="checkbox"
                              checked={riskEngineInputs.duplicateHash}
                              onChange={(e) => setRiskEngineInputs(p => ({ ...p, duplicateHash: e.target.checked }))}
                              className="accent-slate-250 w-3.5 h-3.5"
                            />
                            <span>Duplicate Biometric Template (+40 Risk)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-300 font-sans cursor-pointer hover:text-white transition-colors">
                            <input 
                              type="checkbox"
                              checked={riskEngineInputs.manyDeviceAccounts}
                              onChange={(e) => setRiskEngineInputs(p => ({ ...p, manyDeviceAccounts: e.target.checked }))}
                              className="accent-slate-250 w-3.5 h-3.5"
                            />
                            <span>Many Accounts on One Device (+25 Risk)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-300 font-sans cursor-pointer hover:text-white transition-colors">
                            <input 
                              type="checkbox"
                              checked={riskEngineInputs.newDeviceExistingUser}
                              onChange={(e) => setRiskEngineInputs(p => ({ ...p, newDeviceExistingUser: e.target.checked }))}
                              className="accent-slate-250 w-3.5 h-3.5"
                            />
                            <span>New Device on Existing User (+15 Risk)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-300 font-sans cursor-pointer hover:text-white transition-colors">
                            <input 
                              type="checkbox"
                              checked={riskEngineInputs.rapidAttempts}
                              onChange={(e) => setRiskEngineInputs(p => ({ ...p, rapidAttempts: e.target.checked }))}
                              className="accent-slate-250 w-3.5 h-3.5"
                            />
                            <span>Rapid repeated attempts (+20 Risk)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-300 font-sans cursor-pointer hover:text-white transition-colors">
                            <input 
                              type="checkbox"
                              checked={riskEngineInputs.missingConsent}
                              onChange={(e) => setRiskEngineInputs(p => ({ ...p, missingConsent: e.target.checked }))}
                              className="accent-slate-250 w-3.5 h-3.5"
                            />
                            <span>Missing Consent Check (+100 Risk)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-300 font-sans cursor-pointer hover:text-white transition-colors">
                            <input 
                              type="checkbox"
                              checked={riskEngineInputs.expiredSession}
                              onChange={(e) => setRiskEngineInputs(p => ({ ...p, expiredSession: e.target.checked }))}
                              className="accent-slate-250 w-3.5 h-3.5"
                            />
                            <span>Expired Session (+30 Risk)</span>
                          </label>
                        </div>
                      </div>

                      {/* Score Result Gauge */}
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Live Computed Metric Result</span>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-mono font-bold tracking-tight ${
                              calculatedRisk.score >= 70 ? "text-rose-400" : calculatedRisk.score >= 40 ? "text-amber-400" : "text-emerald-400"
                            }`}>
                              {calculatedRisk.score}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">/ 100 Risk pts</span>
                          </div>
                          
                          <div className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded border inline-block ${calculatedRisk.colorClass}`}>
                            Status: {calculatedRisk.tier.replace(/_/g, " ")}
                          </div>
                        </div>

                        <div className="space-y-1 mt-4">
                          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Applied Risk Flags</span>
                          {calculatedRisk.factors.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No suspicious indicators checked. Score normal.</p>
                          ) : (
                            <ul className="text-[10px] text-slate-300 font-mono space-y-1">
                              {calculatedRisk.factors.map((f, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className="text-rose-500"></span>
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeLesson.id === "api_keys" ? (
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase">One-way API Key Hashing Simulator</span>
                      <span className="text-[10px] font-mono text-slate-400">Interact to understand why secret keys can never be leaked</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Pass Plaintext Bearer API Key String</label>
                        <input
                          type="text"
                          value={apiKeyPlaintext}
                          onChange={(e) => setApiKeyPlaintext(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 font-mono text-xs rounded-lg py-2 px-3 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1.5">
                          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">1. Plain Value Displayed</span>
                          <p className="text-xs font-mono bg-slate-900 p-2.5 rounded border border-slate-800 select-all font-semibold text-slate-300 break-all leading-normal">
                            {apiKeyPlaintext || <span className="text-slate-400">No key typed...</span>}
                          </p>
                          <span className="text-[9px] text-slate-500 font-sans block leading-relaxed">
                            This plaintext value is only generated once inside browser interfaces. If closed, it can never be rendered or reconstructed again.
                          </span>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1.5">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">2. SHA-256 Hashed Postgres Value</span>
                          <p className="text-xs font-mono bg-slate-900 p-2.5 rounded border border-slate-800 font-semibold text-slate-300 break-all leading-normal">
                            {apiKeyHashed}
                          </p>
                          <span className="text-[9px] text-slate-500 font-sans block leading-relaxed">
                            Only this hashed representation is saved inside the <span className="font-mono bg-slate-900 px-1 py-0.5 rounded text-[8px] text-slate-300">partner_apps.api_key_hash</span> SQL column.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeLesson.id === "webhook_system" ? (
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase">Webhook Payload Dispatcher Simulator</span>
                      <span className="text-[10px] font-mono text-slate-400">Trigger test hooks to simulate developer integration</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Controls parameters */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Select Event Type</label>
                          <select 
                            value={simulatedWebhookEvent}
                            onChange={(e) => setSimulatedWebhookEvent(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 font-mono text-xs rounded-lg py-2 px-3 text-slate-300 focus:outline-none cursor-pointer"
                          >
                            <option value="session.completed">session.completed (User Scanned Green)</option>
                            <option value="session.failed">session.failed (User Red Risk Spike)</option>
                            <option value="key.rotated">key.rotated (Partner API Key Re-hashed)</option>
                            <option value="proof.validated">proof.validated (Cryptographic Token Verified)</option>
                          </select>
                        </div>

                        <button
                          onClick={executeSimulatedWebhook}
                          disabled={simulatedWebhookLoading}
                          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {simulatedWebhookLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-white" />
                              <span>Dispatching Hook...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 text-white" />
                              <span>Dispatch Mock Webhook</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Webhook Response Console */}
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col justify-between min-h-36">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Simulator Response Terminal</span>
                          {simulatedWebhookLoading ? (
                            <p className="text-xs font-mono text-blue-400 animate-pulse italic">Awaiting response handshake from virtual server url...</p>
                          ) : simulatedWebhookResponse ? (
                            <pre className="text-[10px] font-mono bg-slate-900 border border-slate-800/80 rounded p-2.5 text-slate-300 overflow-x-auto leading-normal">
                              {simulatedWebhookResponse}
                            </pre>
                          ) : (
                            <p className="text-xs font-mono text-slate-500 italic">No webhook dispatched. Click button to fire.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // General topic simulator
                  <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-950 border border-blue-900/30 rounded-lg text-blue-400">
                        <Brain className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Continuous Assessment Simulator</span>
                        <p className="text-xs text-slate-300 font-sans">
                          AAN implements live compliance sandboxing. Use the <strong className="font-mono text-slate-200">Knowledge Test</strong> sub-tab above to certify complete understanding.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. DATABASE SCHEMA DEFINITION */}
              {activeLesson.databaseTables && activeLesson.databaseTables.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400 animate-none shrink-0" />
                    6. Database Schemas / Supabase Tables Context
                  </h3>
                  
                  <div className="space-y-4">
                    {activeLesson.databaseTables.map((table, idx) => (
                      <div key={idx} className="bg-slate-900/45 p-5 rounded-xl border border-slate-800/80">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-950 text-blue-400 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-blue-900/40">
                              Table: {table.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            Relation rules: {table.relationships}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-sans text-slate-300 mb-3 font-medium">
                          {table.purpose}
                        </p>

                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">SQL Columns Layout</span>
                          <div className="flex flex-wrap gap-1.5">
                            {table.columns.map((col, cIdx) => (
                              <span key={cIdx} className="bg-slate-950 text-slate-300 font-mono text-[10px] px-2 py-1 rounded border border-slate-850">
                                {col}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. SECURE REST API ENDPOINTS */}
              {activeLesson.apiEndpoints && activeLesson.apiEndpoints.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-400 shrink-0" />
                    7. Rest API Specifications
                  </h3>
                  
                  <div className="space-y-4">
                    {activeLesson.apiEndpoints.map((api, idx) => (
                      <div key={idx} className="bg-slate-900/45 p-5 rounded-xl border border-slate-800/80 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`font-mono text-xs font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                              api.method === "POST" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/40" : api.method === "DELETE" ? "bg-rose-950 text-rose-400 border border-rose-900/40" : "bg-emerald-950 text-emerald-400 border border-emerald-900/40"
                            }`}>
                              {api.method}
                            </span>
                            <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">
                              {api.path}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            Auth Req: {api.auth}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-sans text-slate-300 font-medium">
                          {api.purpose}
                        </p>

                        {api.payload && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Request JSON Payload Params</span>
                            <pre className="text-[10px] font-mono bg-slate-950 border border-slate-850 p-2.5 rounded text-slate-300 overflow-x-auto select-all leading-normal">
                              {api.payload}
                            </pre>
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">HTTP Response Payload Example</span>
                          <pre className="text-[10px] font-mono bg-slate-950 border border-slate-850 p-2.5 rounded text-slate-300 overflow-x-auto select-all leading-normal">
                            {api.response}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. DASHBOARD INTEGRATIONS */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold">
                  8. Dashboard Navigation & Integrations
                </h3>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">UI Path Location</span>
                      <p className="text-xs sm:text-sm font-sans text-slate-200 font-medium">
                        {activeLesson.dashboardIntegration.location}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Access Permissions Required</span>
                      <ul className="text-xs font-sans text-slate-300 list-inside list-disc">
                        {activeLesson.dashboardIntegration.permissions.map((perm, pIdx) => (
                          <li key={pIdx}>{perm}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Available Dynamic Actions</span>
                      <ul className="text-xs font-sans text-slate-300 space-y-1.5">
                        {activeLesson.dashboardIntegration.actions.map((act, aIdx) => (
                          <li key={aIdx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-blue-500 rounded-full shrink-0" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">UI Diagnostic Metrics</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeLesson.dashboardIntegration.metrics?.map((met, mIdx) => (
                          <span key={mIdx} className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded font-mono border border-slate-800">
                            {met}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 9. SECURITY MODEL */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400 shrink-0" />
                  9. Security Model & GDPR Compliance Parameters
                </h3>
                <div className="bg-slate-900/45 p-6 rounded-xl border border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-rose-400 uppercase block font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Key Vulnerability Risks Targeted
                      </span>
                      <ul className="text-xs font-sans text-slate-300 space-y-1.5">
                        {activeLesson.securityModel.risks.map((risk, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-rose-500 font-bold shrink-0"></span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">GDPR Privacy & Masking Rules</span>
                      <ul className="text-xs font-sans text-slate-300 space-y-1.5">
                        {activeLesson.securityModel.privacy.map((priv, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-emerald-500 font-bold shrink-0"></span>
                            <span>{priv}</span>
                          </li>
                        ))}
                        {activeLesson.securityModel.hiddenData.map((hid, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-1.5 leading-relaxed italic text-slate-400">
                            <span className="font-bold text-slate-500 shrink-0">○</span>
                            <span>Securely Masked: {hid}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Authentication Hooks Required</span>
                      <p className="text-xs sm:text-sm font-sans text-slate-200">
                        {activeLesson.securityModel.authReq}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Validation Limitations/Exceptions</span>
                      <p className="text-xs sm:text-sm font-sans text-slate-400 leading-relaxed italic">
                        {activeLesson.securityModel.limitations?.join(", ") || activeLesson.securityModel.limitations}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 10. MULTI-DIMENSIONAL ENTERPRISE VALUE */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold">
                  10. Multi-Dimensional Enterprise Value
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1">
                    <span className="text-[9px] font-mono text-blue-400 uppercase block font-extrabold">Executive / Admin Value</span>
                    <p className="text-xs font-sans text-slate-300 leading-normal">
                      {activeLesson.enterpriseValue.administrative}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1">
                    <span className="text-[9px] font-mono text-blue-400 uppercase block font-extrabold">Security / compliance Value</span>
                    <p className="text-xs font-sans text-slate-300 leading-normal">
                      {activeLesson.enterpriseValue.security}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1">
                    <span className="text-[9px] font-mono text-blue-400 uppercase block font-extrabold">Developer Integration Value</span>
                    <p className="text-xs font-sans text-slate-300 leading-normal">
                      {activeLesson.enterpriseValue.developer}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1">
                    <span className="text-[9px] font-mono text-blue-400 uppercase block font-extrabold">Operational & SRE Value</span>
                    <p className="text-xs font-sans text-slate-300 leading-normal">
                      {activeLesson.enterpriseValue.operational}
                    </p>
                  </div>

                </div>
              </div>

              {/* 11. MVP LIMITATIONS */}
              <div className="space-y-2 border-t border-slate-90s pt-4">
                <h3 className="text-sm font-mono text-rose-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold">
                  11. Sandbox MVP Limits / Gaps
                </h3>
                <p className="text-xs sm:text-sm font-mono text-rose-300 bg-rose-950/20 p-4 rounded-lg border border-rose-950/35 leading-relaxed">
                  <u className="font-extrabold uppercase">MOCK IMPLEMENTATION NOTICE:</u> {activeLesson.mvpLimitations}
                </p>
              </div>

              {/* 12. REAL-WORLD SCALABILITY & FUTURE IMPROVEMENTS */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold">
                  12. Real-World Scalability Roadmap
                </h3>
                <div className="space-y-2.5">
                  {activeLesson.futureImprovements?.map((imp, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex items-start gap-3">
                      <span className="text-xs font-mono font-bold bg-slate-900 text-blue-400 px-2 py-0.5 rounded border border-slate-800">
                        {imp.phase}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-mono font-bold text-slate-200">
                          {imp.title}
                        </h4>
                        <p className="text-[11px] font-sans text-slate-400 leading-normal">
                          {imp.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 13. HYPER-SPECIFIC GLOSSARY KEYWORDS */}
              {activeLesson.glossary && activeLesson.glossary.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1 font-extrabold">
                    13. Technical Glossary References
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeLesson.glossary.map((glo, gIdx) => (
                      <div key={gIdx} className="bg-slate-900/10 p-4 rounded-lg border border-slate-900 space-y-1">
                        <dt className="text-xs font-mono font-bold text-blue-400">{glo.term}</dt>
                        <dd className="text-xs font-sans text-slate-300 leading-normal">{glo.definition}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 14. RELATED LESSONS LINKS */}
              {activeLesson.relatedLessons && activeLesson.relatedLessons.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">14. Traverse Document Trees (Related Topics)</span>
                  <div className="flex flex-wrap gap-2">
                    {activeLesson.relatedLessons.map((relId, idx) => {
                      const found = lessons.find(l => l.id === relId);
                      if (!found) return null;
                      return (
                        <button
                          key={`${relId}-${idx}`}
                          onClick={() => handleSelectLessonById(relId)}
                          className="text-xs font-mono bg-slate-900 hover:bg-slate-850 text-blue-300 border border-slate-800 rounded-lg px-3 py-1.5 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>{found.title}</span>
                          <ChevronRight className="w-3 h-3 text-slate-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /*  SUB-TAB: QUIZ KNOWLEDGE CHECK */
            <div className="space-y-6">
              <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-extrabold">CONCEPTS TEST</span>
                <p className="text-xs text-slate-400 leading-normal font-sans">
                  Solve the following assessment containing hyper-specific situations to certify key understanding of {activeLesson.title}.
                </p>
              </div>

              {activeLesson.knowledgeCheck.map((quiz, qIdx) => {
                const uniqueKey = `${activeLesson.id}_${qIdx}`;
                const selectedOption = quizAnswers[uniqueKey];
                const submitted = quizSubmitted[uniqueKey];
                const isCorrect = selectedOption === quiz.answerIndex;

                return (
                  <div key={qIdx} className="bg-slate-900/40 p-5 sm:p-6 rounded-xl border border-slate-800 space-y-4">
                    <span className="text-xs font-mono font-extrabold text-blue-400 uppercase">{`QUESTION 0${qIdx + 1}`}</span>
                    <h3 className="text-sm sm:text-base font-sans font-bold text-white leading-relaxed">
                      {quiz.question}
                    </h3>

                    <div className="space-y-2 select-none">
                      {quiz.options.map((option, oIdx) => {
                        const isChosen = selectedOption === oIdx;
                        let optionStyle = "bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700 hover:text-white";
                        
                        if (submitted) {
                          if (oIdx === quiz.answerIndex) {
                            optionStyle = "bg-emerald-950/45 border-emerald-500 text-emerald-400 font-semibold";
                          } else if (isChosen) {
                            optionStyle = "bg-rose-950/45 border-rose-500 text-rose-400 font-semibold";
                          } else {
                            optionStyle = "bg-slate-950/30 border-slate-900 text-slate-500 cursor-not-allowed";
                          }
                        } else if (isChosen) {
                          optionStyle = "bg-blue-950/50 border-blue-500 text-blue-400 font-bold";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={submitted}
                            onClick={() => handleQuizAnswer(qIdx, oIdx)}
                            className={`w-full text-left p-3 rounded-lg text-xs leading-relaxed border transition-all flex items-start gap-2.5 cursor-pointer ${optionStyle}`}
                          >
                            <span className="font-mono font-black shrink-0 text-slate-500">{`${String.fromCharCode(65 + oIdx)}.`}</span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {!submitted ? (
                      <button
                        onClick={() => submitQuiz(qIdx)}
                        disabled={selectedOption === undefined}
                        className="py-2 px-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-bold uppercase rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                      >
                        Submit Response
                      </button>
                    ) : (
                      <div className={`p-4 rounded-lg border leading-relaxed space-y-1.5 ${
                        isCorrect ? "bg-emerald-950/20 border-emerald-900/35 text-emerald-400" : "bg-rose-950/20 border-rose-900/35 text-rose-300"
                      }`}>
                        <div className="flex items-center gap-2 font-mono text-xs font-black uppercase">
                          {isCorrect ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                              <span>Response Correct!</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4 text-rose-400 fill-rose-950" />
                              <span>Incorrect Choice</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs font-sans text-slate-300">
                          {quiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
