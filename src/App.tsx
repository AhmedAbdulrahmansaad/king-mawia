import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner@2.0.3';
import { EnhancedLoginPage } from './components/EnhancedLoginPage';
import { Dashboard } from './components/Dashboard';
import './styles/mobile-tables.css'; // Import mobile tables CSS

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'المستخدم',
          role: session.user.user_metadata?.role || 'seller',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'المستخدم',
          role: session.user.user_metadata?.role || 'seller',
        });
      }
    } catch (error) {
      console.error('Check user error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto" />
          <p className="text-xl text-green-800">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen">
      <Toaster position="top-center" richColors />
      
      {!user ? (
        <EnhancedLoginPage onLogin={setUser} />
      ) : (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}