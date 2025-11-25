import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Users, Search, FileText, Download, Printer, FileSpreadsheet, FileType, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getCustomers, getCustomerStatement } from '../utils/api';
import { Skeleton } from './ui/skeleton';
import { exportToPDF, exportToExcel, exportToWord, printData } from '../utils/exportHelpers';

interface CustomersStatementsProps {
  user: any;
}

export function CustomersStatements({ user }: CustomersStatementsProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statement, setStatement] = useState<any>(null);
  const [deletingStatement, setDeletingStatement] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      console.log('Customers data:', data);
      setCustomers(data.customers || []);
    } catch (error: any) {
      console.error('Load customers error:', error);
      toast.error('❌ فشل تحميل قائمة الزبائن');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatement = async (customerName: string) => {
    try {
      setStatementLoading(true);
      const data = await getCustomerStatement(customerName);
      console.log('Statement data:', data);
      setStatement(data);
    } catch (error: any) {
      console.error('Load statement error:', error);
      toast.error('❌ فشل تحميل كشف الحساب');
    } finally {
      setStatementLoading(false);
    }
  };

  const handleViewStatement = async (customer: any) => {
    setSelectedCustomer(customer);
    await loadStatement(customer.name);
  };

  const handleExportPDF = async () => {
    if (!statement) return;

    try {
      toast.info('⏳ جاري تصدير PDF...');

      const headers = ['المنتج', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'التاريخ'];
      const rows = statement.sales.map((sale: any) => [
        sale.productName || '-',
        sale.quantity?.toString() || '0',
        `${(sale.price || 0).toLocaleString('ar-YE')} ريال`,
        `${(sale.total || 0).toLocaleString('ar-YE')} ريال`,
        sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه',
        new Date(sale.createdAt).toLocaleDateString('ar-YE'),
      ]);

      const summary = [
        { label: 'اسم الزبون', value: statement.customerName },
        { label: 'إجمالي المشتريات', value: `${statement.summary.totalPurchases.toLocaleString('ar-YE')} ريال` },
        { label: 'المدفوع', value: `${statement.summary.totalPaid.toLocaleString('ar-YE')} ريال` },
        { label: 'الديون المتبقية', value: `${statement.summary.totalDebts.toLocaleString('ar-YE')} ريال` },
        { label: 'عدد المعاملات', value: statement.summary.transactionCount.toString() },
      ];

      await exportToPDF(
        `كشف حساب - ${statement.customerName}`,
        headers,
        rows,
        `كشف_حساب_${statement.customerName}_${new Date().toLocaleDateString('ar-YE')}.pdf`,
        summary
      );

      toast.success('✅ تم تصدير PDF بنجاح!');
    } catch (error: any) {
      console.error('Export PDF error:', error);
      toast.error('❌ فشل تصدير PDF');
    }
  };

  const handleExportExcel = async () => {
    if (!statement) return;

    try {
      toast.info('⏳ جاري تصدير Excel...');

      const headers = ['المنتج', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'التاريخ'];
      const rows = statement.sales.map((sale: any) => [
        sale.productName || '-',
        sale.quantity?.toString() || '0',
        (sale.price || 0).toLocaleString('ar-YE'),
        (sale.total || 0).toLocaleString('ar-YE'),
        sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه',
        new Date(sale.createdAt).toLocaleDateString('ar-YE'),
      ]);

      const summary = [
        { label: 'اسم الزبون', value: statement.customerName },
        { label: 'إجمالي المشتريات', value: statement.summary.totalPurchases.toLocaleString('ar-YE') + ' ريال' },
        { label: 'المدفوع', value: statement.summary.totalPaid.toLocaleString('ar-YE') + ' ريال' },
        { label: 'الديون المتبقية', value: statement.summary.totalDebts.toLocaleString('ar-YE') + ' ريال' },
      ];

      exportToExcel(
        `كشف حساب - ${statement.customerName}`,
        headers,
        rows,
        `كشف_حساب_${statement.customerName}.xlsx`,
        summary
      );

      toast.success('✅ تم تصدير Excel بنجاح!');
    } catch (error: any) {
      console.error('Export Excel error:', error);
      toast.error('❌ فشل تصدير Excel');
    }
  };

  const handleExportWord = async () => {
    if (!statement) return;

    try {
      toast.info('⏳ جاري تصدير Word...');

      const headers = ['المنتج', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'التاريخ'];
      const rows = statement.sales.map((sale: any) => [
        sale.productName || '-',
        sale.quantity?.toString() || '0',
        (sale.price || 0).toLocaleString('ar-YE') + ' ريال',
        (sale.total || 0).toLocaleString('ar-YE') + ' ريال',
        sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه',
        new Date(sale.createdAt).toLocaleDateString('ar-YE'),
      ]);

      const summary = [
        { label: 'اسم الزبون', value: statement.customerName },
        { label: 'إجمالي المشتريات', value: statement.summary.totalPurchases.toLocaleString('ar-YE') + ' ريال' },
        { label: 'المدفوع', value: statement.summary.totalPaid.toLocaleString('ar-YE') + ' ريال' },
        { label: 'الديون المتبقية', value: statement.summary.totalDebts.toLocaleString('ar-YE') + ' ريال' },
      ];

      exportToWord(
        `كشف حساب - ${statement.customerName}`,
        headers,
        rows,
        `كشف_حساب_${statement.customerName}.doc`,
        summary
      );

      toast.success('✅ تم تصدير Word بنجاح!');
    } catch (error: any) {
      console.error('Export Word error:', error);
      toast.error('❌ فشل تصدير Word');
    }
  };

  const handlePrint = () => {
    if (!statement) return;

    try {
      const headers = ['المنتج', 'الكمية', 'السعر', 'الإجمالي', 'الحالة', 'التاريخ'];
      const rows = statement.sales.map((sale: any) => [
        sale.productName || '-',
        sale.quantity?.toString() || '0',
        (sale.price || 0).toLocaleString('ar-YE') + ' ريال',
        (sale.total || 0).toLocaleString('ar-YE') + ' ريال',
        sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه',
        new Date(sale.createdAt).toLocaleDateString('ar-YE'),
      ]);

      const summary = [
        { label: 'اسم الزبون', value: statement.customerName },
        { label: 'إجمالي المشتريات', value: statement.summary.totalPurchases.toLocaleString('ar-YE') + ' ريال' },
        { label: 'المدفوع', value: statement.summary.totalPaid.toLocaleString('ar-YE') + ' ريال' },
        { label: 'الديون المتبقية', value: statement.summary.totalDebts.toLocaleString('ar-YE') + ' ريال' },
      ];

      printData(`كشف حساب - ${statement.customerName}`, headers, rows, summary);
      toast.success('✅ جاري الطباعة...');
    } catch (error: any) {
      console.error('Print error:', error);
      toast.error('❌ فشل الطباعة');
    }
  };

  const handleDeleteCustomerData = async (customerName: string) => {
    if (!isAdmin) {
      toast.error('❌ غير مصرح لك بالحذف - صلاحيات المدير فقط');
      return;
    }

    if (!confirm(`⚠️ تحذير!\n\nهل أنت متأكد من حذف جميع بيانات العميل "${customerName}"؟\n\nسيتم حذف:\n• جميع المبيعات\n• جميع الديون\n• جميع السجلات المرتبطة\n\n⛔ لا يمكن التراجع عن هذا الإجراء!`)) {
      return;
    }

    try {
      setDeletingStatement(true);
      
      const { projectId, publicAnonKey } = await import('../utils/supabase/info.tsx');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-06efd250/customers/${encodeURIComponent(customerName)}/sales`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل الحذف');
      }

      const result = await response.json();
      
      toast.success(`✅ تم حذف بيانات العميل "${customerName}" بنجاح!\n🗑️ تم حذف ${result.deletedCount} سجل`);
      
      // إعادة تحميل القائمة
      await loadCustomers();
      setSelectedCustomer(null);
      setStatement(null);
    } catch (error: any) {
      console.error('Delete customer data error:', error);
      toast.error(`❌ فشل حذف بيانات العميل: ${error.message}`);
    } finally {
      setDeletingStatement(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            كشوفات حسابات الزبائن
          </h1>
          <p className="text-gray-600 mt-1">
            عرض كشوفات حسابات جميع الزبائن ({filteredCustomers.length} زبون)
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="ابحث عن زبون..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا يوجد زبائن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الزبون</TableHead>
                    <TableHead>إجمالي المشتريات</TableHead>
                    <TableHead>الديون المتبقية</TableHead>
                    <TableHead>عدد المعاملات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.name}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{(customer.totalPurchases || 0).toLocaleString('ar-YE')} ريال</TableCell>
                      <TableCell className={customer.totalDebts > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                        {(customer.totalDebts || 0).toLocaleString('ar-YE')} ريال
                      </TableCell>
                      <TableCell>{customer.transactionCount || 0}</TableCell>
                      <TableCell>
                        {customer.hasDebts ? (
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                            عليه ديون
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            لا يوجد ديون
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStatement(customer)}
                        >
                          <FileText className="ml-2 h-4 w-4" />
                          عرض الكشف
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statement Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>كشف حساب - {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              عرض تفاصيل المعاملات والديون للزبون
            </DialogDescription>
          </DialogHeader>

          {statementLoading ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : statement ? (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ملخص الحساب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                      <p className="text-xl font-bold text-green-600">
                        {statement.summary.totalPurchases.toLocaleString('ar-YE')} ريال
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المدفوع</p>
                      <p className="text-xl font-bold text-blue-600">
                        {statement.summary.totalPaid.toLocaleString('ar-YE')} ريال
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الديون المتبقية</p>
                      <p className="text-xl font-bold text-red-600">
                        {statement.summary.totalDebts.toLocaleString('ar-YE')} ريال
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">عدد المعاملات</p>
                      <p className="text-xl font-bold">
                        {statement.summary.transactionCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة
                </Button>
                <Button onClick={handleExportPDF} variant="outline" size="sm">
                  <Download className="ml-2 h-4 w-4" />
                  PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline" size="sm">
                  <FileSpreadsheet className="ml-2 h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={handleExportWord} variant="outline" size="sm">
                  <FileType className="ml-2 h-4 w-4" />
                  Word
                </Button>
                {isAdmin && (
                  <Button
                    onClick={() => handleDeleteCustomerData(selectedCustomer.name)}
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف بيانات العميل
                  </Button>
                )}
              </div>

              {/* Sales Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">تفاصيل المبيعات</CardTitle>
                </CardHeader>
                <CardContent>
                  {statement.sales.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد مبيعات</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>المنتج</TableHead>
                            <TableHead>الكمية</TableHead>
                            <TableHead>السعر</TableHead>
                            <TableHead>الإجمالي</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>التاريخ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {statement.sales.map((sale: any) => (
                            <TableRow key={sale.id}>
                              <TableCell className="font-medium">{sale.productName}</TableCell>
                              <TableCell>{sale.quantity}</TableCell>
                              <TableCell>{(sale.price || 0).toLocaleString('ar-YE')}</TableCell>
                              <TableCell className="font-bold">
                                {(sale.total || 0).toLocaleString('ar-YE')} ريال
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    sale.paymentStatus === 'paid'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {sale.paymentStatus === 'paid' ? 'مدفوع' : 'دين عليه'}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(sale.createdAt).toLocaleDateString('ar-YE')}
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
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}