import { supabase } from './supabase/client';
import { publicAnonKey } from './supabase/info';

// Use the shared Supabase client to avoid multiple GoTrueClient instances

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Sign in error:', error);
    throw error;
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Get session error:', error);
    return null;
  }
  
  return data.session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}

export async function getAccessToken(): Promise<string> {
  const session = await getCurrentSession();
  return session?.access_token || publicAnonKey;
}