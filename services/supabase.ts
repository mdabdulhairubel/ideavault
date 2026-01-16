
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://egowhoqdibrvsnmbbgrn.supabase.co';
const supabaseKey = 'sb_publishable_oIwDq7sKSOoGnGkmA3cjsA_fHQvE3qd';

export const supabase = createClient(supabaseUrl, supabaseKey);
