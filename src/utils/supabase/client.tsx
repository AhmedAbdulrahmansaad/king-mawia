import { createClient as createSupabaseClient } from 'npm:@supabase/supabase-js@2';
import { projectId, publicAnonKey } from './info';

export const supabase = createSupabaseClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
