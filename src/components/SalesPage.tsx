import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Search, Trash2, Edit, Loader2, ShoppingCart, Download, Printer, FileSpreadsheet, FileType } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getSales, createSale, updateSale, deleteSale, getProducts } from '../utils/api';
import { Skeleton } from './ui/skeleton';
import { convertArabicToEnglish, parseArabicQuantity, parseArabicPrice } from '../utils/arabicNumbers';
import { exportToPDF, exportToExcel, exportToWord, printData } from '../utils/exportHelpers';

const PRODUCTS = [
  'طوفان',
  'طلب خاص',
  'حسين',
  'طلب عمنا',
  'القحطاني',
  'عبيده',
  'رقم واحد',
];

interface SalesPageProps {
  user: any;
}

export function SalesPage({ user }: SalesPageProps) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    price: '',
    customerName: '',
    paymentStatus: 'paid',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [customProduct, setCustomProduct] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await getSales();
      setSales(data.sales);
    } catch (error: any) {
      toast.error('❌ فشل تحميل المبيعات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Use custom product name if selected
      const productName = formData.productName === 'custom' ? customProduct : formData.productName;
      
      const saleData = {
        ...formData,
        productName,
      };

      if (editingSale) {
        await updateSale(editingSale.id, saleData);
        toast.success('✅ تم تحديث البيع بنجاح');
      } else {
        await createSale(saleData);
        toast.success('✅ تم تسجيل البيع بنجاح');
      }
      
      await loadSales();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('❌ ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    setFormData({
      productName: sale.productName || '',
      quantity: (sale.quantity || 0).toString(),
      price: (sale.price || 0).toString(),
      customerName: sale.customerName || '',
      paymentStatus: sale.paymentStatus || 'paid',
      notes: sale.notes || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البيع؟')) return;

    try {
      await deleteSale(id);
      toast.success('✅ تم حذف البيع');
      await loadSales();
    } catch (error: any) {
      toast.error('❌ فشل حذف البيع');
    }
  };

  const resetForm = () => {
    setEditingSale(null);
    setFormData({
      productName: '',
      quantity: '',
      price: '',
      customerName: '',
      paymentStatus: 'paid',
      notes: '',
    });
    setCustomProduct('');
  };

  const filteredSales = sales.filter(sale =>
    sale.productName?.includes(searchQuery) ||
    sale.customerName?.includes(searchQuery) ||
    sale.createdByName?.includes(searchQuery)
  );

  const totalAmount = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);

  const handleExportPDF = async () => {
    try {
      toast.info('⏳ جاري تصدير PDF...');
      
      const headers = ['المنتج', 'الزبون', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'التاريخ'];
      const rows = filteredSales.map(sale => [
        sale.productName || '',
        sale.customerName || '-',
        sale.quantity?.toString() || '',
        `${(sale.price || 0).toLocaleString('ar-YE')} ريال`,
        `${(sale.total || 0).toLocaleString('ar-YE')} ريال`,
        sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه',
        new Date(sale.createdAt).toLocaleDateString('ar-YE')
      ]);

      const summary = [
        { label: 'إجمالي المبيعات', value: `${totalAmount.toLocaleString('ar-YE')} ريال` },
        { label: 'عدد العمليات', value: filteredSales.length.toString() }
      ];

      await exportToPDF(
        'سجل المبيعات - ملك الماوية',
        headers,
        rows,
        `المبيعات-${new Date().toLocaleDateString('ar-YE')}.pdf`,
        summary
      );
      
      toast.success('✅ تم تصدير PDF بنجاح!');
    } catch (error: any) {
      console.error('Export PDF error:', error);
      toast.error('❌ فشل تصدير PDF: ' + error.message);
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.info('⏳ جاري تصدير Excel...');
      
      const headers = ['المنتج', 'الزبون', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'التاريخ'];
      const rows = filteredSales.map(sale => [
        sale.productName || '',
        sale.customerName || '-',
        sale.quantity?.toString() || '',
        `${(sale.price || 0).toLocaleString('ar-YE')} ريال`,
        `${(sale.total || 0).toLocaleString('ar-YE')} ريال`,
        sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه',
        new Date(sale.createdAt).toLocaleDateString('ar-YE')
      ]);

      await exportToExcel(
        'سجل المبيعات - ملك الماوية',
        headers,
        rows,
        `المبيعات-${new Date().toLocaleDateString('ar-YE')}.xlsx`
      );
      
      toast.success('✅ تم تصدير Excel بنجاح!');
    } catch (error: any) {
      console.error('Export Excel error:', error);
      toast.error('❌ فشل تصدير Excel: ' + error.message);
    }
  };

  const handleExportWord = async () => {
    try {
      toast.info('⏳ جاري تصدير Word...');
      
      const headers = ['المنتج', 'الزبون', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'التاريخ'];
      const rows = filteredSales.map(sale => [
        sale.productName || '',
        sale.customerName || '-',
        sale.quantity?.toString() || '',
        `${(sale.price || 0).toLocaleString('ar-YE')} ريال`,
        `${(sale.total || 0).toLocaleString('ar-YE')} ريال`,
        sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه',
        new Date(sale.createdAt).toLocaleDateString('ar-YE')
      ]);

      await exportToWord(
        'سجل المبيعات - ملك الماوية',
        headers,
        rows,
        `المبيعات-${new Date().toLocaleDateString('ar-YE')}.docx`
      );
      
      toast.success('✅ تم تصدير Word بنجاح!');
    } catch (error: any) {
      console.error('Export Word error:', error);
      toast.error('❌ فشل تصدير Word: ' + error.message);
    }
  };

  const handlePrint = () => {
    try {
      const headers = ['المنتج', 'الزبون', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'التاريخ'];
      const rows = filteredSales.map(sale => [
        sale.productName || '',
        sale.customerName || '-',
        sale.quantity?.toString() || '',
        `${(sale.price || 0).toLocaleString('ar-YE')} ريال`,
        `${(sale.total || 0).toLocaleString('ar-YE')} ريال`,
        sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه',
        new Date(sale.createdAt).toLocaleDateString('ar-YE')
      ]);

      printData('سجل المبيعات - ملك الماوية', headers, rows);
      toast.success('✅ جاري الطباعة...');
    } catch (error: any) {
      console.error('Print error:', error);
      toast.error('❌ فشل الطباعة');
    }
  };

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
              <ShoppingCart className="h-8 w-8 text-green-600" />
              إدارة المبيعات
            </h1>
            <p className="text-gray-600 mt-1">
              إجمالي: {totalAmount.toLocaleString('ar-YE')} ريال ({filteredSales.length} عملية)
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handlePrint} 
              variant="outline"
              size="sm"
            >
              <Printer className="ml-2 h-5 w-5" />
              طباعة
            </Button>
            <Button 
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
            >
              <Download className="ml-2 h-5 w-5" />
              تصدير PDF
            </Button>
            <Button 
              onClick={handleExportExcel}
              variant="outline"
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
            >
              <FileSpreadsheet className="ml-2 h-5 w-5" />
              تصدير Excel
            </Button>
            <Button 
              onClick={handleExportWord}
              variant="outline"
              size="sm"
              className="bg-gray-600 text-white hover:bg-gray-700 hover:text-white"
            >
              <FileType className="ml-2 h-5 w-5" />
              تصدير Word
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="ml-2 h-5 w-5" />
                  تسجيل بيع جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingSale ? 'تعديل بيع' : 'تسجيل بيع جديد'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSale ? 'قم بتعديل تفاصيل البيع أدناه' : 'أدخل تفاصيل البيع الجديدة أدناه'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>المنتج *</Label>
                    <Select
                      value={formData.productName}
                      onValueChange={(value) => setFormData({ ...formData, productName: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCTS.map((product) => (
                          <SelectItem key={product} value={product}>
                            {product}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">
                          منتج آخر
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.productName === 'custom' && (
                      <Input
                        type="text"
                        value={customProduct}
                        onChange={(e) => setCustomProduct(e.target.value)}
                        placeholder="اسم المنتج"
                        required
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الكمية *</Label>
                      <Input
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="مثال: 1 أو 3 أو نص أو ربع أو ثلثين"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        📦 أمثلة: 1 حبة، 3 حبات، نص حبة، ربع حبة، ثلثين، 2.5
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>السعر (ريال) *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {formData.quantity && formData.price && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">
                        الإجمالي: <span className="font-bold text-lg">
                          {(Number(formData.quantity) * Number(formData.price)).toLocaleString('ar-YE')} ريال
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>اسم الزبون</Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="اسم الزبون (اختياري)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>حالة الدفع *</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">مدفوع</SelectItem>
                        <SelectItem value="pending">دين عليه</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات</Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="ملاحظات إضافية (اختياري)"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : editingSale ? (
                        'تحديث'
                      ) : (
                        'حفظ'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        resetForm();
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="ابحث عن منتج، زبون، أو بائع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا توجد مبيعات</p>
              <p className="text-sm mt-2">ابدأ بتسجيل أول عملية بيع!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="mobile-responsive-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الزبون</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell data-label="المنتج" className="font-medium">{sale.productName}</TableCell>
                      <TableCell data-label="الزبون">{sale.customerName || '-'}</TableCell>
                      <TableCell data-label="الكمية">{sale.quantity || 0}</TableCell>
                      <TableCell data-label="السعر">{(sale.price || 0).toLocaleString('ar-YE')}</TableCell>
                      <TableCell data-label="الإجمالي" className="font-bold text-green-600">
                        {(sale.total || 0).toLocaleString('ar-YE')} ريال
                      </TableCell>
                      <TableCell data-label="الحالة">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            sale.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه'}
                        </span>
                      </TableCell>
                      <TableCell data-label="التاريخ" className="text-xs text-gray-600">
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('ar-YE', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '-'}
                      </TableCell>
                      <TableCell data-label="إجراءات">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(sale)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user?.role === 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(sale.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}