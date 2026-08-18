import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both Vite standard (VITE_*) and Next.js standard (NEXT_PUBLIC_*) env variables
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

const supabaseUrl = 
  metaEnv.VITE_SUPABASE_URL ||
  metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey = 
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://')
);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

export const supabase = isSupabaseConfigured ? getSupabaseClient() : null;
export { supabaseUrl, supabaseAnonKey };
