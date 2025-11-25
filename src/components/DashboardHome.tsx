import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { getSales, getDebts } from '../utils/api';
import { Skeleton } from './ui/skeleton';
import { LogoWithText } from './AnimatedLogo';
import { Logo } from './Logo';
import { toast } from 'sonner@2.0.3';

interface DashboardHomeProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const [stats, setStats] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Reload data every 30 seconds to keep stats fresh
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, debtsData] = await Promise.all([
        getSales(),
        getDebts(),
      ]);
      
      console.log('Sales data:', salesData);
      console.log('Debts data:', debtsData);
      
      const sales = salesData.sales || [];
      const debts = debtsData.debts || [];
      
      // Calculate total sales amount
      const totalSales = sales.reduce((sum: number, sale: any) => 
        sum + (Number(sale.total) || 0), 0
      );
      
      // Calculate today's sales
      const today = new Date().toISOString().split('T')[0];
      const todaySales = sales.filter((sale: any) => 
        sale.createdAt?.startsWith(today) || sale.saleDate?.startsWith(today)
      );
      const todayTotal = todaySales.reduce((sum: number, sale: any) => 
        sum + (Number(sale.total) || 0), 0
      );
      
      // Calculate total debts (remaining amount from all pending debts)
      const totalDebts = debts
        .filter((debt: any) => debt.status !== 'paid')
        .reduce((sum: number, debt: any) => 
          sum + (Number(debt.remainingAmount) || 0), 0
        );
      
      // Count paid sales
      const paidSales = sales.filter((sale: any) => sale.paymentStatus === 'paid').length;
      
      console.log('Calculated stats:', {
        totalSales,
        todayTotal,
        todayCount: todaySales.length,
        totalDebts,
        paidSales
      });
      
      setStats({
        totalSales,
        todayTotal,
        todayCount: todaySales.length,
        totalDebts,
        paidSales
      });
      
      setRecentSales(sales.slice(0, 5));
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('❌ فشل تحميل البيانات');
      setStats({
        totalSales: 0,
        todayTotal: 0,
        todayCount: 0,
        totalDebts: 0,
        paidSales: 0
      });
      setRecentSales([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'إجمالي المبيعات',
      value: stats?.totalSales || 0,
      suffix: 'ريال',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'مبيعات اليوم',
      value: stats?.todayTotal || 0,
      suffix: 'ريال',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: `${stats?.todayCount || 0} عملية`,
    },
    {
      title: 'الديون المستحقة',
      value: stats?.totalDebts || 0,
      suffix: 'ريال',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'المبيعات المدفوعة',
      value: stats?.paidSales || 0,
      suffix: 'عملية',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 lg:p-8 text-white"
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          مرحباً، {user.name}! 👋
        </h1>
        <p className="text-green-100 text-sm lg:text-base">
          {new Date().toLocaleDateString('ar-YE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div>
                      <div className="text-2xl lg:text-3xl font-bold">
                        {stat.value.toLocaleString('ar-YE')} 
                        <span className="text-sm mr-1 text-gray-600">{stat.suffix}</span>
                      </div>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-600 mt-1">{stat.subtitle}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Sales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              آخر المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد مبيعات حتى الآن</p>
                <p className="text-sm mt-1">ابدأ بتسجيل أول عملية بيع!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{sale.productName}</p>
                      <p className="text-sm text-gray-600">
                        {sale.customerName} • {sale.quantity} وحدة
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sale.createdAt).toLocaleDateString('ar-YE', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">
                        {(sale.total || 0).toLocaleString('ar-YE')} ريال
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          sale.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 نصيحة اليوم</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">
              استخدم المساعد الذكي لتسجيل المبيعات بسرعة عبر الأوامر الصوتية أو النصية!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}