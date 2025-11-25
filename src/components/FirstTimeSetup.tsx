import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { AnimatedLogo } from './AnimatedLogo';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function FirstTimeSetup({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('عبده ماوية');
  const [email, setEmail] = useState('admin@malek-mawia.ye');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('❌ كلمتا المرور غير متطابقتين');
      return;
    }

    if (password.length < 6) {
      toast.error('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      // Create admin user
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-06efd250/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role: 'admin',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إنشاء الحساب');
      }

      // Create default products
      const defaultProducts = [
        { name: 'طوفان', category: 'قات' },
        { name: 'طلب خاص', category: 'قات' },
        { name: 'حسين', category: 'قات' },
        { name: 'طلب عمنا', category: 'قات' },
        { name: 'القحطاني', category: 'قات' },
        { name: 'عبيده', category: 'قات' },
        { name: 'رقم واحد', category: 'قات' },
      ];

      // Get auth token for creating products
      const { data: authData } = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-06efd250/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }).then(r => r.json()).catch(() => ({ data: null }));

      // Create products (if we have auth)
      for (const product of defaultProducts) {
        try {
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-06efd250/products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(product),
          });
        } catch (err) {
          console.log('Product creation skipped:', product.name);
        }
      }

      toast.success('✅ تم إنشاء حساب المدير والمنتجات الافتراضية بنجاح!');
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error: any) {
      console.error('Create admin error:', error);
      toast.error('❌ ' + (error.message || 'حدث خطأ أثناء إنشاء الحساب'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl border-2 border-green-200">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <AnimatedLogo />
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">
              🎉 مرحباً بك في نظام ملك الماوية
            </CardTitle>
            <CardDescription className="text-base">
              يبدو أن هذه أول مرة تستخدم النظام. الرجاء إنشاء حساب المدير العام
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                الاسم الكامل
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="عبده ماوية"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-base border-2 focus:border-green-500"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@malek-mawia.ye"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base border-2 focus:border-green-500"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-base border-2 focus:border-green-500"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base">
                تأكيد كلمة المرور
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-base border-2 focus:border-green-500"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <UserPlus className="ml-2 h-5 w-5" />
                  إنشاء حساب المدير
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" dir="rtl">
            <p className="text-sm text-blue-800">
              💡 <strong>ملاحظة:</strong> هذا هو حساب المدير العام الذي سيكون له صلاحيات كاملة على النظام. 
              احتفظ ببيانات الدخول في مكان آمن.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}