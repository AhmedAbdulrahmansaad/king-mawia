import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileText, Download, Printer, TrendingUp, Calendar } from 'lucide-react';
import { getSales, getDebts, getStats } from '../utils/api';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner@2.0.3';
import { exportToPDF } from '../utils/exportHelpers';

export function ReportsPage({ user }: any) {
  const [stats, setStats] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, salesData, debtsData] = await Promise.all([
        getStats(),
        getSales(),
        getDebts(),
      ]);
      
      setStats(statsData.stats);
      setSales(salesData.sales);
      setDebts(debtsData.debts);
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('❌ فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('✅ جاري الطباعة...');
  };

  const handleExportPDF = async () => {
    try {
      toast.info('⏳ جاري تصدير PDF...');
      
      const headers = ['المنتج', 'الكمية', 'الإجمالي', 'الحالة', 'التاريخ'];
      const rows = sales.map(sale => [
        sale.productName || '',
        sale.quantity?.toString() || '',
        `${(sale.total || 0).toLocaleString('ar-YE')} ريال`,
        sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه',
        new Date(sale.createdAt).toLocaleDateString('ar-YE')
      ]);

      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const summary = [
        { label: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString('ar-YE')} ريال` },
        { label: 'عدد المبيعات', value: sales.length.toString() }
      ];

      await exportToPDF(
        'تقرير المبيعات - ملك الماوية',
        headers,
        rows,
        `تقرير-المبيعات-${new Date().toLocaleDateString('ar-YE')}.pdf`,
        summary
      );
      
      toast.success('✅ تم تصدير PDF بنجاح!');
    } catch (error: any) {
      console.error('Export PDF error:', error);
      toast.error('❌ فشل تصدير PDF: ' + error.message);
    }
  };

  // Calculate top products
  const productSales = sales.reduce((acc: any, sale) => {
    if (!acc[sale.productName]) {
      acc[sale.productName] = { name: sale.productName, total: 0, count: 0 };
    }
    acc[sale.productName].total += (sale.total || 0);
    acc[sale.productName].count += (sale.quantity || 0);
    return acc;
  }, {});

  const topProducts = Object.values(productSales)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5);

  // Calculate daily sales for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailySales = last7Days.map(date => {
    const daySales = sales.filter(s => s.createdAt?.startsWith(date));
    const total = daySales.reduce((sum, s) => sum + (s.total || 0), 0);
    return {
      date: new Date(date).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' }),
      total,
      count: daySales.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between print:hidden"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-600" />
            التقارير والإحصائيات
          </h1>
          <p className="text-gray-600 mt-1">
            تحليل شامل للمبيعات والديون
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="ml-2 h-5 w-5" />
            طباعة
          </Button>
          <Button onClick={handleExportPDF} className="bg-orange-600 hover:bg-orange-700">
            <Download className="ml-2 h-5 w-5" />
            تصدير PDF
          </Button>
        </div>
      </motion.div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-3xl font-bold text-green-600 mb-2">ملك الماوية</h1>
        <p className="text-lg">تقرير المبيعات والديون</p>
        <p className="text-sm text-gray-600 mt-2">
          {new Date().toLocaleDateString('ar-YE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">إجمالي المبيعات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.totalSales?.toLocaleString('ar-YE')} <span className="text-sm">ريال</span>
                </p>
                <p className="text-xs text-gray-600 mt-2">من {sales.length} عملية</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">الديون المستحقة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {stats?.totalDebts?.toLocaleString('ar-YE')} <span className="text-sm">ريال</span>
                </p>
                <p className="text-xs text-gray-600 mt-2">من {debts.filter(d => d.status === 'pending').length} دين</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">مبيعات اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.todayTotal?.toLocaleString('ar-YE')} <span className="text-sm">ريال</span>
                </p>
                <p className="text-xs text-gray-600 mt-2">{stats?.todayCount} عملية</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">المبيعات المدفوعة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.paidSales}
                </p>
                <p className="text-xs text-gray-600 mt-2">من {sales.length} عملية</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              أكثر المنتجات مبيعاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد بيانات كافية</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product: any, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.count} وحدة مباعة</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">
                        {product.total.toLocaleString('ar-YE')} ريال
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              المبيعات اليومية (آخر 7 أيام)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-3">
                {dailySales.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">{day.date}</div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-end px-3"
                        style={{
                          width: `${Math.max(5, (day.total / Math.max(...dailySales.map(d => d.total))) * 100)}%`
                        }}
                      >
                        <span className="text-xs font-medium text-white">{day.count} عملية</span>
                      </div>
                    </div>
                    <div className="w-32 text-left text-sm font-semibold text-green-600">
                      {day.total.toLocaleString('ar-YE')} ريال
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">آخر 5 مبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{sale.productName}</p>
                    <p className="text-xs text-gray-600">{sale.customerName || '-'}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-600 text-sm">
                      {(sale.total || 0).toLocaleString('ar-YE')} ريال
                    </p>
                    <p className="text-xs text-gray-600">
                      {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('ar-YE', { 
                        month: 'short', 
                        day: 'numeric' 
                      }) : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Debts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الديون المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {debts.filter(d => d.status === 'pending').slice(0, 5).map((debt) => (
                <div key={debt.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="font-medium text-sm">{debt.customerName}</p>
                    <p className="text-xs text-gray-600">
                      {debt.dueDate 
                        ? `الاستحقاق: ${new Date(debt.dueDate).toLocaleDateString('ar-YE')}`
                        : 'بدون تاريخ استحقاق'}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-red-600 text-sm">
                      {(debt.remaining || 0).toLocaleString('ar-YE')} ريال
                    </p>
                    <p className="text-xs text-gray-600">
                      من {(debt.amount || 0).toLocaleString('ar-YE')}
                    </p>
                  </div>
                </div>
              ))}
              {debts.filter(d => d.status === 'pending').length === 0 && (
                <p className="text-center text-gray-500 py-4">لا توجد ديون معلقة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}