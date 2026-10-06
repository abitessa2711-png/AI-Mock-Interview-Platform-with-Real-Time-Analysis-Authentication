import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ssymyvleozdxljxhcidn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GpkmV7tJ51yQXtqVcRr5oA_-2mCBciq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
