import { createClient } from '@supabase/supabase-js';

// Direct fallback configuration to prevent runtime environment loading errors
const supabaseUrl = 'https://sfnmiqikeryiuhfjjzx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'oyaage_publishable_anon_key_eka_methana_paster_karanna';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);