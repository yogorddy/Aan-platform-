import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const supabaseUrl =
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    '';
  const supabaseAnonKey =
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing in environment.");
  }

  try {
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return supabaseClientInstance;
  } catch (err: any) {
    throw new Error(`Failed to initialize Supabase client: ${err.message || err}`);
  }
}

export const supabaseClient = {
  get client(): SupabaseClient | null {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }
};
