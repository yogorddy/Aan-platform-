import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mail, CheckCircle2, ArrowRight, ArrowLeft, Globe, Lock, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface ContactViewProps {
  onNavigate: (page: string, customPath?: string) => void;
}

let supabaseClient: any = null;

async function clientSha256(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Math fallback for browsers with insecure contexts or older frames
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'fb_' + Math.abs(hash).toString(16);
  }
}

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = 
      (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
      (import.meta as any).env?.VITE_SUPABASE_URL || 
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 
      '';
    const supabaseAnonKey = 
      (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
      '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing. Please configure them in your environment settings.");
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

export default function ContactView({ onNavigate }: ContactViewProps) {
  const [form, setForm] = useState({
    organization_name: '',
    contact_name: '',
    email: '',
    website: '',
    use_case: '',
    message: '',
    phone: '',
    company_size: '',
    urgency: 'normal'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.organization_name.trim()) errors.organization_name = 'Organization name is required';
    if (!form.contact_name.trim()) errors.contact_name = 'Contact name is required';
    
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please enter a valid work email';
    }
    
    if (!form.message.trim()) errors.message = 'Please describe your request';
    
    if (!['low', 'normal', 'high'].includes(form.urgency)) {
      errors.urgency = 'Urgency must be low, normal, or high';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let reqCode = '';
      let hasSupabaseCreds = false;

      // 1. Generate uppercase alphanumeric random tracking code: AAN-REQ-XXXXXX
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let generatedReqCode = 'AAN-REQ-';
      for (let i = 0; i < 6; i++) {
        generatedReqCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // 2. Hash privacy-preserving client metadata
      const rawUa = navigator.userAgent || 'Unknown';
      const user_agent_hash = await clientSha256(rawUa);
      const ip_hash = await clientSha256('client_direct');
      const environment = (import.meta as any).env?.MODE || 'development';
      const nowStr = new Date().toISOString();

      try {
        const supabaseUrl = 
          (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
          (import.meta as any).env?.VITE_SUPABASE_URL || 
          (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 
          '';
        const supabaseAnonKey = 
          (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
          (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
          (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
          '';

        if (supabaseUrl && supabaseAnonKey) {
          hasSupabaseCreds = true;
        }
      } catch {
        hasSupabaseCreds = false;
      }

      if (hasSupabaseCreds) {
        try {
          const supabase = getSupabaseClient();
          const reqId = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : undefined;

          const { data, error } = await supabase
            .from('integration_requests')
            .insert([
              {
                id: reqId,
                organization_name: form.organization_name,
                contact_name: form.contact_name,
                email: form.email,
                website: form.website || null,
                phone: form.phone || null,
                company_size: form.company_size || null,
                urgency: form.urgency || "normal",
                use_case: form.use_case || null,
                message: form.message,
                request_code: generatedReqCode,
                status: "pending",
                source: "contact_form",
                status_changed_at: nowStr,
                ip_hash,
                user_agent_hash,
                submission_source: "client_direct",
                environment,
                admin_notes: null
              }
            ])
            .select('request_code')
            .single();

          if (error) {
            throw error;
          }

          if (!data || !data.request_code) {
            throw new Error('Supabase insert succeeded but did not return a valid request code.');
          }

          reqCode = data.request_code;
        } catch (supabaseError: any) {
          console.warn("[SUPABASE DIRECT INSERT FAILED, FALLING BACK TO API CLIENT]", supabaseError);
          
          // Fallback to API endpoint, supplying pre-generated tracking values
          const response = await fetch('/api/integration-request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...form,
              request_code: generatedReqCode,
              submission_source: "api_fallback"
            })
          });

          const resData = await response.json();
          if (!response.ok) {
            throw new Error(resData.error || 'Failed to submit integration request.');
          }

          reqCode = resData.request_code;
        }
      } else {
        // Fallback to API route directly if credentials are not configured on the client
        const response = await fetch('/api/integration-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...form,
            request_code: generatedReqCode,
            submission_source: "api_proxy"
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || 'Failed to submit integration request.');
        }

        reqCode = resData.request_code;
      }

      setGeneratedCode(reqCode);
      setContactSubmitted(true);
      
      // Clear form on success
      setForm({
        organization_name: '',
        contact_name: '',
        email: '',
        website: '',
        use_case: '',
        message: '',
        phone: '',
        company_size: '',
        urgency: 'normal'
      });
    } catch (err: any) {
      console.error('[FRONTEND SUBMIT ERROR]', err);
      setErrorMsg(err.message || 'We encountered an error processing your submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-emerald-500/10 selection:text-slate-900 flex flex-col justify-between relative overflow-hidden" id="aan-contact-view">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.015)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#00D632]/[0.01] rounded-full blur-[180px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40 px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => onNavigate('landing')} 
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none bg-transparent border-none"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center transition-all group-hover:border-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-semibold text-slate-900 tracking-widest text-xs leading-none">Aan</span>
              <span className="text-[7px] font-mono tracking-widest text-[#646e7a] mt-0.5 uppercase">Antigravity Assurance Network</span>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Platform Home</span>
          </button>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full relative z-10 px-6 py-12 my-auto">
        
        <div className="w-full space-y-8">
          
          {/* Header Description */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/[0.03] border border-emerald-500/[0.1] text-[9px] font-mono tracking-widest text-emerald-600 uppercase">
              <Mail className="w-3 h-3 text-emerald-500" />
              <span>Contact Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-light text-slate-900 tracking-tight leading-tight">
              Sovereign Integration Desk
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              Connect directly with platform architects to initiate system verification protocols and sovereign API integrations.
            </p>
          </div>

          {/* Contact Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/[0.005] rounded-full blur-[60px] pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {contactSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-8 text-center space-y-6"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/[0.04] border border-emerald-500/[0.12] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="space-y-4">
                    <h3 id="success-title" className="text-xl font-light text-slate-900 tracking-tight">Request Received</h3>
                    
                    <p id="success-body" className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-2">
                      Your Aan integration request has been received and recorded successfully. An Aan team member will review the details and contact you using the information you provided.
                    </p>

                    <div id="technical-line" className="text-[10px] font-mono text-emerald-600 bg-emerald-50/50 border border-emerald-200/60 rounded-lg py-1.5 px-3 max-w-xs mx-auto">
                      STATUS: INTEGRATION_REQUEST_RECORDED
                    </div>

                    <div id="success-reference" className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 max-w-xs mx-auto">
                      <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1">Request Code</span>
                      <span className="font-mono text-slate-900 text-sm font-semibold tracking-wider block">{generatedCode}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      id="submit-another-btn"
                      onClick={() => setContactSubmitted(false)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 hover:text-emerald-500 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <span>Submit another request</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleContactSubmit} 
                  className="space-y-6"
                >
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-600">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Grid fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Organization Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                        Organization Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={form.organization_name}
                        onChange={(e) => {
                          setForm({ ...form, organization_name: e.target.value });
                          if (validationErrors.organization_name) {
                            setValidationErrors({ ...validationErrors, organization_name: '' });
                          }
                        }}
                        placeholder="Aether Grid"
                        className={`w-full bg-slate-50 border focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-colors ${
                          validationErrors.organization_name ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-300'
                        }`}
                      />
                      {validationErrors.organization_name && (
                        <p className="text-[9px] text-red-400 font-mono">{validationErrors.organization_name}</p>
                      )}
                    </div>

                    {/* Contact Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={form.contact_name}
                        onChange={(e) => {
                          setForm({ ...form, contact_name: e.target.value });
                          if (validationErrors.contact_name) {
                            setValidationErrors({ ...validationErrors, contact_name: '' });
                          }
                        }}
                        placeholder="Evelyn Vance"
                        className={`w-full bg-slate-50 border focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-colors ${
                          validationErrors.contact_name ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-300'
                        }`}
                      />
                      {validationErrors.contact_name && (
                        <p className="text-[9px] text-red-400 font-mono">{validationErrors.contact_name}</p>
                      )}
                    </div>

                    {/* Work Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          if (validationErrors.email) {
                            setValidationErrors({ ...validationErrors, email: '' });
                          }
                        }}
                        placeholder="evelyn@aethergrid.io"
                        className={`w-full bg-slate-50 border focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-colors ${
                          validationErrors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-300'
                        }`}
                      />
                      {validationErrors.email && (
                        <p className="text-[9px] text-red-400 font-mono">{validationErrors.email}</p>
                      )}
                    </div>

                    {/* Company Website */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Company Website</label>
                      <input 
                        type="text" 
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        placeholder="https://aethergrid.io"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Phone Number</label>
                      <input 
                        type="text" 
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 (555) 382-9901"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-colors"
                      />
                    </div>

                    {/* Company Size */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Company Size</label>
                      <select 
                        value={form.company_size}
                        onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-colors appearance-none"
                      >
                        <option value="" className="text-slate-800">Select size...</option>
                        <option value="1-10">1-10 members</option>
                        <option value="11-50">11-50 members</option>
                        <option value="51-200">51-200 members</option>
                        <option value="201-1000">201-1000 members</option>
                        <option value="1000+">1000+ members</option>
                      </select>
                    </div>

                  </div>

                  {/* Urgency Level */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Urgency Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['low', 'normal', 'high'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setForm({ ...form, urgency: lvl })}
                          className={`py-2 px-3 rounded-xl border text-center text-xs capitalize transition-all cursor-pointer font-medium ${
                            form.urgency === lvl
                              ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Use Case */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Use Case / Integration Type</label>
                    <input 
                      type="text" 
                      value={form.use_case}
                      onChange={(e) => setForm({ ...form, use_case: e.target.value })}
                      placeholder="e.g. ZK Humanness verification for node operators"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                      Message / Request Detail <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      value={form.message}
                      onChange={(e) => {
                        setForm({ ...form, message: e.target.value });
                        if (validationErrors.message) {
                          setValidationErrors({ ...validationErrors, message: '' });
                        }
                      }}
                      placeholder="Describe your verification objectives, platform details, or trust requirements..."
                      rows={4}
                      className={`w-full bg-slate-50 border focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition-colors resize-none ${
                        validationErrors.message ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-300'
                      }`}
                    />
                    {validationErrors.message && (
                      <p className="text-[9px] text-red-400 font-mono">{validationErrors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Cataloging Onboarding request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Integration Request</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Secure Network Footer info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-xs">
                A
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 tracking-tight">Aan Global Grid</div>
                <div className="text-[9px] text-slate-500 font-mono tracking-wide flex items-center gap-1 mt-0.5">
                  <Globe className="w-2.5 h-2.5 text-slate-600" />
                  secure.aan.network
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] font-mono font-medium text-emerald-600">
              <Lock className="w-2.5 h-2.5" />
              DIRECT ACCESS
            </div>
          </div>

        </div>
      </main>

      {/* Refined Timelines Footer */}
      <footer className="max-w-7xl mx-auto w-full py-12 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#525a66] gap-4 z-10">
        <span>© 2026 Aan. Decoupled Authenticity & Digital Trust Standard.</span>
        <div className="flex gap-6">
          <button onClick={() => onNavigate('privacy', '/privacy')} className="hover:text-slate-800 cursor-pointer bg-transparent border-none">Privacy Charter</button>
          <button onClick={() => onNavigate('terms', '/terms')} className="hover:text-slate-800 cursor-pointer bg-transparent border-none">Terms of Service</button>
          <button onClick={() => onNavigate('trustdocs')} className="hover:text-slate-800 cursor-pointer bg-transparent border-none">Resource Hub</button>
        </div>
      </footer>

    </div>
  );
}
