import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Fingerprint, 
  Activity, 
  Code, 
  Lock, 
  CheckCircle, 
  Database, 
  EyeOff, 
  AlertTriangle, 
  ArrowRight, 
  Server, 
  Terminal, 
  FileCode, 
  Copy, 
  Check, 
  Cpu, 
  RefreshCw, 
  BarChart2, 
  Layers, 
  BookOpen, 
  Globe, 
  Info, 
  DollarSign, 
  ExternalLink, 
  ChevronRight, 
  Play, 
  Key,
  Sliders,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string, customPath?: string) => void;
  onStartDemoSession: () => void;
}

// Interactive API Playground Examples mapped in 9 target languages
const PLAYGROUND_EXAMPLES: Record<string, { desc: string, filename: string, code: string }> = {
  javascript: {
    desc: "Create and dispatch an ephemeral verification redirect using vanilla modern ES6 Javascript.",
    filename: "aan_initialize.js",
    code: `// Initialize authentication checks
const response = await fetch('https://api.aan.com/v1/verification-sessions', {
  method: 'POST',
  headers: {
    'x-api-key': 'aan_key_live_89a3df0f',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    external_user_id: 'usr_saas_99018',
    verification_level: 'human_unique',
    success_callback: 'https://app.client.com/callback'
  })
});

const session = await response.json();
console.log(\`Verification URL: \${session.verification_url}\`);`
  },
  typescript: {
    desc: "Robust, strongly-typed integration utilizing standard AAN interface declarations.",
    filename: "aan_verify.ts",
    code: `import { AANClient, VerificationResponse } from '@aan-io/sdk-node';

const client = new AANClient({
  apiKey: process.env.AAN_API_KEY as string,
  environment: 'production'
});

async function initiateVerification(userId: string): Promise<string> {
  const session: VerificationResponse = await client.sessions.create({
    externalUserId: userId,
    verificationLevel: 'human_unique'
  });
  
  return session.verificationUrl;
}`
  },
  python: {
    desc: "Clean script verification integration compatible with robust FastAPI or Django backends.",
    filename: "aan_auth.py",
    code: `import requests

headers = {
    "x-api-key": "aan_key_live_89a3df0f",
    "Content-Type": "application/json"
}

payload = {
    "external_user_id": "usr_python_231",
    "verification_level": "human_unique"
}

response = requests.post(
    "https://api.aan.com/v1/verification-sessions", 
    json=payload, 
    headers=headers
)

session_info = response.json()
print(f"Session ephemeral ID: {session_info['session_id']}")`
  },
  go: {
    desc: "High-performance enterprise microsecond network gateway integration using standard net/http.",
    filename: "aan_init.go",
    code: `package main

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func main() {
	payload := map[string]string{
		"external_user_id":   "usr_go_893b",
		"verification_level": "human_unique",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "https://api.aan.com/v1/verification-sessions", bytes.NewBuffer(body))
	req.Header.Set("x-api-key", "aan_key_live_89a3df0f")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()
}`
  },
  node: {
    desc: "NodeJS direct REST request wrapper utilising simple built-in asynchronous logic.",
    filename: "server_post.js",
    code: `const axios = require('axios');

async function createAANSession() {
  const response = await axios.post('https://api.aan.com/v1/verification-sessions', {
    external_user_id: 'usr_node_772',
    verification_level: 'human_unique'
  }, {
    headers: { 'x-api-key': 'aan_key_live_89a3df0f' }
  });
  
  return response.data.verification_url;
}`
  },
  swift: {
    desc: "Native secure iOS system authentication matching sandbox camera layers.",
    filename: "AANVerification.swift",
    code: `import Foundation

struct SessionRequest: Codable {
    let external_user_id: String
    let verification_level: String
}

func startAANSession() {
    let url = URL(string: "https://api.aan.com/v1/verification-sessions")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("aan_key_live_89a3df0f", forHTTPHeaderField: "x-api-key")
    
    let object = SessionRequest(external_user_id: "ios_user_78", verification_level: "human_unique")
    request.httpBody = try? JSONEncoder().encode(object)
    
    URLSession.shared.dataTask(with: request) { data, _, _ in
        // Handle native callback trigger
    }.resume()
}`
  },
  kotlin: {
    desc: "Android native biometric challenge dispatcher tailored for Android SDK 33+ bounds.",
    filename: "AANService.kt",
    code: `import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class AANService {
    private val client = OkHttpClient()

    fun createSession(userId: String) {
        val jsonPayload = """{"external_user_id":"$userId","verification_level":"human_unique"}"""
        val request = Request.Builder()
            .url("https://api.aan.com/v1/verification-sessions")
            .post(jsonPayload.toRequestBody())
            .addHeader("x-api-key", "aan_key_live_89a3df0f")
            .build()
            
        client.newCall(request).execute().use { response ->
            // Android camera context handshake
        }
    }
}`
  },
  java: {
    desc: "Robust back-end enterprise server setup for transactional system validations.",
    filename: "AANIntegration.java",
    code: `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class AANIntegration {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.aan.com/v1/verification-sessions"))
            .header("x-api-key", "aan_key_live_89a3df0f")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString("{\\"external_user_id\\":\\"java_901\\",\\"verification_level\\":\\"human_unique\\"}"))
            .build();
            
        client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}`
  },
  rust: {
    desc: "Zero-cost, highly-concurrent compile-bound integration optimized for fast, safe network gateways.",
    filename: "aan_client.rs",
    code: `use serde::{Serialize, Deserialize};

#[derive(Serialize)]
struct SessionPayload {
    external_user_id: String,
    verification_level: String,
}

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let client = reqwest::Client::new();
    let payload = SessionPayload {
        external_user_id: "rust_client_2a".to_owned(),
        verification_level: "human_unique".to_owned(),
    };

    let res = client.post("https://api.aan.com/v1/verification-sessions")
        .header("x-api-key", "aan_key_live_89a3df0f")
        .json(&payload)
        .send()
        .await?;
        
    Ok(())
}`
  }
};

// Documentation Navigation Tabs
const DOCS_NAV = [
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'rest_api', label: 'REST API' },
  { id: 'auth', label: 'Authentication' },
  { id: 'sdk', label: 'SDK Installation' },
  { id: 'limits', label: 'Rate Limits' },
  { id: 'errors', label: 'Error Codes' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'faq', label: 'Developer FAQ' }
];

