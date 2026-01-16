import { createClient } from '@supabase/supabase-js';

// Use environment variables for production readiness
// Vercel and Vite standard is VITE_ prefix, but we also check common process.env names
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://egowhoqdibrvsnmbbgrn.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_oIwDq7sKSOoGnGkmA3cjsA_fHQvE3qd';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);