import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase/client';
import { Loader2, Package, DollarSign, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { toast, Toaster } from 'sonner@2.0.3';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('عبده ماوية');

  // Check if user is logged in
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'المستخدم',
        });
      }
    } catch (error) {
      console.error('Check user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) throw error;

      toast.success('✅ تم إنشاء الحساب بنجاح!');
      
      // Auto sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (signInData.user) {
        setUser({
          id: signInData.user.id,
          email: signInData.user.email || '',
          name: signInData.user.user_metadata?.name || name,
        });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || 'المستخدم',
        });
        toast.success('✅ مرحباً بك!');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('✅ تم تسجيل الخروج');
  };

  // Loading screen
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto" />
          <p className="text-xl text-green-800">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login/signup
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4" dir="rtl">
        <Toaster position="top-center" />
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl">ملك الماوية</CardTitle>
            <p className="text-gray-600 mt-2">نظام إدارة مبيعات القات</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={email.includes('@') && password ? handleSignIn : handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">الاسم</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الكامل"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">كلمة المرور</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'دخول / تسجيل جديد'
                )}
              </Button>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                سيتم إنشاء حساب جديد إذا لم يكن موجوداً
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in - show dashboard
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl">ملك الماوية</h1>
              <p className="text-sm text-gray-600">مرحباً، {user.name}</p>
            </div>
          </div>
          
          <Button onClick={handleSignOut} variant="outline">
            تسجيل الخروج
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">0 ريال</div>
              <p className="text-xs text-gray-600 mt-1">جاهز لتسجيل المبيعات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">المبيعات اليوم</CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">0</div>
              <p className="text-xs text-gray-600 mt-1">لا توجد مبيعات اليوم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">الديون</CardTitle>
              <DollarSign className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">0 ريال</div>
              <p className="text-xs text-gray-600 mt-1">لا توجد ديون</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">المستخدمين</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">1</div>
              <p className="text-xs text-gray-600 mt-1">مستخدم نشط</p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle>🎉 مرحباً في نظام ملك الماوية!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                النظام جاهز للاستخدام! هذه نسخة مبسطة تعمل مباشرة مع Supabase Auth.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">✅ ما يعمل الآن:</h3>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• تسجيل مستخدمين جدد</li>
                  <li>• تسجيل الدخول</li>
                  <li>• تسجيل الخروج</li>
                  <li>• حفظ البيانات في Supabase Auth</li>
                  <li>• واجهة سريعة وبسيطة</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📋 الخطوات التالية:</h3>
                <p className="text-sm text-blue-700 mb-3">
                  هل تريدني أن أضيف الميزات الكاملة الآن؟
                </p>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• إدارة المبيعات</li>
                  <li>• إدارة المنتجات (طوفان، حسين، إلخ)</li>
                  <li>• إدارة الديون</li>
                  <li>• التقارير والطباعة</li>
                  <li>• المساعد الذكي</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ مهم:</h3>
                <p className="text-sm text-yellow-700">
                  هذه نسخة أساسية تعمل مباشرة بدون Edge Functions أو KV Store. 
                  أخبرني إذا تريد النظام الكامل وسأضيفه خطوة بخطوة معك!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
