import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Package, Search, Download, Printer, FileSpreadsheet, FileType, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getSales } from '../utils/api';
import { Skeleton } from './ui/skeleton';
import { exportToPDF, exportToExcel, exportToWord, printData } from '../utils/exportHelpers';

interface ProductsReportsProps {
  user: any;
}

interface ProductStats {
  productName: string;
  totalQuantity: number;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  transactionCount: number;
}

export function ProductsReports({ user }: ProductsReportsProps) {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productsStats, setProductsStats] = useState<ProductStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalQuantity: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      const sales = data.sales || [];

      // Group by product
      const productMap = new Map<string, ProductStats>();

      sales.forEach((sale: any) => {
        const productName = sale.productName || 'غير محدد';
        const quantity = Number(sale.quantity) || 0;
        const price = Number(sale.price) || 0;
        const total = Number(sale.total) || 0;

        if (productMap.has(productName)) {
          const existing = productMap.get(productName)!;
          existing.totalQuantity += quantity;
          existing.totalSales += 1;
          existing.totalRevenue += total;
          existing.transactionCount += 1;
          existing.averagePrice = existing.totalRevenue / existing.totalQuantity;
        } else {
          productMap.set(productName, {
            productName,
            totalQuantity: quantity,
            totalSales: 1,
            totalRevenue: total,
            averagePrice: price,
            transactionCount: 1,
          });
        }
      });

      const stats = Array.from(productMap.values()).sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );

      setProductsStats(stats);

      // Calculate totals
      const totals = {
        totalRevenue: stats.reduce((sum, p) => sum + p.totalRevenue, 0),
        totalQuantity: stats.reduce((sum, p) => sum + p.totalQuantity, 0),
        totalTransactions: stats.reduce((sum, p) => sum + p.transactionCount, 0),
      };
      setTotalStats(totals);
    } catch (error: any) {
      console.error('Load data error:', error);
      toast.error('❌ فشل تحميل البيانات');
      setProductsStats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info('⏳ جاري تصدير PDF...');

      const headers = ['المنتج', 'الكمية المباعة', 'عدد المبيعات', 'الإيرادات', 'متوسط السعر'];
      const rows = filteredProducts.map((product) => [
        product.productName,
        product.totalQuantity.toFixed(2),
        product.transactionCount.toString(),
        `${product.totalRevenue.toLocaleString('ar-YE')} ريال`,
        `${product.averagePrice.toLocaleString('ar-YE')} ريال`,
      ]);

      const summary = [
        { label: 'إجمالي الإيرادات', value: `${totalStats.totalRevenue.toLocaleString('ar-YE')} ريال` },
        { label: 'إجمالي الكمية المباعة', value: totalStats.totalQuantity.toFixed(2) },
        { label: 'عدد المعاملات', value: totalStats.totalTransactions.toString() },
        { label: 'عدد المنتجات', value: filteredProducts.length.toString() },
      ];

      await exportToPDF(
        'تقرير مبيعات المنتجات',
        headers,
        rows,
        `تقرير_المنتجات_${new Date().toLocaleDateString('ar-YE')}.pdf`,
        summary
      );

      toast.success('✅ تم تصدير PDF بنجاح!');
    } catch (error: any) {
      console.error('Export PDF error:', error);
      toast.error('❌ فشل تصدير PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.info('⏳ جاري تصدير Excel...');

      const headers = ['المنتج', 'الكمية المباعة', 'عدد المبيعات', 'الإيرادات', 'متوسط السعر'];
      const rows = filteredProducts.map((product) => [
        product.productName,
        product.totalQuantity.toFixed(2),
        product.transactionCount.toString(),
        product.totalRevenue.toLocaleString('ar-YE'),
        product.averagePrice.toLocaleString('ar-YE'),
      ]);

      const summary = [
        { label: 'إجمالي الإيرادات', value: totalStats.totalRevenue.toLocaleString('ar-YE') + ' ريال' },
        { label: 'إجمالي الكمية المباعة', value: totalStats.totalQuantity.toFixed(2) },
        { label: 'عدد المعاملات', value: totalStats.totalTransactions.toString() },
      ];

      exportToExcel(
        'تقرير مبيعات المنتجات',
        headers,
        rows,
        `تقرير_المنتجات.xlsx`,
        summary
      );

      toast.success('✅ تم تصدير Excel بنجاح!');
    } catch (error: any) {
      console.error('Export Excel error:', error);
      toast.error('❌ فشل تصدير Excel');
    }
  };

  const handleExportWord = async () => {
    try {
      toast.info('⏳ جاري تصدير Word...');

      const headers = ['المنتج', 'الكمية المباعة', 'عدد المبيعات', 'الإيرادات', 'متوسط السعر'];
      const rows = filteredProducts.map((product) => [
        product.productName,
        product.totalQuantity.toFixed(2),
        product.transactionCount.toString(),
        product.totalRevenue.toLocaleString('ar-YE') + ' ريال',
        product.averagePrice.toLocaleString('ar-YE') + ' ريال',
      ]);

      const summary = [
        { label: 'إجمالي الإيرادات', value: totalStats.totalRevenue.toLocaleString('ar-YE') + ' ريال' },
        { label: 'إجمالي الكمية المباعة', value: totalStats.totalQuantity.toFixed(2) },
        { label: 'عدد المعاملات', value: totalStats.totalTransactions.toString() },
      ];

      exportToWord(
        'تقرير مبيعات المنتجات',
        headers,
        rows,
        `تقرير_المنتجات.doc`,
        summary
      );

      toast.success('✅ تم تصدير Word بنجاح!');
    } catch (error: any) {
      console.error('Export Word error:', error);
      toast.error('❌ فشل تصدير Word');
    }
  };

  const handlePrint = () => {
    try {
      const headers = ['المنتج', 'الكمية المباعة', 'عدد المبيعات', 'الإيرادات', 'متوسط السعر'];
      const rows = filteredProducts.map((product) => [
        product.productName,
        product.totalQuantity.toFixed(2),
        product.transactionCount.toString(),
        product.totalRevenue.toLocaleString('ar-YE') + ' ريال',
        product.averagePrice.toLocaleString('ar-YE') + ' ريال',
      ]);

      const summary = [
        { label: 'إجمالي الإيرادات', value: totalStats.totalRevenue.toLocaleString('ar-YE') + ' ريال' },
        { label: 'إجمالي الكمية المباعة', value: totalStats.totalQuantity.toFixed(2) },
        { label: 'عدد المعاملات', value: totalStats.totalTransactions.toString() },
      ];

      printData('تقرير مبيعات المنتجات', headers, rows, summary);
      toast.success('✅ جاري الطباعة...');
    } catch (error: any) {
      console.error('Print error:', error);
      toast.error('❌ فشل الطباعة');
    }
  };

  const filteredProducts = productsStats.filter(product =>
    product.productName.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
              <Package className="h-8 w-8 text-green-600" />
              تقرير مبيعات المنتجات
            </h1>
            <p className="text-gray-600 mt-1">
              عرض إحصائيات مفصلة لجميع المنتجات ({filteredProducts.length} منتج)
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="ml-2 h-5 w-5" />
              طباعة
            </Button>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <Download className="ml-2 h-5 w-5" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <FileSpreadsheet className="ml-2 h-5 w-5" />
              Excel
            </Button>
            <Button onClick={handleExportWord} variant="outline" size="sm">
              <FileType className="ml-2 h-5 w-5" />
              Word
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {totalStats.totalRevenue.toLocaleString('ar-YE')} ريال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي الكمية المباعة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {totalStats.totalQuantity.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">عدد المعاملا��</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {totalStats.totalTransactions}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا توجد بيانات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية المباعة</TableHead>
                    <TableHead>عدد المبيعات</TableHead>
                    <TableHead>الإيرادات</TableHead>
                    <TableHead>متوسط السعر</TableHead>
                    <TableHead>الحصة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => {
                    const sharePercentage = (product.totalRevenue / totalStats.totalRevenue) * 100;
                    return (
                      <TableRow key={product.productName}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell>{product.totalQuantity.toFixed(2)}</TableCell>
                        <TableCell>{product.transactionCount}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {product.totalRevenue.toLocaleString('ar-YE')} ريال
                        </TableCell>
                        <TableCell>{product.averagePrice.toLocaleString('ar-YE')} ريال</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${sharePercentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{sharePercentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      {!loading && filteredProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              أكثر المنتجات مبيعاً (الـ 5 الأوائل)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProducts.slice(0, 5).map((product, index) => (
                <div key={product.productName} className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${index === 0 ? 'bg-yellow-500 text-white' : ''}
                    ${index === 1 ? 'bg-gray-400 text-white' : ''}
                    ${index === 2 ? 'bg-orange-600 text-white' : ''}
                    ${index > 2 ? 'bg-gray-200 text-gray-700' : ''}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-gray-600">
                      {product.totalQuantity.toFixed(2)} وحدة - {product.transactionCount} عملية
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-600">
                      {product.totalRevenue.toLocaleString('ar-YE')} ريال
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
