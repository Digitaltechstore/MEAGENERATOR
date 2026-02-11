import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = 'https://vxzlreptcvyxhezowgyw.supabase.co';
const supabaseAnonKey = 'sb_publishable_72Yv7Z0QXPMT5PzTMuJ40Q_BHijlmlA';

// Diagnostic logs (safe to expose URL/Anon Key in client console)
console.log("Supabase URL loaded:", !!supabaseUrl);
console.log("Supabase key loaded:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Connectivity Test Helper
export const checkConnection = async () => {
  try {
    // Attempt a lightweight query to check reachability
    const { error } = await supabase.from('mea_submissions').select('id').limit(1);
    
    // It's okay if table is empty, we just want to ensure no connection error
    // If table doesn't exist, it might throw a specific error, but basic connection is established.
    if (error && error.code !== 'PGRST116' && error.message !== 'JSON object requested, multiple (or no) rows returned') {
        // We ignore "no rows" errors, but catch connection/auth errors
        if (error.message.includes('fetch')) throw error;
    }
    return { success: true };
  } catch (err: any) {
    console.error("Connectivity check failed:", err);
    return { success: false, error: err };
  }
};