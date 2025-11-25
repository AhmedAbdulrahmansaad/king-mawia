import { ReactNode, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  TrendingUp, 
  FileText, 
  Sparkles,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { signOut } from '../utils/auth';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: string;
  userName: string;
}

export function DashboardLayout({ 
  children, 
  currentPage, 
  onNavigate,
  userRole,
  userName
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['admin', 'seller', 'supervisor'] },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, roles: ['admin'] },
    { id: 'products', label: 'إدارة المنتجات', icon: Package, roles: ['admin'] },
    { id: 'sales', label: 'المبيعات', icon: TrendingUp, roles: ['admin', 'seller', 'supervisor'] },
    { id: 'debts', label: 'الديون', icon: FileText, roles: ['admin', 'seller', 'supervisor'] },
    { id: 'customers', label: 'كشوفات الزبائن', icon: Users, roles: ['admin', 'supervisor'] },
    { id: 'products-reports', label: 'كشوفات المنتجات', icon: Package, roles: ['admin', 'supervisor'] },
    { id: 'reports', label: 'التقارير المتقدمة', icon: FileText, roles: ['admin', 'supervisor'] },
    { id: 'ai-assistant', label: 'المساعد الذكي', icon: Sparkles, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">ملك</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">ملك الماوية</h1>
                <p className="text-xs text-muted-foreground">نظام إدارة المبيعات</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground">
                {userRole === 'admin' ? 'المدير العام' : userRole === 'seller' ? 'بائع' : 'مشرف'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-accent hover:bg-accent/10"
            >
              <LogOut className="h-4 w-4 ml-2" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-64px)] transition-transform duration-300 ease-in-out",
          "fixed lg:sticky top-[64px] z-30",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}>
          <nav className="p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    currentPage === item.id
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}