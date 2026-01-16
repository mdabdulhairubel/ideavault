import { createClient } from '@supabase/supabase-js';

// Guard against ReferenceError: process is not defined in strict browser environments
const getEnv = (key: string) => {
  try {
    return (typeof process !== 'undefined' && process.env) ? process.env[key] : undefined;
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://egowhoqdibrvsnmbbgrn.supabase.co';
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_oIwDq7sKSOoGnGkmA3cjsA_fHQvE3qd';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);