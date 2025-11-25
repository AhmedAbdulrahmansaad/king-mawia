import { useState, useEffect } from 'react';
import { FileText, Loader2, DollarSign, CheckCircle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { recordPayment, getDebts } from '../utils/api';
import type { Debt } from '../types';
import { exportToPDF, exportToExcel } from '../utils/exportHelpers';
import { toast } from 'sonner';

export function DebtsManagement() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      setLoading(true);
      const data = await getDebts();
      setDebts(data.debts || []);
    } catch (error) {
      console.error('Failed to load debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) return;

    try {
      await recordPayment(selectedDebt.id, parseFloat(paymentAmount));

      toast.success('✅ تم تسجيل الدفعة بنجاح!');
      setPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedDebt(null);
      loadDebts();
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      toast.error('❌ فشل تسجيل الدفعة: ' + error.message);
    }
  };

  const openPaymentDialog = (debt: Debt) => {
    setSelectedDebt(debt);
    setPaymentAmount((debt.remaining_amount || 0).toString());
    setPaymentDialogOpen(true);
  };

  const totalDebts = debts
    .filter(d => d.status !== 'paid')
    .reduce((sum, debt) => sum + (debt.remaining_amount || 0), 0);
  
  const pendingDebts = debts.filter(d => d.status === 'pending').length;

  const handleExportPDF = async (debts: Debt[]) => {
    try {
      const headers = ['التاريخ', 'اسم العميل', 'المنتج', 'المبلغ الأصلي', 'المدفوع', 'المتبقي', 'الحالة'];
      const rows = debts.map(debt => [
        new Date(debt.sale_date).toLocaleDateString('ar-YE'),
        debt.customer_name,
        debt.product_name,
        (debt.amount || 0).toLocaleString('ar-YE') + ' ريال',
        (debt.paid_amount || 0).toLocaleString('ar-YE') + ' ريال',
        (debt.remaining_amount || 0).toLocaleString('ar-YE') + ' ريال',
        debt.status === 'paid' ? 'مسدد' : debt.status === 'partial' ? 'جزئي' : 'معلق (دين عليه)',
      ]);
      
      const summary = [
        { label: 'إجمالي الديون المتبقية', value: totalDebts.toLocaleString('ar-YE') + ' ريال' },
        { label: 'عدد الديون المعلقة', value: pendingDebts.toString() },
        { label: 'إجمالي الديون', value: debts.length.toString() }
      ];

      await exportToPDF('سجل الديون', headers, rows, `debts_${new Date().toISOString().split('T')[0]}.pdf`, summary);
      toast.success('تم تصدير PDF بنجاح! 📄');
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error('فشل تصدير PDF');
    }
  };

  const handleExportExcel = (debts: Debt[]) => {
    try {
      const headers = ['التاريخ', 'اسم العميل', 'المنتج', 'المبلغ الأصلي', 'المدفوع', 'المتبقي', 'الحالة'];
      const rows = debts.map(debt => [
        new Date(debt.sale_date).toLocaleDateString('ar-YE'),
        debt.customer_name,
        debt.product_name,
        (debt.amount || 0).toLocaleString('ar-YE') + ' ريال',
        (debt.paid_amount || 0).toLocaleString('ar-YE') + ' ريال',
        (debt.remaining_amount || 0).toLocaleString('ar-YE') + ' ريال',
        debt.status === 'paid' ? 'مسدد' : debt.status === 'partial' ? 'جزئي' : 'معلق (دين عليه)',
      ]);
      
      const summary = [
        { label: 'إجمالي الديون المتبقية', value: totalDebts.toLocaleString('ar-YE') + ' ريال' },
        { label: 'عدد الديون المعلقة', value: pendingDebts.toString() },
        { label: 'إجمالي الديون', value: debts.length.toString() }
      ];

      exportToExcel('سجل الديون', headers, rows, `debts_${new Date().toISOString().split('T')[0]}.xlsx`, summary);
      toast.success('تم تصدير Excel بنجاح! 📊');
    } catch (error) {
      console.error('Export Excel error:', error);
      toast.error('فشل تصدير Excel');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">إدارة الديون</h2>
        <p className="text-muted-foreground mt-1">
          متابعة وتحصيل الديون المستحقة
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              إجمالي الديون المتبقية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">
              {totalDebts.toLocaleString('ar-YE')} ريال
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              عدد الديون المعلقة (دين عليه)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-700">
              {pendingDebts}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Debts Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الديون</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : debts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">التاريخ</th>
                    <th className="text-right py-3 px-4">اسم العميل</th>
                    <th className="text-right py-3 px-4">المنتج</th>
                    <th className="text-right py-3 px-4">المبلغ الأصلي</th>
                    <th className="text-right py-3 px-4">المدفوع</th>
                    <th className="text-right py-3 px-4">المتبقي</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((debt) => (
                    <tr key={debt.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(debt.sale_date).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="py-3 px-4 font-semibold">{debt.customer_name}</td>
                      <td className="py-3 px-4">{debt.product_name}</td>
                      <td className="py-3 px-4">{(debt.amount || 0).toLocaleString('ar-YE')} ريال</td>
                      <td className="py-3 px-4 text-green-600">
                        {(debt.paid_amount || 0).toLocaleString('ar-YE')} ريال
                      </td>
                      <td className="py-3 px-4 font-bold text-accent">
                        {(debt.remaining_amount || 0).toLocaleString('ar-YE')} ريال
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            debt.status === 'paid' 
                              ? 'default' 
                              : debt.status === 'partial'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className={debt.status === 'paid' ? 'bg-primary' : ''}
                        >
                          {debt.status === 'paid' 
                            ? 'مسدد' 
                            : debt.status === 'partial'
                            ? 'جزئي'
                            : 'معلق'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {debt.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPaymentDialog(debt)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <CheckCircle className="h-3 w-3 ml-1" />
                            تسجيل دفعة
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد ديون مسجلة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة</DialogTitle>
            <DialogDescription>
              تسجيل دفعة جديدة للعميل: {selectedDebt?.customer_name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">المبلغ الأصلي:</span>
                <span className="font-semibold">{selectedDebt?.amount.toLocaleString('ar-YE')} ريال</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">المدفوع سابقاً:</span>
                <span className="font-semibold text-green-600">
                  {selectedDebt?.paid_amount.toLocaleString('ar-YE')} ريال
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-semibold">المتبقي:</span>
                <span className="font-bold text-accent">
                  {selectedDebt?.remaining_amount.toLocaleString('ar-YE')} ريال
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_amount">المبلغ المدفوع (ريال)</Label>
              <Input
                id="payment_amount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={selectedDebt?.remaining_amount}
                required
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                الحد الأقصى: {selectedDebt?.remaining_amount.toLocaleString('ar-YE')} ريال
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary-dark">
                تسجيل الدفعة
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Export Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleExportPDF(debts)}
          className="text-primary hover:bg-primary/10"
        >
          <Download className="h-3 w-3 ml-1" />
          تصدير كملف PDF
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleExportExcel(debts)}
          className="text-primary hover:bg-primary/10"
        >
          <Download className="h-3 w-3 ml-1" />
          تصير كملف Excel
        </Button>
      </div>
    </div>
  );
}