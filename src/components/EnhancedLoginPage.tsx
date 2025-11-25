import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Lock, Mail, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { signIn } from '../utils/api';

interface EnhancedLoginPageProps {
  onLogin: (user: any) => void;
}

export function EnhancedLoginPage({ onLogin }: EnhancedLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await signIn(email, password);
      if (data.user) {
        onLogin({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'المستخدم',
          role: data.user.user_metadata?.role || 'seller',
        });
        toast.success('✅ مرحباً بك!');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error('❌ خطأ في تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-green-950">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-20 animate-float"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: Math.random() * 10 + 10 + 's',
              animationDelay: Math.random() * 5 + 's',
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 shadow-2xl border-0 relative z-10 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex justify-center">
            <Logo size="xl" className="animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-4xl font-bold bg-gradient-to-l from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ملك الماوية
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Sparkles className="h-5 w-5" />
              <CardDescription className="text-lg">
                نظام إدارة المبيعات المتقدم
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-600" />
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
              <Label htmlFor="password" className="text-base font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-600" />
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base border-2 focus:border-green-500 pl-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-bold bg-gradient-to-l from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 ml-2 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <Lock className="h-6 w-6 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              نظام آمن ومشفر بالكامل 🔒
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Product Images Showcase */}
      <div className="hidden lg:block absolute bottom-10 left-10 right-10">
        <div className="flex justify-center gap-4 opacity-30">
          {[
            'https://images.unsplash.com/photo-1602943543714-cf535b048440?w=150',
            'https://images.unsplash.com/photo-1679061584104-534b7ec4afe6?w=150',
            'https://images.unsplash.com/photo-1725887210221-00fecafa3312?w=150',
          ].map((url, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-xl border-4 border-white/50">
              <ImageWithFallback
                src={url}
                alt="قات"
                className="w-24 h-24 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}