import { useState, useEffect } from 'react';
import { FileText, Loader2, TrendingUp, Calendar, Plus, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { apiRequest } from '../utils/api';
import type { Sale } from '../types';
import { exportToPDF, exportToExcel } from '../utils/exportHelpers';
import { toast } from 'sonner@2.0.3';

export function SalesManagement() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const salesData = await apiRequest('/sales');
      setSales(salesData.sales || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const todaySales = sales
    .filter(sale => sale.sale_date === new Date().toISOString().split('T')[0])
    .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

  const handleExportPDF = async () => {
    try {
      const headers = ['التاريخ', 'المنتج', 'البائع', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'العميل'];
      const rows = sales.map(sale => [
        new Date(sale.sale_date).toLocaleDateString('ar-YE'),
        sale.product_name,
        sale.seller_name || '-',
        (sale.quantity || 0).toString(),
        (sale.price || 0).toLocaleString('ar-YE') + ' ريال',
        (sale.total_amount || 0).toLocaleString('ar-YE') + ' ريال',
        sale.payment_status === 'paid' ? 'مدفوع' : 'دين',
        sale.customer_name || '-'
      ]);
      
      const summary = [
        { label: 'إجمالي المبيعات', value: totalSales.toLocaleString('ar-YE') + ' ريال' },
        { label: 'عدد العمليات', value: sales.length.toString() },
        { label: 'مبيعات اليوم', value: todaySales.toLocaleString('ar-YE') + ' ريال' }
      ];

      await exportToPDF('سجل المبيعات', headers, rows, `sales_${new Date().toISOString().split('T')[0]}.pdf`, summary);
      toast.success('تم تصدير PDF بنجاح! 📄');
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error('فشل تصدير PDF');
    }
  };

  const handleExportExcel = () => {
    try {
      const headers = ['التاريخ', 'المنتج', 'البائع', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'العميل'];
      const rows = sales.map(sale => [
        new Date(sale.sale_date).toLocaleDateString('ar-YE'),
        sale.product_name,
        sale.seller_name || '-',
        (sale.quantity || 0).toString(),
        (sale.price || 0).toLocaleString('ar-YE') + ' ريال',
        (sale.total_amount || 0).toLocaleString('ar-YE') + ' ريال',
        sale.payment_status === 'paid' ? 'مدفوع' : 'دين',
        sale.customer_name || '-'
      ]);
      
      const summary = [
        { label: 'إجمالي المبيعات', value: totalSales.toLocaleString('ar-YE') + ' ريال' },
        { label: 'عدد العمليات', value: sales.length.toString() },
        { label: 'مبيعات اليوم', value: todaySales.toLocaleString('ar-YE') + ' ريال' }
      ];

      exportToExcel('سجل المبيعات', headers, rows, `sales_${new Date().toISOString().split('T')[0]}.xlsx`, summary);
      toast.success('تم تصدير Excel بنجاح! 📊');
    } catch (error) {
      console.error('Export Excel error:', error);
      toast.error('فشل تصدير Excel');
    }
  };

  const exportToCSV = () => {
    try {
      let csv = '\uFEFF'; // UTF-8 BOM for Arabic support
      csv += 'التاريخ,المنتج,البائع,الكمية,السعر,الإجمالي,حالة الدفع,العميل\n';
      
      sales.forEach(sale => {
        csv += `${new Date(sale.sale_date).toLocaleDateString('ar-YE')},`;
        csv += `${sale.product_name},`;
        csv += `${sale.seller_name || '-'},`;
        csv += `${sale.quantity || 0},`;
        csv += `${sale.price || 0},`;
        csv += `${sale.total_amount || 0},`;
        csv += `${sale.payment_status === 'paid' ? 'مدفوع' : 'دين'},`;
        csv += `${sale.customer_name || '-'}\n`;
      });
      
      csv += `\n,,,, الإجمالي الكلي:,${totalSales}\n`;
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('تم تصدير التقرير إلى CSV بنجاح! 📋');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('فشل تصدير CSV');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المبيعات</h2>
          <p className="text-muted-foreground mt-1">
            عرض وتصدير سجل المبيعات الكامل
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-green-50 border-2 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              إجمالي المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {totalSales.toLocaleString('ar-YE')} ريال
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {sales.length} عملية بيع
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              مبيعات اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {todaySales.toLocaleString('ar-YE')} ريال
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {sales.filter(s => s.sale_date === new Date().toISOString().split('T')[0]).length} عملية
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Download className="h-4 w-4" />
              التصدير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-blue-700">
              PDF, Excel, CSV
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              جاهز للتصدير
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المبيعات الكامل</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary/20 bg-primary/5">
                    <th className="text-right py-3 px-4 font-bold">التاريخ</th>
                    <th className="text-right py-3 px-4 font-bold">المنتج</th>
                    <th className="text-right py-3 px-4 font-bold">البائع</th>
                    <th className="text-right py-3 px-4 font-bold">الكمية</th>
                    <th className="text-right py-3 px-4 font-bold">السعر</th>
                    <th className="text-right py-3 px-4 font-bold">الإجمالي</th>
                    <th className="text-right py-3 px-4 font-bold">الحالة</th>
                    <th className="text-right py-3 px-4 font-bold">العميل</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(sale.sale_date).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="py-3 px-4 font-semibold">{sale.product_name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{sale.seller_name || '-'}</td>
                      <td className="py-3 px-4">{sale.quantity || 0}</td>
                      <td className="py-3 px-4">{(sale.price || 0).toLocaleString('ar-YE')} ريال</td>
                      <td className="py-3 px-4 font-bold text-primary">
                        {(sale.total_amount || 0).toLocaleString('ar-YE')} ريال
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={sale.payment_status === 'paid' ? 'default' : 'destructive'}
                          className={sale.payment_status === 'paid' ? 'bg-primary' : ''}
                        >
                          {sale.payment_status === 'paid' ? 'مدفوع' : 'دين'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{sale.customer_name || '-'}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-primary bg-primary/10 font-bold">
                    <td colSpan={5} className="py-3 px-4 text-left text-lg">
                      الإجمالي الكلي:
                    </td>
                    <td className="py-3 px-4 text-xl text-primary">
                      {totalSales.toLocaleString('ar-YE')} ريال
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد مبيعات مسجلة</p>
              <p className="text-sm text-muted-foreground mt-1">
                استخدم المساعد الذكي لتسجيل مبيعات جديدة
              </p>
            </div>
          )}\n        </CardContent>
      </Card>
    </div>
  );
}