export default function LandingPage({ onNavigate, onStartDemoSession }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<string>('platform'); // active overall sub-page view
  const [activePlaygroundLang, setActivePlaygroundLang] = useState<string>('typescript');
  const [activeDocSection, setActiveDocSection] = useState<string>('quickstart');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [playLang, setPlayLang] = useState<string>('curl');

  // Live telemetry state for dashboard simulation
  const [telemetry, setTelemetry] = useState({
    verificationRequests: 12482,
    successfulVerifications: 12109,
    pendingSessions: 34,
    avgProcessingTime: 0.12,
    riskEvents: 247,
    developerProjects: 84,
    apiHealth: '99.99%',
    systemStatus: 'OPERATIONAL'
  });

  // Tick the telemetry occasionally to feel alive while explicitly labeling it as mock/demo data
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => {
        const reqDiff = Math.floor(Math.random() * 4) + 1;
        const sccDiff = Math.random() > 0.3 ? reqDiff : reqDiff - 1;
        const pndDiff = Math.floor(Math.random() * 3) - 1;
        const latencyVary = parseFloat((0.11 + Math.random() * 0.02).toFixed(2));
        
        return {
          ...prev,
          verificationRequests: prev.verificationRequests + reqDiff,
          successfulVerifications: prev.successfulVerifications + sccDiff,
          pendingSessions: Math.max(10, prev.pendingSessions + pndDiff),
          avgProcessingTime: latencyVary,
          riskEvents: prev.riskEvents + (Math.random() > 0.85 ? 1 : 0)
        };
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-12">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-950/20 via-slate-950 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[50%] left-[5%] w-[350px] h-[350px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Global Notice Banner */}
      <div className="relative z-20 bg-blue-950/30 border-b border-blue-900/30 text-center py-2 px-4">
        <p className="text-[11px] font-mono text-blue-300 flex items-center justify-center gap-1.5 flex-wrap">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>AAN Platform v2.2 Sandbox Preview. All performance and telemetry indicators represent Sandbox Demo Data.</span>
          <button 
            onClick={() => onNavigate('brand')} 
            className="underline font-bold text-emerald-400 hover:text-emerald-300 ml-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
          >
            Review Brand Manual &rarr;
          </button>
        </p>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('platform')}>
            <div className="flex gap-1 items-end bg-slate-900 border border-slate-850 p-2 rounded-lg">
              <span className="w-2.5 h-6 bg-blue-600 rounded-sm" />
              <span className="w-2.5 h-8 bg-white rounded-sm" />
              <span className="w-2.5 h-4 bg-emerald-500 rounded-sm" />
            </div>
            <div>
              <span className="font-mono text-xs tracking-widest text-slate-400 uppercase leading-none block">AAN</span>
              <div className="font-sans font-bold text-sm leading-none text-white mt-1">Trust Infrastructure</div>
            </div>
          </div>
          {/* Mobile indicator spacer */}
          <span className="font-mono text-[9px] bg-slate-900 text-slate-500 py-1 px-2.5 rounded border border-slate-800 md:hidden">v2.2 Sandbox</span>
        </div>
        
        {/* Sub-platform Navigation Router tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg">
          {[
            { id: 'platform', label: 'Platform', group: ['platform', 'mission', 'architecture', 'playground', 'matrix', 'telemetry'] },
            { id: 'solutions', label: 'Sectors', group: ['solutions'] },
            { id: 'developers', label: 'Developers', group: ['developers'] },
            { id: 'trustcenter', label: 'Trust & Privacy', group: ['privacy-matrix', 'trustcenter'] },
            { id: 'pricing', label: 'Pricing', group: ['pricing'] }
          ].map(tab => {
            const isGroupActive = tab.group.includes(activeTab);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'developers') {
                    setActiveDocSection('quickstart');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isGroupActive 
                    ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setActiveTab('developers');
              setActiveDocSection('quickstart');
            }}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 font-mono transition-all hidden lg:inline-block"
          >
            Developer Docs
          </button>
          <button 
            onClick={() => onNavigate('partner')} 
            className="border border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs text-slate-300 px-3.5 py-2 rounded-md font-mono transition-all"
          >
            Get API Keys
          </button>
          <button 
            onClick={() => onNavigate('admin')} 
            className="bg-slate-100 hover:bg-white text-xs text-slate-950 px-3.5 py-2 rounded-md font-mono font-semibold transition-all shadow-sm"
          >
            Admin Console
          </button>
        </div>
      </nav>

      {/* RENDER PAGES DYNAMICALLY ACCORDING TO NAVIGATION */}

      {/* 11 TAB SEGMENTED DIRECTORY WRAPPER */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sticky Left Sidebar (Desktop, hidden on mobile) */}
        <aside className="lg:col-span-3 lg:block hidden sticky top-[110px] bg-slate-900/40 p-4 border border-slate-900 rounded-xl space-y-1">
          <div className="px-3 pb-2.5 mb-2.5 border-b border-slate-900 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Identity Workspace</span>
            <span className="text-[9px] bg-slate-950 font-semibold px-2 py-0.5 rounded border border-slate-800 text-blue-400">11 PAGES</span>
          </div>
          {[
            { id: 'platform', label: 'Platform Overview', icon: Layers, desc: 'Central hub' },
            { id: 'mission', label: 'Mission Statement', icon: HeartHandshake, desc: 'Our standard' },
            { id: 'architecture', label: 'Architecture Pipeline', icon: Cpu, desc: 'Flow layers' },
            { id: 'playground', label: 'API Playground', icon: Terminal, desc: 'REST requests' },
            { id: 'matrix', label: 'Capabilities Matrix', icon: Sliders, desc: 'AAN services' },
            { id: 'telemetry', label: 'Live Graph Feed', icon: Activity, desc: 'Simulated uptime' },
            { id: 'privacy-matrix', label: 'Trust & Privacy Matrix', icon: EyeOff, desc: 'Hardware boundaries' },
            { id: 'solutions', label: 'Sectors & Solutions', icon: Globe, desc: 'Use cases' },
            { id: 'developers', label: 'Developer Workspace', icon: Code, desc: 'Keys & logs' },
            { id: 'trustcenter', label: 'Trust Center Docs', icon: Shield, desc: 'Compliance' },
            { id: 'pricing', label: 'Pricing Matrix', icon: DollarSign, desc: 'Platform models' }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'developers') {
                    setActiveDocSection('quickstart');
                  }
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center justify-between group transition-all cursor-pointer ${
                  isSelected 
                    ? "bg-blue-900/80 text-white font-semibold border-l-4 border-l-blue-400 border border-slate-800 shadow-md shadow-blue-950/20" 
                    : "hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isSelected ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"
                  }`} />
                  <span className="text-xs font-sans tracking-tight truncate">{tab.label}</span>
                </div>
                <ChevronRight className={`w-3 h-3 text-slate-600 transition-transform ${
                  isSelected ? "translate-x-0.5 text-blue-400 block" : "hidden group-hover:block group-hover:translate-x-0.5"
                }`} />
              </button>
            );
          })}
        </aside>

        {/* Swipeable Horizontal Scroll Bar (Mobile & Tablet, hidden on desktop) */}
        <div className="lg:hidden col-span-1 border border-slate-900 bg-slate-900/20 p-2.5 rounded-xl">
          <div className="px-1.5 pb-2 mb-2 border-b border-slate-900 font-mono text-[9px] uppercase tracking-wider text-slate-500">
            Swipe left/right to browse all pages:
          </div>
          <div className="overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 py-0.5 px-0.5">
            {[
              { id: 'platform', label: 'Platform Overview', icon: Layers },
              { id: 'mission', label: 'Mission Statement', icon: HeartHandshake },
              { id: 'architecture', label: 'Architecture Pipeline', icon: Cpu },
              { id: 'playground', label: 'API Playground', icon: Terminal },
              { id: 'matrix', label: 'Capabilities Matrix', icon: Sliders },
              { id: 'telemetry', label: 'Live Graph Feed', icon: Activity },
              { id: 'privacy-matrix', label: 'Trust & Privacy Matrix', icon: EyeOff },
              { id: 'solutions', label: 'Sectors & Solutions', icon: Globe },
              { id: 'developers', label: 'Developer Workspace', icon: Code },
              { id: 'trustcenter', label: 'Trust Center Docs', icon: Shield },
              { id: 'pricing', label: 'Pricing Matrix', icon: DollarSign }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'developers') {
                      setActiveDocSection('quickstart');
                    }
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-sans font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900/50 border border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right main column for active tab */}
        <div className="lg:col-span-9 col-span-1 min-w-0">

          {/* TAB 1: OVERVIEW PLATFORM */}
          {activeTab === 'platform' && (
            <div className="animate-fade-in relative z-10">
          
          {/* Modern Enterprise Hero Section */}
          <header className="bg-slate-900/10 border border-slate-900/40 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-slate-900" />
            <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-900/50 rounded-full py-1 px-2.5 mb-6 text-[10px] text-blue-300 font-semibold font-mono">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              ADAPTIVE DIGITAL TRUST LAYER
            </div>
            
            <h1 className="text-3xl md:text-3xl.5 font-sans font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
              Privacy-Preserving Proof-of-Human Identity Infrastructure
            </h1>
            
            <p className="mt-4 text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed font-sans">
              Help your platform eliminate bots, fraud networks, and automated duplicate signups. Securely analyze local device trust and ephemeral validation signals to issue signed cryptographic trust assertions—without storing sensitive biometric records.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onStartDemoSession}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold text-xs px-6 py-3 rounded-md flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
              >
                <span>Run Demonstration Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('developers');
                  setActiveDocSection('quickstart');
                }}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-sans px-6 py-3 rounded-md transition-all"
              >
                Access Technical Docs
              </button>
            </div>
          </header>

          {/* Welcome Portal Directory Cards */}
          <div className="space-y-4 mt-8 pb-4">
            <div className="border-l-2 border-blue-500 pl-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Portal Direct Access Grid</h3>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">Every core infrastructure layer of AAN now resides in its own isolated high-performance view.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'mission', label: '1. Mission Statement', desc: 'Secure evaluation standards, non-custodial telemetry guidelines, and alignment profiles.', icon: HeartHandshake, color: "text-blue-400 border-blue-950/40 hover:border-blue-855" },
                { id: 'architecture', label: '2. Architecture Pipeline', desc: 'Symmetric evaluation layers, live system integrations and cryptographic token flow steps.', icon: Cpu, color: "text-indigo-400 border-indigo-950/40 hover:border-indigo-855" },
                { id: 'playground', label: '3. API Playground', desc: 'Interactive response assertions and client request structures configured in 9 backend syntaxes.', icon: Terminal, color: "text-emerald-400 border-emerald-950/40 hover:border-emerald-855" },
                { id: 'matrix', label: '4. Capabilities Matrix', desc: 'Comprehensive matrix detailing device trust, humanness credentials, and liveness algorithms.', icon: Sliders, color: "text-purple-400 border-purple-950/40 hover:border-purple-855" },
                { id: 'telemetry', label: '5. Live Graph Feed', desc: 'Real-time simulated test indicators, uptime logs, request query counters, and latency ticks.', icon: Activity, color: "text-rose-400 border-rose-950/40 hover:border-rose-855" },
                { id: 'privacy-matrix', label: '6. Trust & Privacy Matrix', desc: 'System governance standards, automatic photo purging metrics, and decentralized user compliance.', icon: EyeOff, color: "text-teal-400 border-teal-950/40 hover:border-teal-855" },
                { id: 'solutions', label: '7. Sectors & Solutions', desc: 'Abuse profile alignments mapped for Fintech, marketplaces, gaming portals, and social startups.', icon: Globe, color: "text-amber-400 border-amber-950/40 hover:border-amber-855" },
                { id: 'developers', label: '8. Developer Workspace', icon: Code, desc: 'Live system simulation dashboard to issue ephemeral API credentials and check signed logs.', color: "text-cyan-400 border-cyan-950/40 hover:border-cyan-855" },
                { id: 'trustcenter', label: '9. Trust Center Docs', icon: Shield, desc: 'Central documentation portal containing policies, roadmap milestones, and terms.', color: "text-blue-400 border-blue-950/40 hover:border-blue-855" },
                { id: 'pricing', label: '10. Pricing Plans', icon: DollarSign, desc: 'Modular subscription preset scales detailing free options, pro options, and enterprise deals.', color: "text-emerald-400 border-emerald-950/40 hover:border-emerald-855" }
              ].map(sec => {
                const SecIcon = sec.icon;
                return (
                  <div 
                    key={sec.id}
                    onClick={() => {
                      setActiveTab(sec.id);
                      if (sec.id === 'developers') {
                        setActiveDocSection('quickstart');
                      }
                    }}
                    className="p-5 bg-slate-900/20 border border-slate-900 rounded-xl cursor-pointer hover:bg-slate-900/40 transition-all duration-150 flex gap-4 hover:border-slate-800 group"
                  >
                    <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg h-inner flex items-center justify-center shrink-0">
                      <SecIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs font-sans text-stone-200 group-hover:text-white flex items-center gap-1.5 transition-colors">
                        <span>{sec.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600 transition-transform group-hover:translate-x-0.5" />
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1 font-sans">{sec.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 1.1: MISSION STATEMENT */}
      {activeTab === 'mission' && (
        <div className="animate-fade-in relative z-10">
          {/* Concise Mission / Under-Hero Section */}
          <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="max-w-3xl mb-12">
              <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider block">MISSION STATEMENT</span>
              <h2 className="text-xl mt-2 font-sans font-bold text-white tracking-tight">Adaptive Authentication & Trust Infrastructure</h2>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                AAN provides adaptive authentication and trust infrastructure that helps organizations evaluate login risk and apply verification policies appropriate to each authentication attempt.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { 
                  name: 'Social Platforms', 
                  complement: 'Sits alongside standard client OAuth',
                  desc: 'Detects coordinated bot networks and programmatic account farming during user creation.' 
                },
                { 
                  name: 'Online Marketplaces', 
                  complement: 'Protects checkout and listing workflows',
                  desc: 'Filters referral abusers and duplicate merchant profiles without introducing friction to buyers.' 
                },
                { 
                  name: 'FinTech & Banking', 
                  complement: 'Enriches standard MFA risk profiles',
                  desc: 'Acts as an intelligent pre-screen gatekeeper to block automated emulation before triggering expensive checks.' 
                },
                { 
                  name: 'Healthcare Portals', 
                  complement: 'Sits after corporate enterprise SSO',
                  desc: 'Confirms real biological human presence at critical Telehealth logins without storing medical files.' 
                },
                { 
                  name: 'Multiplayer Gaming', 
                  complement: 'Couples with standard game sign-on',
                  desc: 'Suppresses system client emulators and automated farming scripts to preserve in-game economies.' 
                },
                { 
                  name: 'Enterprise SaaS', 
                  complement: 'Enriches SAML identity provider logs',
                  desc: 'Supplies real-time login session integrity signals to block credential stuffing and brute-force sweeps.' 
                },
                { 
                  name: 'Developer Platforms', 
                  complement: 'Protects public registration endpoints',
                  desc: 'Blocks automated script accounts designed for trial credit mining or trial CPU resource abuse.' 
                },
                { 
                  name: 'Government Portals', 
                  complement: 'Augments traditional identity verification',
                  desc: 'Interviews biological human presence before critical benefits submission cycles to prevent robot form-filing.' 
                },
                { 
                  name: 'Higher Education', 
                  complement: 'Complements student enterprise portals',
                  desc: 'Flags bulk course-registration automation scripts and automated financial aid applications at entry.' 
                }
              ].map((plat, idx) => (
                <div key={idx} className="p-5 bg-slate-900/40 border border-slate-900 rounded-lg hover:border-slate-800 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2">
                      <span className="font-sans font-bold text-xs text-white tracking-tight">{plat.name}</span>
                      <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest">{plat.complement}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{plat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* TAB 1.2: Platform Architecture & SVG Flow Diagram */}
      {activeTab === 'architecture' && (
        <div className="animate-fade-in relative z-10">
          <section className="bg-slate-900/20 border border-slate-900 p-6 md:p-8 rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-5 space-y-6">
                <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider block">ARCHITECTURE PIPELINE</span>
                <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight leading-tight">
                  Middleware Trust Signals Layer
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Every company already has authentication. Most companies struggle with determining whether a login or account creation appears trustworthy. 
                  AAN exists alongside your existing systems to help your application make better trust decisions.
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">
                    Evaluation & Decision Flow
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold font-mono">Step 1:</span>
                      <span className="text-slate-200">User triggers signup or high-risk action in App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold font-mono">Step 2:</span>
                      <span className="text-slate-200">AAN performs ephemeral trust & device evaluation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold font-mono">Step 3:</span>
                      <span className="text-slate-200">AAN returns a cryptographically signed Trust Assertion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold font-mono">Step 4:</span>
                      <span className="text-slate-200">Application evaluates evidence & executes final decision</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic leading-relaxed">
                  AAN never decides whether someone may use an application. The customer always makes that decision. We simply supply structured evidence.
                </p>
              </div>

              {/* Robust Responsive Interactive SVG Architecture Diagram */}
              <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400" />
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-6 font-mono text-[10px] text-slate-500">
                  <span>SYSTEM_FLOW_DIAGRAM.SVG</span>
                  <span className="text-emerald-400 tracking-widest uppercase animate-pulse">● Middleware Agent Online</span>
                </div>

                {/* SVG Element */}
                <div className="w-full h-auto">
                  <svg viewBox="0 0 600 340" fill="none" className="w-full h-auto text-slate-400">
                    <defs>
                      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e40af" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                      <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#065f46" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* Node: User */}
                    <rect x="20" y="20" width="110" height="40" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                    <text x="35" y="44" fill="#94a3b8" fontSize="11" fontFamily="monospace">User / Client</text>
                    <text x="35" y="54" fill="#475569" fontSize="8" fontFamily="monospace">Initiates Action</text>

                    {/* Flow Line */}
                    <path d="M 130 40 L 175 40" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,3" />
                    <polygon points="175,40 169,37 169,43" fill="#3b82f6" />

                    {/* Node: Application Login */}
                    <rect x="175" y="20" width="130" height="40" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <text x="185" y="44" fill="#ffffff" fontSize="10" fontFamily="monospace">App Login/Signup</text>
                    <text x="185" y="54" fill="#3b82f6" fontSize="8" fontFamily="monospace">Existing Credentials</text>

                    {/* Flow Line down to Engines */}
                    <path d="M 240 60 L 240 105" stroke="#475569" strokeWidth="1.5" />
                    <polygon points="240,105 237,99 243,99" fill="#475569" />

                    {/* Risk Engine Grid */}
                    <g transform="translate(15, 105)">
                      <rect x="0" y="0" width="450" height="120" rx="8" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
                      <text x="15" y="20" fill="#64748b" fontSize="9" fontFamily="monospace">AAN TRUST EVALUATION MIDDLEWARE</text>

                      {/* Engine Box 1: Device Signals */}
                      <rect x="20" y="32" width="120" height="35" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x="30" y="53" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">Device Assessment</text>

                      {/* Engine Box 2: Risk Engine */}
                      <rect x="160" y="32" width="120" height="35" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x="175" y="53" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">Risk Scoring Engine</text>

                      {/* Engine Box 3: Biometric Liveness */}
                      <rect x="300" y="32" width="120" height="35" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x="312" y="53" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">Liveness & Context</text>

                      {/* Routing out to Credential Service */}
                      <path d="M 220 67 L 220 95 L 300 95" stroke="#3b82f6" strokeWidth="1.5" />
                      <rect x="300" y="78" width="120" height="32" rx="5" fill="#0f211b" stroke="#047857" strokeWidth="1" />
                      <text x="306" y="97" fill="#10b981" fontSize="9" fontFamily="monospace">Trust Assertion Service</text>
                    </g>

                    {/* Flow Line from Credential out */}
                    <path d="M 415 200 L 455 200 L 455 260" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />

                    {/* Block: Signed Trust Assertion Token */}
                    <rect x="380" y="260" width="180" height="40" rx="6" fill="#022c22" stroke="#059669" strokeWidth="1" />
                    <text x="395" y="284" fill="#a7f3d0" fontSize="9" fontFamily="monospace">Signed Trust Assertion (Evidence)</text>

                    {/* Core loop back to Partner App */}
                    <path d="M 380 280 L 170 280" stroke="#34d399" strokeWidth="1.5" />
                    <polygon points="170,280 176,277 176,283" fill="#34d399" />

                    <rect x="20" y="260" width="150" height="40" rx="6" fill="#1e1b4b" stroke="#4338ca" strokeWidth="1" />
                    <text x="30" y="278" fill="#c7d2fe" fontSize="9" fontFamily="monospace">Application Decision</text>
                    <text x="30" y="288" fill="#a5b4fc" fontSize="7.5" fontFamily="monospace">Allow / Challenge / Reject</text>
                  </svg>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 text-center font-mono text-[10px] text-slate-500">
                  <span><b>Structured Evidence:</b> AAN yields cryptographic metadata. Partner app holds full access orchestration keys.</span>
                </div>
              </div>

            </div>
          </section>

        </div>
      )}

      {/* TAB 1.3: Interactive Try the Verification API Playground */}
      {activeTab === 'playground' && (
        <div className="animate-fade-in relative z-10">
          <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider block">API PLAYGROUND</span>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight mt-2">
                Try the Authentication Intelligence API
              </h2>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Query client-provided assertion tokens to extract detailed session metrics, system risk markers, and duplicate registration indicators before admitting the user.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Side: Request Code */}
              <div className="lg:col-span-7 bg-slate-900/30 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-6">
                    <span className="font-mono text-xs text-slate-300">POST /v1/proofs/verify</span>
                    {/* Language selector tabs */}
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {['curl', 'javascript', 'typescript', 'python'].map(lang => (
                        <button
                          key={lang}
                          onClick={() => setPlayLang(lang)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all uppercase ${
                            playLang === lang 
                              ? 'bg-blue-600 text-white font-semibold' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
                    {playLang === 'curl' && "Submit a cURL request directly to retrieve verification results from any shell or backend server script."}
                    {playLang === 'javascript' && "Integrate vanilla modern ES6 JavaScript/Fetch API code to query AAN verification state."}
                    {playLang === 'typescript' && "Initiate strongly-typed verification queries from Node.js with complete type-safety."}
                    {playLang === 'python' && "Inspect proof status using the familiar requests library inside any Python backend."}
                  </p>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-200 overflow-x-auto select-all max-h-[220px] overflow-y-auto">
                    <pre>
                      {playLang === 'curl' && `curl -X POST https://api.aan.com/v1/proofs/verify \\
  -H "x-api-key: aan_key_live_89a3df0f" \\
  -H "Content-Type: application/json" \\
  -d '{
    "assertion_token": "aan_proof_sig_cb79a2f1ab"
  }'`}
                      {playLang === 'javascript' && `const response = await fetch('https://api.aan.com/v1/proofs/verify', {
  method: 'POST',
  headers: {
    'x-api-key': 'aan_key_live_89a3df0f',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    assertion_token: 'aan_proof_sig_cb79a2f1ab'
  })
});
const result = await response.json();
console.log(result.verified);`}
                      {playLang === 'typescript' && `import { AANClient } from '@aan-io/sdk-node';

const client = new AANClient({ apiKey: 'aan_key_live_89a3df0f' });

const validation = await client.proofs.verify({
  assertionToken: 'aan_proof_sig_cb79a2f1ab'
});`}
                      {playLang === 'python' && `import requests

url = "https://api.aan.com/v1/proofs/verify"
headers = {
    "x-api-key": "aan_key_live_89a3df0f",
    "Content-Type": "application/json"
}
data = {
    "assertion_token": "aan_proof_sig_cb79a2f1ab"
}

res = requests.post(url, json=data, headers=headers)
print(res.json())`}
                    </pre>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                    <Server className="w-3.5 h-3.5" />
                    <span>HTTPS Endpoint</span>
                  </div>
                  <button 
                    onClick={() => {
                      let text = '';
                      if (playLang === 'curl') text = 'curl -X POST https://api.aan.com/v1/proofs/verify -H "x-api-key: aan_key_live_89a3df0f" -H "Content-Type: application/json" -d \'{"assertion_token": "aan_proof_sig_cb79a2f1ab"}\'';
                      else if (playLang === 'javascript') text = `const response = await fetch('https://api.aan.com/v1/proofs/verify', { method: 'POST', headers: { 'x-api-key': 'aan_key_live_89a3df0f', 'Content-Type': 'application/json' }, body: JSON.stringify({ assertion_token: 'aan_proof_sig_cb79a2f1ab' }) }); const result = await response.json();`;
                      else if (playLang === 'typescript') text = `import { AANClient } from '@aan-io/sdk-node';\nconst client = new AANClient({ apiKey: 'aan_key_live_89a3df0f' });\nconst validation = await client.proofs.verify({ assertionToken: 'aan_proof_sig_cb79a2f1ab' });`;
                      else if (playLang === 'python') text = `import requests\nres = requests.post("https://api.aan.com/v1/proofs/verify", json={"assertion_token": "aan_proof_sig_cb79a2f1ab"}, headers={"x-api-key": "aan_key_live_89a3df0f"})`;
                      copyToClipboard(text);
                    }}
                    className="flex items-center gap-1 text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2.5 py-1.5 rounded transition-all font-mono"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isCopied ? 'Copied' : 'Copy Code Snippet'}</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Response Payload */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-xs text-emerald-400">200 OK</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">JSON RESPONSE</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
                    The API response yields structured telemetry evidence rather than identity. Complete final enforcement decisions are routed to your backend application code.
                  </p>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 font-mono text-xs text-emerald-400 overflow-x-auto min-h-[145px]">
                    <pre>
{`{
  "verified_assertion": true,
  "human_confidence_score": 0.98,
  "device_trust_score": 94,
  "risk_score": 8,
  "duplicate_account_probability": 0.01,
  "session_integrity": "high",
  "automation_indicators": ["none"],
  "assertion_token_signature": "aan_proof_sig_cb79a2f1ab",
  "recommendation": "ALLOW"
}`}
                    </pre>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900 text-center font-mono text-[9px] text-slate-500 italic">
                  * Recommendation is advisory. Partner applications maintain 100% policy enforcement.
                </div>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* TAB 1.4: Capabilities Matrix */}
      {activeTab === 'matrix' && (
        <div className="animate-fade-in relative z-10">
          <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider block">CAPABILITIES MATRIX</span>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight mt-2">
                Core Trust Services
              </h2>
              <p className="text-slate-400 mt-2 text-xs">
                A modular suite designed specifically to fulfill advanced platform-integrity parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: CheckCircle,
                  color: 'text-blue-400 bg-blue-950/50 border-blue-900/30',
                  title: 'Human Confidence Signals',
                  desc: 'Evaluates liveness signatures and action timings to calculate biological confidence scores.'
                },
                {
                  icon: Shield,
                  color: 'text-emerald-400 bg-emerald-950/50 border-emerald-900/30',
                  title: 'Device Trust Assessment',
                  desc: 'Analyzes hardware credentials and browser signatures to detect system emulation or device spoofing.'
                },
                {
                  icon: Activity,
                  color: 'text-purple-400 bg-purple-950/50 border-purple-900/30',
                  title: 'Behavioral Risk Evaluation',
                  desc: 'Aggregates passive interaction markers to calculate an advisory risk score from 0 to 100.'
                },
                {
                  icon: EyeOff,
                  color: 'text-pink-400 bg-pink-950/50 border-pink-900/30',
                  title: 'Strict Privacy Controls',
                  desc: 'Enforces ephemeral data processing where zero sensitive client identity details are permanently logged.'
                },
                {
                  icon: Key,
                  color: 'text-yellow-400 bg-yellow-950/50 border-yellow-900/30',
                  title: 'Signed Trust Assertions',
                  desc: 'Issues verified cryptographic claims that downstream servers can validate independently.'
                },
                {
                  icon: Code,
                  color: 'text-cyan-400 bg-cyan-950/50 border-cyan-900/30',
                  title: 'Abuse Prevention API',
                  desc: 'Integrates natively into standard SSO, MFA, or passkey authentication pipelines.'
                }
              ].map((serv, idx) => {
                const IconComponent = serv.icon;
                return (
                  <div key={idx} className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-6 rounded-xl transition-all flex flex-col justify-between">
                    <div>
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-5 ${serv.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="font-sans font-bold text-base text-white">{serv.title}</h3>
                      <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">{serv.desc}</p>
                    </div>
                    <div className="border-t border-slate-900/60 mt-5 pt-3 flex items-center justify-between font-mono text-[9px] text-slate-500">
                      <span>MODULE ID: aa_svc_0{idx+1}</span>
                      <span className="text-blue-400 font-mono">ADVISORY SERVICE</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      {/* TAB 1.5: LIVE GRAPH FEED */}
      {activeTab === 'telemetry' && (
        <div className="animate-fade-in relative z-10">
          <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
                <div>
                  <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider block">LIVE GRAPH FEED</span>
                  <h2 className="text-2xl font-sans font-bold text-white mt-1">Simulated Uptime Monitor</h2>
                  <p className="text-xs text-slate-500 mt-1">Interactive state statistics detailing real-time test queries triggered inside our active sandbox.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 py-1 px-3 rounded-md font-mono text-[10px] text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-emerald-400">DEMO DATA</span> — Simulated Real-time Refresh Every 4.5s
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Verification Requests (Demo)", val: telemetry.verificationRequests.toLocaleString(), desc: "Global ephemeral calls triggered" },
                  { label: "Successful Attestations (Demo)", val: telemetry.successfulVerifications.toLocaleString(), desc: "Uniqueness limits established" },
                  { label: "Avg Processing Speed (Demo)", val: `${telemetry.avgProcessingTime}s`, desc: "End-to-end token latency" },
                  { label: "Active Pending Sessions (Demo)", val: telemetry.pendingSessions, desc: "Buffered ephemeral checkpoints" },
                  { label: "Detected Risk Events (Demo)", val: telemetry.riskEvents.toLocaleString(), desc: "Spoof attempts intercepted" },
                  { label: "Registered Dev Projects", val: telemetry.developerProjects, desc: "Keys generated in Sandbox" },
                  { label: "API SLA Guarantee", val: telemetry.apiHealth, desc: "High availability clusters" },
                  { label: "Global Node Status", val: telemetry.systemStatus, desc: "All servers reporting operational" },
                ].map((stat, i) => (
                  <div key={i} className="p-5 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-xl rounded-full" />
                    <span className="font-mono text-[10px] text-slate-500 block uppercase tracking-wider">{stat.label}</span>
                    <div className="font-mono text-2xl font-bold tracking-tight text-white">{stat.val}</div>
                    <p className="font-sans text-[10.5px] text-slate-400 leading-normal">{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Developer action banner */}
              <div className="mt-8 p-5 bg-blue-950/20 border border-blue-900/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400 leading-normal max-w-2xl">
                    <b>No fake production indicators:</b> AAN strictly tags simulated outcomes during sandbox previews. These metrics reflect standard performance metrics generated within state-sandbox limits.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate('partner')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-bold px-4 py-2.5 rounded transition-all whitespace-nowrap cursor-pointer"
                >
                  Configure My API Keys &rarr;
                </button>
              </div>
            </section>
          </div>
        )}

      {/* TAB 1.6: PRIVACY ARCHITECTURE & TRUST MATRIX */}
      {activeTab === 'privacy-matrix' && (
        <div className="animate-fade-in relative z-10">
          <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider block">TRUST & PRIVACY MATRIX</span>
                <h2 className="text-2xl md:text-3xl font-sans font-bold text-white leading-tight">
                  Privacy Architecture
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Traditional identity scanners compile files of government credentials, raw photos, and face maps in centralized databases. AAN rejects this philosophy, enforcing strict hardware-bound boundaries on what we process, discard, and share.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-400">
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-lg">
                    <span className="font-bold text-slate-200 block mb-1">1. Camera & Bio Processing</span>
                    <p className="text-slate-500 mb-2"><strong className="text-emerald-400">Processed:</strong> Real-time camera frames inside browser memory buffers to execute active-liveness challenge/response cycles.</p>
                    <p className="text-slate-500"><strong className="text-rose-400">Discarded immediately:</strong> All raw video streams and face-landmark maps. No biometric assets are stored on persistent disk drives.</p>
                  </div>
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-lg">
                    <span className="font-bold text-slate-200 block mb-1">2. Device Signals Processing</span>
                    <p className="text-slate-500 mb-2"><strong className="text-emerald-400">Processed:</strong> Cryptographic device signature certificates and WebAuthn authentications.</p>
                    <p className="text-slate-500"><strong className="text-rose-400">Discarded immediately:</strong> Full raw system identifiers and broad hardware fingerprints.</p>
                  </div>
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-lg">
                    <span className="font-bold text-slate-200 block mb-1">3. Application Handshake</span>
                    <p className="text-slate-500 mb-2"><strong className="text-emerald-400">Received by partner app:</strong> Verification status, a risk index (0–100), and a signed token claim.</p>
                    <p className="text-slate-500"><strong className="text-rose-400">Never shared with partner app:</strong> Facial template vectors, biometrics, or original user network profiles.</p>
                  </div>
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-lg">
                    <span className="font-bold text-slate-200 block mb-1">4. Retention Controls</span>
                    <p className="text-slate-500 mb-2"><strong className="text-blue-400 font-mono">Custom Database TTL:</strong> Developer-managed expiration boundaries.</p>
                    <p className="text-slate-500">Enable instant purge-on-handshake, auto-expiration of database records, or audit-compliant logs directly from your project console.</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-lg flex gap-3 text-xs text-slate-400">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <p className="leading-snug">
                    <span className="font-bold text-slate-300">Compliance Boundary:</span> We avoid impossible database-uniqueness guarantees. Biometric template matches rely on numerical distance algorithms which do not represent legal identity replacements.
                  </p>
                </div>
              </div>

              {/* Secure Token display snippet */}
              <div className="bg-slate-950 border border-slate-900 p-6 md:p-8 rounded-2xl font-mono text-xs text-slate-300 relative">
                <div className="absolute top-4 right-4 text-[9px] text-slate-600">AAN SECURE SPEC</div>
                <div className="flex gap-1.5 mb-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-500">// 1. Ephemeral Sandbox Capture Schema</span>
                    <pre className="text-slate-400 text-[11px] mt-1 overflow-x-auto">
{`{
  "enrollment_event": "usr_claim_0a9a13",
  "face_embedding": "bio_v3_9a2f3bd9efc",
  "retained_geometry": 0.0, // Absolute zero template collection
  "liveness_outcome": "VERIFIED_GENUINE_HUMAN"
}`}
                    </pre>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-900">
                    <span className="text-slate-500">// 2. Decoupled Attestation Claim Result</span>
                    <pre className="text-[#34d399] text-[11px] mt-1 overflow-x-auto">
{`{
  "valid": true,
  "claims": {
    "human_verified": true,
    "unique_human": true,
    "attestation_token": "aan_proof_sig_03af19b..."
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      )}


      {/* TAB 2: SOLUTIONS BY SECTORS */}
      {activeTab === 'solutions' && (
        <div className="animate-fade-in relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider block">USE CASE PLATFORMS</span>
            <h2 className="text-3xl font-sans font-bold text-white tracking-tight mt-1">Built for Modern Platforms</h2>
            <p className="text-slate-400 text-xs mt-2">
              Optimize trust scores dynamically matching sector-specific abuse profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Social Media Networks',
                prob: 'Automated fake profiles propagating spam or scripter networks.',
                goal: 'Screen fraud signals at point-of-registration alongside passwords/OAuth.',
                aanWay: 'Evaluate browser signatures to block programmatic account creation before accounts enter the database.'
              },
              {
                title: 'Online Multiplayer Gaming',
                prob: 'Bot syndicates harvesting gold and automation script farms ruins the economy.',
                goal: 'Augment the launcher signup flow without false-flagging residential LAN connections.',
                aanWay: 'Flag system emulator profiles and virtual joystick signals during high-risk lobby creation.'
              },
              {
                title: 'Financial Services & Fintech',
                prob: 'Synthetic accounts built with AI-fabricated likenesses bypassing traditional checks.',
                goal: 'Establish human liveness and device trust signals before initiating expensive third-party KYC checks.',
                aanWay: 'Block automated selfie injector scripts dynamically using browser active screen challenges.'
              },
              {
                title: 'Digital Marketplaces',
                prob: 'Coordinated fake merchant listings and automated referral coupon farming.',
                goal: 'Validate uniqueness to distinct physical devices during high-risk listings or checkout.',
                aanWay: 'Flag devices operating hundreds of separate user logins within short temporal spans.'
              },
              {
                title: 'Healthcare & Telehealth Tech',
                prob: 'Robots or programmatic agents hijacking scarce specialist appointments.',
                goal: 'Deploy ephemeral liveness checks alongside standard patient account login.',
                aanWay: 'Stream active challenge metrics and discard all biometric inputs immediately following evaluation.'
              },
              {
                title: 'Higher Education & EdTech',
                prob: 'Automated registration bots claiming free financial aid or enrollment spots.',
                goal: 'Add an abuse-prevention layer directly behind standard corporate Edu SSO portals.',
                aanWay: 'Review device reputation signals during registration to block non-residential node farms.'
              },
              {
                title: 'Enterprise SaaS',
                prob: 'Credential-stuffing bots scraping private directories or abusing trial tiers.',
                goal: 'Assess session integrity dynamically on high-risk admin console logins.',
                aanWay: 'Stream trust assertion tokens to enterprise security logs (SIEM) to enrich access policies.'
              },
              {
                title: 'Government Portals',
                prob: 'Programmatic automation bulk-filing fraudulent public aid submissions.',
                goal: 'Verify biological human presence in front of legacy state mainframe portals.',
                aanWay: 'Examine active browser telemetry matrices and reject virtual automation devices.'
              },
              {
                title: 'Developer Platforms',
                prob: 'Bulk automated accounts abusing trial container CPU allocations.',
                goal: 'Determine account uniqueness upon creation alongside automated email signups.',
                aanWay: 'Analyze browser liveness cues to verify physical presence under 150ms during account creation.'
              }
            ].map((sol, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-900 hover:border-blue-900/30 p-6 rounded-xl transition-all space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/40 px-2.5 py-0.5 rounded">
                    SECTOR_0{idx+1}
                  </span>
                  <h3 className="font-sans font-bold text-sm text-slate-200">{sol.title}</h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-500 font-mono text-[9px] block uppercase">Platform Threat:</span>
                    <p className="text-slate-400 mt-0.5">{sol.prob}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[9px] block uppercase">Integration Goal:</span>
                    <p className="text-slate-400 mt-0.5">{sol.goal}</p>
                  </div>
                  <div>
                    <span className="text-slate-300 font-mono text-[9px] block uppercase font-bold text-emerald-400">AAN Complementary Signal:</span>
                    <p className="text-slate-300 mt-0.5 font-medium">{sol.aanWay}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-slate-900/20 border border-slate-900 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="font-mono text-[10px] text-blue-400 font-bold uppercase">MOCK IMPLEMENTATION NOTE</span>
              <p className="text-xs text-slate-450 leading-relaxed mt-1">
                While these solutions reflect highly strategic platforms, all identity operations in this preview are mock configurations. Always substitute real certified hardware validation systems before production deployment.
              </p>
            </div>
            <button 
              onClick={onStartDemoSession}
              className="bg-slate-100 hover:bg-white text-slate-950 font-sans font-semibold text-xs px-5 py-3 rounded-lg flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer"
            >
              Start Custom Sandbox Tryout &rarr;
            </button>
          </div>
        </div>
      )}


      {/* TAB 3: DEVELOPER HUB (PLAYGROUND & COMPREHENSIVE DOCS) */}
      {activeTab === 'developers' && (
        <div className="animate-fade-in relative z-10 space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-900 pb-6 gap-4">
            <div>
              <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider block">THE WORKSPACE</span>
              <h2 className="text-3xl font-sans font-bold text-white tracking-tight mt-1">Developer API Playground</h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-xl">
                AAN provides clean, predictable REST endpoints and lightweight cross-framework SDK wrappers allowing developers to verify digital trust quickly.
              </p>
            </div>
            
            {/* Interactive Tab switches for target languages */}
            <div className="flex flex-wrap gap-1 bg-slate-900 border border-slate-850 p-1 rounded-lg">
              {Object.keys(PLAYGROUND_EXAMPLES).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActivePlaygroundLang(lang)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wide transition-all ${
                    activePlaygroundLang === lang 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code playground browser block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                <span className="font-mono text-[9px] text-slate-500 uppercase block">ACTIVE CLIENT SPECIFICATION</span>
                <span className="font-sans font-bold text-sm text-white block capitalize">{activePlaygroundLang} Integration Example</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {PLAYGROUND_EXAMPLES[activePlaygroundLang].desc}
                </p>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 pt-2 border-t border-slate-900">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>OUTPUT TARGET: REST GET /v1/sessions/:id</span>
                </div>
              </div>

              {/* Endpoint summary table */}
              <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl text-xs space-y-2.5 font-mono">
                <span className="text-[9px] text-slate-500 uppercase block">CORE RETYPES</span>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
                  <span className="text-slate-300 font-bold">POST /v1/sessions</span>
                  <span className="text-[#a7f3d0] bg-emerald-950/40 px-2 py-0.5 rounded text-[10px]">Create ephem link</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/60">
                  <span className="text-slate-300 font-bold">GET /v1/sessions/:id</span>
                  <span className="text-blue-300 bg-blue-950/40 px-2 py-0.5 rounded text-[10px]">Read token result</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-300 font-bold">POST /v1/proofs/verify</span>
                  <span className="text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded text-[10px]">Verify assertion</span>
                </div>
              </div>
            </div>

            {/* Interactive Code Window */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-xl font-mono text-xs relative">
              <div className="bg-slate-900/50 py-3 px-5 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{PLAYGROUND_EXAMPLES[activePlaygroundLang].filename}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(PLAYGROUND_EXAMPLES[activePlaygroundLang].code)}
                  className="text-slate-500 hover:text-slate-300 mr-1.5 focus:outline-none transition-all flex items-center gap-1.5 text-[10px]"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-6 text-slate-300 leading-relaxed overflow-x-auto select-all whitespace-pre">
                {PLAYGROUND_EXAMPLES[activePlaygroundLang].code}
              </pre>

              <div className="bg-slate-900/30 p-3 text-[10px] text-slate-500 border-t border-slate-900 text-center">
                <span>MOCK GATEWAY DEPLOYMENT — Verified using local sha-256 API Key hashes on the server.</span>
              </div>
            </div>
          </div>

          {/* Platform Documentation Quick-browser */}
          <div className="border-t border-slate-900 pt-12 space-y-10">
            <div>
              <h3 className="text-xl font-sans font-bold text-white mb-2">Platform Documentation Quick Reference</h3>
              <p className="text-xs text-slate-400">Click any preview card to open the detailed interactive technical documentation reference below.</p>
            </div>

            {/* 8 Bento-Style Documentation Preview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'quickstart', label: 'Quick Start', icon: BookOpen, desc: 'Onboard and start integration loops.' },
                { id: 'rest_api', label: 'REST API', icon: Terminal, desc: 'Query and manage sessions.' },
                { id: 'auth', label: 'Authentication', icon: Lock, desc: 'Secure hashed x-api-key access.' },
                { id: 'sdk', label: 'SDK Installation', icon: Cpu, desc: 'Install NodeJS, Python, Go clients.' },
                { id: 'limits', label: 'Rate Limits', icon: Sliders, desc: 'Tiered baseline safety bounds.' },
                { id: 'errors', label: 'Error Codes', icon: AlertTriangle, desc: 'Gracefully match standard anomalies.' },
                { id: 'webhooks', label: 'Webhooks', icon: RefreshCw, desc: 'Hook async session events.' },
                { id: 'faq', label: 'Developer FAQ', icon: Info, desc: 'Cryptographic architecture specs.' }
              ].map((card) => {
                const IconComp = card.icon;
                const isSelected = activeDocSection === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      setActiveDocSection(card.id);
                      const el = document.getElementById('docs-detailed-viewer');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between h-[115px] cursor-pointer group ${
                      isSelected 
                        ? 'bg-blue-600/10 border-blue-600 shadow-lg shadow-blue-500/5' 
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-md border ${isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-white'}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-[9px] text-slate-600 group-hover:text-slate-400 uppercase">SYS_DOC</span>
                    </div>
                    <div>
                      <div className="font-sans font-bold text-xs text-slate-200 mt-2 block">{card.label}</div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{card.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div id="docs-detailed-viewer" className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6 border-t border-slate-900/40">
              {/* Docs Sidebar */}
              <div className="md:col-span-1 space-y-1">
                {DOCS_NAV.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocSection(doc.id)}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-all ${
                      activeDocSection === doc.id 
                        ? 'bg-blue-900/20 text-blue-300 border-l-2 border-blue-500 font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {doc.label}
                  </button>
                ))}
              </div>

              {/* Docs Content browser */}
              <div className="md:col-span-3 bg-slate-900/20 border border-slate-900 rounded-xl p-6 space-y-5">
                
                {activeDocSection === 'quickstart' && (
                  <div className="space-y-4">
                    <h4 className="font-mono text-sm text-white font-bold">Quick Start Developer Onboarding</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Deploy the AAN verification checkout flow in 3 quick phases:
                    </p>
                    <ol className="list-decimal list-outside pl-4 text-xs text-slate-400 space-y-2 leading-relaxed">
                      <li>Generate secure key credentials inside the AAN Partner Dashboard.</li>
                      <li>POST request details from server-side code to instantiate an ephemeral checking link.</li>
                      <li>Redirect users to the verification checkout. Fetch asymmetric assertion tokens signed by AAN on completion.</li>
                    </ol>
                    <div className="bg-slate-950 p-4 rounded text-slate-400 text-[10.5px] border border-slate-900 font-mono">
                      <span># Initialize your project using Node package controls</span><br />
                      <span className="text-blue-400 font-bold">npm install</span> @aan-io/sdk-node --save
                    </div>
                  </div>
                )}

                {activeDocSection === 'rest_api' && (
                  <div className="space-y-4">
                    <h4 className="font-mono text-sm text-white font-bold">REST API Reference Specification</h4>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      AAN handles structural network checkpoints. Endpoint specifications as follows:
                    </p>
                    <div className="space-y-3 font-mono text-[11px]">
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded space-y-1">
                        <span className="text-blue-400 font-bold">POST /api/v1/verification-sessions</span>
                        <p className="text-slate-500 text-[10px]">Constructs checkout link. Require x-api-key headers.</p>
                      </div>
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded space-y-1">
                        <span className="text-blue-400 font-bold">GET /api/v1/verification-sessions/:id</span>
                        <p className="text-slate-500 text-[10px]">Reads specific outcomes, anomaly points, and signature assertions.</p>
                      </div>
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded space-y-1">
                        <span className="text-purple-400 font-bold">POST /api/v1/proofs/verify</span>
                        <p className="text-slate-500 text-[10px]">Authenticates signed verify claims tokens independently.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeDocSection === 'auth' && (
                  <div className="space-y-4">
                    <h4 className="font-mono text-sm text-white font-bold">API Authentication Scheme</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      All endpoints require a private API Key header named <code className="font-mono text-blue-400">x-api-key</code>. All keys are securely hashed using the SHA-256 algorithm on AAN servers before database comparison to prevent accidental plaintext exposure.
                    </p>
                    <div className="bg-slate-950 p-4 rounded text-slate-400 text-[10.5px] border border-slate-900 font-mono space-y-1">
                      <div><strong className="text-slate-300">// Example Headers</strong></div>
                      <div>x-api-key: aan_key_live_89a3df0f</div>
                      <div>Content-Type: application/json</div>
                    </div>
                  </div>
                )}

                {activeDocSection === 'sdk' && (
                  <div className="space-y-4">
                    <h4 className="font-mono text-sm text-white font-bold">SDK Installation & Clients</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      We offer pre-packaged, robust SDK clients for quick deployment inside server microservices.
                    </p>
                    <div className="space-y-3 font-mono text-[10.5px]">
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded space-y-1">
                        <span className="text-blue-400 font-bold">Node.js / TypeScript SDK</span>
                        <p className="text-slate-400">npm install @aan-io/sdk-node --save</p>
                      </div>
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded space-y-1">
                        <span className="text-blue-400 font-bold">Python / Pip Package</span>
                        <p className="text-slate-400">pip install aan-sdk-python</p>
                      </div>
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded space-y-1">
                        <span className="text-blue-400 font-bold">Go Microservices Import</span>
                        <p className="text-slate-400">go get github.com/aan-io/sdk-go</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeDocSection === 'webhooks' && (
                  <div className="space-y-4">
                    <h4 className="font-mono text-sm text-white font-bold">Webhook Event Streams</h4>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Configure webhook payload triggers to respond synchronously to completion status. AAN dispatches secure POST updates as events execute:
                    </p>
                    <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5 leading-relaxed font-mono">
                      <li><b className="text-slate-200">session.started:</b> Ephemeral buffer allocation.</li>
                      <li><b className="text-slate-200 font-bold text-emerald-400">session.passed:</b> Authenticated verified claims signed.</li>
                      <li><b className="text-slate-200 font-bold text-red-400">session.failed:</b> Detected risk trigger matches terminated.</li>
                    </ul>
                  </div>
                )}

                {activeDocSection === 'errors' && (
                  <div className="space-y-4">
                    <h4 className="font-mono text-sm text-white font-bold">Standard Platform Error Codes</h4>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      AAN processes anomalies gracefully. Debug client flows using custom, descriptive integers:
                    </p>
                    <div className="overflow-x-auto font-mono text-[11px] text-slate-400">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-900">
                            <th className="py-2 text-slate-200">Error Integer</th>
                            <th className="py-2 text-slate-200">Technical Label</th>
                            <th className="py-2 text-slate-200">Root Cause</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          <tr>
                            <td className="py-2 font-bold text-red-400">401_KEY_INVALID</td>
                            <td className="py-2">API key hash mismatch</td>
                            <td className="py-2">x-api-key credential header failed checks.</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-bold text-red-400">403_MEMBER_SUSPENDED</td>
                            <td className="py-2">User status suspended</td>
                            <td className="py-2">Partner user status is blocked by Admin.</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-bold text-red-400">409_EXPIRED_LIMIT</td>
                            <td className="py-2">Session timeout match</td>
                            <td className="py-2">Ephemeral checkout window exceeded 15 minutes limit.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeDocSection === 'limits' && (
                  <div className="space-y-4">
                    <h4 className="font-mono text-sm text-white font-bold">Active API Rate Limitations</h4>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Baseline boundaries in sandbox and production environments are strictly defined per project class:
                    </p>
                    <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5 leading-relaxed font-mono">
                      <li><b>Developer Sandbox tier:</b> 100 ephemeral creation requests per minute limit.</li>
                      <li><b>Startup tier:</b> 1,500 token request validations per minute limit.</li>
                      <li><b>Enterprise / Government tier:</b> Customized SLA allocations, featuring active rate throttle overrides.</li>
                    </ul>
                  </div>
                )}

                {activeDocSection === 'faq' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-mono text-sm text-white font-bold">Developer FAQ & Cryptographic Specs</h4>
                    <div className="space-y-4 leading-relaxed font-sans text-slate-400">
                      <div>
                        <strong className="text-slate-200 block mb-1">Q: Does AAN store a user's biological face details permanently?</strong>
                        <span>No. Raw web camera streams feed liveness routines in active memory. Facial mapping landmark vectors are hashed instantly, then discarded immediately on session completion.</span>
                      </div>
                      <div className="pt-3 border-t border-slate-900">
                        <strong className="text-slate-200 block mb-1">Q: What guarantees the validity of signed assertions?</strong>
                        <span>AAN uses Ed25519 asymmetric cryptography keys. The public key is publicly accessible, allowing partner microservices to verify assertions independently offline.</span>
                      </div>
                      <div className="pt-3 border-t border-slate-900">
                        <strong className="text-slate-200 block mb-1">Q: Can AAN be used to authenticate returning users without biometrics?</strong>
                        <span>Yes. Browser WebAuthn credentials bind tokens locally to client devices during first-time enrollments. Subsequent checkouts can rely entirely on those hardwarekeys.</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      )}


      {/* TAB 4: TRUST CENTER & PRIVACY */}
      {activeTab === 'trustcenter' && (
        <div className="animate-fade-in relative z-10 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider block">TRUST CENTER</span>
            <h2 className="text-3xl font-sans font-bold text-white tracking-tight mt-1">Sovereign Privacy Architecture</h2>
            <p className="text-slate-400 text-xs mt-2">
              A detailed inspectable summary of our active threat parameters, availability margins, and encryption guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3.5">
              <span className="font-mono text-[10px] text-blue-400 font-bold block uppercase">1. STRUCTURAL THREAT MODELING</span>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                AAN treats biometric data as toxic liabilities. We do not store high-resolution facial snapshots, and we avoid compiling identifying consumer metadata. In our threat configuration matrix, we expect that compromise of partner databases should produce zero tracking vectors or compromised biometrics for users.
              </p>
            </div>

            <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3.5">
              <span className="font-mono text-[10px] text-blue-400 font-bold block uppercase">2. RESPONSIBLE DISCLOSURE BOUNDS</span>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                AAN welcomes community-driven security audit reviews. If you identify structural gaps or cryptographic vulnerabilities in our open-source routing schemas, submit them to our team at <code>security@aan.com</code> for immediate evaluation under standard bounty models.
              </p>
            </div>

            <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3.5">
              <span className="font-mono text-[10px] text-blue-400 font-bold block uppercase">3. SYSTEM AVAILABILITY & SLA</span>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                All platform endpoints process via highly-available container clusters. Real-time active status is logged automatically to our public status registry, maintaining actual SLAs averaging 99.999% uptime margins throughout each billing calendar.
              </p>
            </div>

            <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3.5">
              <span className="font-mono text-[10px] text-blue-400 font-bold block uppercase">4. SYSTEM HEALTH MONITOR</span>
              <div className="space-y-2 text-xs font-mono text-slate-400">
                <div className="flex justify-between py-1 border-b border-slate-950">
                  <span>AAN Gateway Cluster</span>
                  <span className="text-emerald-400 font-bold">99.99% ONLINE</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-950">
                  <span>Risk Decision Nodes</span>
                  <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Signed Tokens Cryptoregister</span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance Frame */}
          <div className="p-6 bg-blue-950/20 border border-blue-900/30 rounded-2xl space-y-3">
            <h4 className="font-sans font-bold text-sm text-slate-200">Platform Limits & Non-Negotiable Directives</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never promise bulletproof immunity from identity vectors or absolute safety from all coordinated digital spoof syndicates. Product architecture is optimized purely to establish strong, deterministic evidence chains securely, decoupling platform databases from liability issues. AAN does not claim legal certification under HIPAA or specific national government mandates unless customized enterprise models are deployed.
            </p>
          </div>
        </div>
      )}


      {/* TAB 5: PRICING MODEL */}
      {activeTab === 'pricing' && (
        <div className="animate-fade-in relative z-10 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider block">ORGANIZATIONAL PRESETS</span>
            <h2 className="text-3xl font-sans font-bold text-white tracking-tight mt-1">Platform Pricing Model</h2>
            <p className="text-slate-400 text-xs mt-2">
              Stateless digital trust infrastructure, structured matching deployment classes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                tier: 'Developer Sandbox',
                price: 'Free',
                desc: 'Optimize integration and experiment with SHA hashing structures in active development.',
                features: [
                  '100 ephemeral sessions / min limit',
                  'Basic risk score analysis (0-100)',
                  'Developer API Playground access',
                  'Community-driven security guides'
                ]
              },
              {
                tier: 'Startup Tier',
                price: 'Scale Placement',
                desc: 'Secure early platform networks, blocking botnets and account duplicator behaviors early.',
                features: [
                  '1,500 active matches / min limit',
                  'Full Device Integrity indicators',
                  'Standard signed claim token exports',
                  'Uptime service checks (99.9% SLA)'
                ]
              },
              {
                tier: 'Growth Tier',
                price: 'Custom Allocation',
                desc: 'Designed specifically for established digital channels with high signup velocity parameters.',
                features: [
                  'Dynamic rate throttle adjustments',
                  'Custom verification expiration sliders',
                  'Dedicated Slack and email response',
                  'Advanced audit ledger database logs'
                ]
              },
              {
                tier: 'Enterprise & Gov',
                price: 'Contact Sales',
                desc: 'Military-grade, air-gapped sovereign setups matching rigorous compliance mandates.',
                features: [
                  'Infinite request capacity scales',
                  'Hardware-backed custom keys signing',
                  'Dedicated database instance deployments',
                  'SLA reliability exceeding 99.999%'
                ]
              }
            ].map((prc, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="font-mono text-[9px] text-slate-500 uppercase block">TARIFF_0{idx+1}</span>
                  <div>
                    <h3 className="font-sans font-bold text-base text-white">{prc.tier}</h3>
                    <div className="text-xl font-mono font-bold text-blue-400 mt-2">{prc.price}</div>
                  </div>
                  <p className="text-[11.5px] text-slate-400 leading-normal font-sans border-b border-slate-900/80 pb-3">{prc.desc}</p>
                  
                  <ul className="space-y-2 text-[11px] text-slate-400 font-sans">
                    {prc.features.map((feat, i) => (
                      <li key={i} className="flex gap-2 items-center">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={onStartDemoSession}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-slate-300 font-mono text-[10px] font-bold py-2.5 rounded border border-slate-800 mt-6 transition-all cursor-pointer"
                >
                  Acquire Keys &rarr;
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl text-center text-xs text-slate-500 font-mono">
            <span>All pricing presets are demonstration representations. Contact team regarding live sandbox trials.</span>
          </div>

        </div>
      )}

        </div> {/* closing col-span-9 active tab component */}
      </div> {/* closing outer 11-tab layout grid */}


      {/* Unified Platform Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 pt-16 pb-12 bg-slate-950/90 text-slate-500 text-xs mt-12 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-0.5 items-end">
                <span className="w-1.5 h-4 bg-blue-600 rounded-sm" />
                <span className="w-1.5 h-5 bg-white rounded-sm" />
              </div>
              <span className="font-sans font-extrabold text-white text-sm">AAN Trust Infrastructure</span>
            </div>
            
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              Decoupled digital trust protocols preventing continuous biometric tracking networks globally, designed to help platforms eliminate bot abuse in subseconds.
            </p>
            <p className="leading-relaxed max-w-sm text-[11px] text-slate-500">
              <b>Demo Boundary Statement:</b> All active camera scanner overlays, risk charts, database records, and SDK scripts are mock simulations. The platform records no permanent physical face embeddings.
            </p>
          </div>

          <div>
            <span className="font-mono text-xs text-slate-300 font-bold uppercase tracking-wider block mb-4">DEVELOPERS</span>
            <div className="flex flex-col gap-2 font-mono text-xs text-slate-450">
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/docs')}>Documentation</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/api-ref')}>API Reference</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/sdks')}>SDK Downloads</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/changelog')}>Changelog</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/github')}>GitHub Repository</span>
            </div>
          </div>

          <div>
            <span className="font-mono text-xs text-slate-300 font-bold uppercase tracking-wider block mb-4">SECURITY</span>
            <div className="flex flex-col gap-2 font-mono text-xs text-slate-450">
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/security')}>Security Standards</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/privacy')}>Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/trust')}>Trust Center Matrix</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/disclosure')}>Responsible Disclosure</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/status')}>System Status</span>
            </div>
          </div>

          <div>
            <span className="font-mono text-xs text-slate-300 font-bold uppercase tracking-wider block mb-4">COMPANY</span>
            <div className="flex flex-col gap-2 font-mono text-xs text-slate-450">
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/mission')}>Mission</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/brand')}>Brand Manual</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/research')}>Research</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/roadmap')}>Roadmap</span>
            </div>
          </div>

          <div className="md:col-start-2 lg:col-start-4">
            <span className="font-mono text-xs text-slate-300 font-bold uppercase tracking-wider block mb-4">ENTERPRISE</span>
            <div className="flex flex-col gap-2 font-mono text-xs text-slate-450">
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/pricing')}>Pricing Matrix</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/support')}>Support Portal</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/contact')}>Contact Sales</span>
              <span className="hover:text-white cursor-pointer transition" onClick={() => onNavigate('trustdocs', '/terms')}>Terms & Conditions</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-900 text-center font-mono text-[11px] text-slate-500">
          © 2026 AAN. Decoupled Identity Verification Credentials & Digital Trust Infrastructure layer. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
