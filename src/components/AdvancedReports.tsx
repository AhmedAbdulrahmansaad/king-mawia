import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getSales, getDebts } from '../utils/api';
import { ShoppingCart, DollarSign, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { exportToPDF } from '../utils/exportHelpers';
import { toast } from 'sonner';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface AdvancedReportsProps {
  user: any;
}

export function AdvancedReports({ user }: AdvancedReportsProps) {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalDebts: 0,
    averageSale: 0,
    salesGrowth: 0,
    topProduct: '',
    topCustomer: '',
  });

  useEffect(() => {
    loadData();
  }, [timeRange]);

  async function loadData() {
    setLoading(true);
    try {
      const [salesData, debtsData] = await Promise.all([
        getSales(),
        getDebts(),
      ]);

      const filteredSales = filterByTimeRange(salesData.sales || []);
      setSales(filteredSales);
      setDebts(debtsData.debts || []);

      calculateStats(filteredSales, debtsData.debts || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterByTimeRange(data: any[]) {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return data.filter(item => new Date(item.createdAt) >= cutoffDate);
  }

  function calculateStats(salesData: any[], debtsData: any[]) {
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.totalAmount || sale.total || 0), 0);
    const totalDebts = debtsData.reduce((sum, debt) => sum + (debt.remainingAmount || debt.amount || 0), 0);
    const averageSale = salesData.length > 0 ? totalRevenue / salesData.length : 0;

    // Calculate growth (compare to previous period)
    const previousPeriodSales = sales.slice(sales.length / 2);
    const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + (sale.totalAmount || sale.total || 0), 0);
    const salesGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Find top product
    const productSales = salesData.reduce((acc, sale) => {
      const product = sale.productName || 'غير محدد';
      acc[product] = (acc[product] || 0) + (sale.totalAmount || sale.total || 0);
      return acc;
    }, {} as Record<string, number>);
    const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد';

    // Find top customer
    const customerSales = salesData.reduce((acc, sale) => {
      if (sale.customerName) {
        acc[sale.customerName] = (acc[sale.customerName] || 0) + (sale.totalAmount || sale.total || 0);
      }
      return acc;
    }, {} as Record<string, number>);
    const topCustomer = Object.entries(customerSales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد';

    setStats({
      totalRevenue,
      totalDebts,
      averageSale,
      salesGrowth,
      topProduct,
      topCustomer,
    });
  }

  // Prepare data for charts
  function getSalesByDay() {
    const dayGroups = sales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + (sale.totalAmount || sale.total || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dayGroups).map(([date, amount]) => ({
      date,
      amount,
    }));
  }

  function getSalesByProduct() {
    const productGroups = sales.reduce((acc, sale) => {
      const product = sale.productName || 'غير محدد';
      acc[product] = (acc[product] || 0) + (sale.totalAmount || sale.total || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productGroups).map(([name, value]) => ({
      name,
      value,
    }));
  }

  function getPaymentStatus() {
    const paid = sales.filter(s => s.paymentStatus === 'paid').length;
    const pending = sales.filter(s => s.paymentStatus === 'pending').length;

    return [
      { name: 'مدفوع', value: paid },
      { name: 'دين', value: pending },
    ];
  }

  async function exportReport() {
    try {
      const headers = [
        'المؤشر',
        'القيمة'
      ];

      const rows = [
        ['إجمالي الإيرادات', `${stats.totalRevenue.toLocaleString('ar-YE')} ريال`],
        ['إجمالي الديون', `${stats.totalDebts.toLocaleString('ar-YE')} ريال`],
        ['متوسط البيع', `${stats.averageSale.toLocaleString('ar-YE')} ريال`],
        ['النمو', `${stats.salesGrowth.toFixed(1)}%`],
        ['المنتج الأكثر مبيعاً', stats.topProduct],
        ['العميل الأفضل', stats.topCustomer]
      ];

      const summary = [
        { label: 'الفترة الزمنية', value: timeRange === 'week' ? 'أسبوع' : timeRange === 'month' ? 'شهر' : 'سنة' },
        { label: 'تاريخ التقرير', value: new Date().toLocaleDateString('ar-YE') }
      ];

      await exportToPDF(
        'تقرير تفصيلي - ملك الماوية',
        headers,
        rows,
        `تقرير-تفصيلي-${new Date().toISOString().split('T')[0]}.pdf`,
        summary
      );
      
      toast.success('✅ تم تصدير التقرير بنجاح! 📄');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('❌ فشل تصدير التقرير: ' + (error instanceof Error ? error.message : 'خطأ غير متوقع'));
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">التقارير المتقدمة</h1>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadData} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                إجمالي الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRevenue.toLocaleString('ar-YE')} ريال
              </div>
              <p className="text-xs text-green-100 mt-1">
                {stats.salesGrowth > 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />}
                {' '}{stats.salesGrowth.toFixed(1)}% من الفترة السابقة
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                إجمالي الديون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalDebts.toLocaleString('ar-YE')} ريال
              </div>
              <p className="text-xs text-red-100 mt-1">
                يجب تحصيلها
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                متوسط البيع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageSale.toLocaleString('ar-YE')} ريال
              </div>
              <p className="text-xs text-blue-100 mt-1">
                لكل عملية
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                المنتج الأفضل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">
                {stats.topProduct}
              </div>
              <p className="text-xs text-purple-100 mt-1">
                الأكثر مبيعاً
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">المبيعات اليومية</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="payments">حالة الدفع</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>المبيعات خلال الفترة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={getSalesByDay()}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>المبيعات حسب المنتج</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getSalesByProduct()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>حالة المدفوعات</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPaymentStatus()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPaymentStatus().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>أفضل العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              sales.reduce((acc, sale) => {
                if (sale.customerName) {
                  acc[sale.customerName] = (acc[sale.customerName] || 0) + (sale.totalAmount || sale.total || 0);
                }
                return acc;
              }, {} as Record<string, number>)
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([customer, amount], index) => (
                <div key={customer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 font-bold w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="font-medium">{customer}</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {amount.toLocaleString('ar-YE')} ريال
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}