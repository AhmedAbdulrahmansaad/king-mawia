import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase, getCurrentUser, signOut as supabaseSignOut } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'seller';
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  needsSetup: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSetupCheck: () => Promise<void>;
  isAdmin: boolean;
  isSupervisor: boolean;
  isSeller: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache management
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = {
  user: null as any,
  timestamp: 0,
  setupCheck: null as any,
  setupTimestamp: 0,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkUser();

    // Setup auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        cache.user = null;
        cache.timestamp = 0;
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const authUser = await getCurrentUser();
      if (authUser) {
        await loadUserProfile(authUser.id);
      } else {
        // Check if system needs first-time setup
        await checkSystemSetup();
      }
    } catch (error) {
      console.error('Check user error:', error);
      await checkSystemSetup();
    } finally {
      setLoading(false);
    }
  };

  const checkSystemSetup = async () => {
    try {
      // Check cache first
      const now = Date.now();
      if (cache.setupCheck && (now - cache.setupTimestamp) < CACHE_DURATION) {
        setNeedsSetup(cache.setupCheck.needsSetup);
        return;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-06efd250/check-setup`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNeedsSetup(data.needsSetup);
        // Cache the result
        cache.setupCheck = data;
        cache.setupTimestamp = now;
      }
    } catch (error) {
      console.error('Check setup error:', error);
      // If can't check, assume needs setup
      setNeedsSetup(true);
    }
  };

  const refreshSetupCheck = async () => {
    // Clear cache
    cache.setupCheck = null;
    cache.setupTimestamp = 0;
    
    setLoading(true);
    await checkSystemSetup();
    await checkUser();
    setLoading(false);
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Check cache first
      const now = Date.now();
      if (cache.user && cache.user.id === userId && (now - cache.timestamp) < CACHE_DURATION) {
        setUser(cache.user);
        return;
      }

      // Load user data from server (KV store) instead of SQL
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || publicAnonKey;
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-06efd250/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Load profile error:', errorText);
        toast.error('❌ فشل تحميل بيانات المستخدم');
        await supabaseSignOut();
        return;
      }

      const data = await response.json();

      if (data && data.active) {
        const userData = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          phone: data.phone,
          avatar_url: data.avatar_url,
          is_active: data.active,
        };
        
        setUser(userData);
        
        // Cache the user data
        cache.user = userData;
        cache.timestamp = now;
      } else {
        toast.error('❌ حسابك غير مفعّل');
        await supabaseSignOut();
      }
    } catch (error) {
      console.error('Load profile error:', error);
      toast.error('❌ خطأ في تحميل بيانات المستخدم');
      await supabaseSignOut();
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
        toast.success('✅ تم تسجيل الدخول بنجاح!');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('❌ فشل تسجيل الدخول: ' + (error.message || 'خطأ غير معروف'));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabaseSignOut();
      setUser(null);
      // Clear cache
      cache.user = null;
      cache.timestamp = 0;
      toast.success('✅ تم تسجيل الخروج');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('❌ فشل تسجيل الخروج');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    needsSetup,
    signIn,
    signOut,
    refreshSetupCheck,
    isAdmin: user?.role === 'admin',
    isSupervisor: user?.role === 'supervisor',
    isSeller: user?.role === 'seller',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}