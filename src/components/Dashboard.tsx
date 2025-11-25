import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Users, 
  FileText,
  LogOut,
  Menu,
  X,
  Sparkles,
  Building2,
  Receipt,
  BookOpen,
  BarChart3,
  Warehouse,
  MessageCircle,
  Bell
} from 'lucide-react';
import { Button } from './ui/button';
import { AnimatedLogo } from './AnimatedLogo';
import { Logo } from './Logo';
import { toast } from 'sonner@2.0.3';
import { signOut } from '../utils/api';
import { DashboardHome } from './DashboardHome';
import { SalesPage } from './SalesPage';
import { ProductsPage } from './ProductsPage';
import { DebtsPage } from './DebtsPage';
import { UsersPage } from './UsersPage';
import { ReportsPage } from './ReportsPage';
import { BranchesManagement } from './BranchesManagement';
import { EnhancedProductsManagement } from './EnhancedProductsManagement';
import { CustomerDebtReports } from './CustomerDebtReports';
import { AllNotebooks } from './AllNotebooks';
import { UsersManagement } from './UsersManagement';
import { AdvancedReports } from './AdvancedReports';
import { InventoryManagement } from './InventoryManagement';
import { NotificationsSystem } from './NotificationsSystem';
import { CustomersStatements } from './CustomersStatements';
import { ProductsReports } from './ProductsReports';
import { createSale, createDebt } from '../utils/api';
import { SmartAssistant } from './SmartAssistant';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  onLogout: () => void;
}

type Page = 'home' | 'sales' | 'products' | 'debts' | 'users' | 'reports' | 'branches' | 'enhanced-products' | 'customer-debts' | 'notebook' | 'advanced-reports' | 'inventory' | 'customers-statements' | 'products-reports' | 'smart-assistant';

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
      toast.success('✅ تم تسجيل الخروج بنجاح');
    } catch (error: any) {
      toast.error('❌ حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const handleAIAction = async (action: string, data: any) => {
    try {
      if (action === 'createSale') {
        await createSale(data);
        toast.success('✅ تم تسجيل البيع بنجاح');
      } else if (action === 'createDebt') {
        await createDebt(data);
        toast.success('✅ تم تسجيل الدين بنجاح');
      }
    } catch (error: any) {
      toast.error('❌ فشل تنفذ العملية: ' + error.message);
    }
  };

  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, color: 'text-blue-600' },
    { id: 'smart-assistant', label: '✨ المساعد الذكي', icon: Sparkles, color: 'text-purple-600' },
    { id: 'sales', label: 'المبيعات', icon: ShoppingCart, color: 'text-green-600' },
    { id: 'debts', label: 'الديون', icon: DollarSign, color: 'text-red-600' },
    { id: 'customers-statements', label: 'كشوفات الزبائن', icon: Receipt, color: 'text-orange-600' },
    { id: 'products-reports', label: 'كشوفات المنتجات', icon: Package, color: 'text-purple-600' },
    { id: 'enhanced-products', label: 'إدارة المنتجات', icon: Package, color: 'text-purple-600' },
    { id: 'inventory', label: 'المخزون', icon: Warehouse, color: 'text-teal-600' },
    { id: 'branches', label: 'الفروع', icon: Building2, color: 'text-cyan-600' },
    { id: 'customer-debts', label: 'تقارير الديون', icon: FileText, color: 'text-orange-600' },
    { id: 'notebook', label: 'دفتر الطباعة', icon: BookOpen, color: 'text-indigo-600' },
    { id: 'reports', label: 'التقارير', icon: FileText, color: 'text-yellow-600' },
    { id: 'advanced-reports', label: 'تقارير متقدمة', icon: BarChart3, color: 'text-pink-600' },
  ];

  // Add users menu only for admin
  if (user.role === 'admin') {
    menuItems.splice(10, 0, { 
      id: 'users', 
      label: 'المستخدمين', 
      icon: Users, 
      color: 'text-indigo-600' 
    });
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <DashboardHome user={user} />;
      case 'sales':
        return <SalesPage user={user} />;
      case 'products':
        return <ProductsPage user={user} />;
      case 'enhanced-products':
        return <EnhancedProductsManagement user={user} />;
      case 'branches':
        return <BranchesManagement user={user} />;
      case 'debts':
        return <DebtsPage user={user} />;
      case 'customer-debts':
        return <CustomerDebtReports user={user} />;
      case 'notebook':
        return <AllNotebooks />;
      case 'users':
        return <UsersManagement user={user} />;
      case 'reports':
        return <ReportsPage user={user} />;
      case 'smart-assistant':
        return <SmartAssistant user={user} />;
      case 'advanced-reports':
        return <AdvancedReports user={user} />;
      case 'inventory':
        return <InventoryManagement user={user} />;
      case 'customers-statements':
        return <CustomersStatements user={user} />;
      case 'products-reports':
        return <ProductsReports user={user} />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <AnimatedLogo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-green-600">ملك الماوية</h1>
              <p className="text-xs text-gray-600">{user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationsSystem user={user} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-l shadow-sm min-h-screen sticky top-0">
          <div className="p-6 border-b">
            <div className="flex flex-col items-center gap-3 mb-4">
              <Logo size="lg" />
              <div className="text-center">
                <h1 className="text-xl font-bold text-green-600">ملك الماوية</h1>
                <p className="text-xs text-gray-600">نظام إدارة المبيعات</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">{user.name}</p>
                  <p className="text-xs text-green-600">
                    {user.role === 'admin' ? 'مدير عام' : user.role === 'seller' ? 'بائع' : 'مشرف'}
                  </p>
                </div>
                <NotificationsSystem user={user} />
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage(item.id as Page)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : item.color}`} />
                  <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">{user.name}</p>
                  <p className="text-xs text-green-600">
                    {user.role === 'admin' ? 'مدير عام' : user.role === 'seller' ? 'بائع' : 'مشرف'}
                  </p>
                </div>
              </div>

              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id as Page);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : item.color}`} />
                      <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}