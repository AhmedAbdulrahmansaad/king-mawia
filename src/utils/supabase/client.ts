import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Build Supabase URL from projectId
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Validate configuration
if (!projectId || !publicAnonKey) {
  throw new Error('❌ Supabase configuration is missing! Please check info.tsx file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'malek-mawia-auth',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'malek-mawia-app',
    },
  },
});

// Helper functions
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session error:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('User error:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to sign out:', error);
    throw error;
  }
};

// Log connection status
if (typeof window !== 'undefined') {
  console.log('🔌 Supabase Client initialized');
  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseAnonKey ? '✓ Present' : '✗ Missing');
}