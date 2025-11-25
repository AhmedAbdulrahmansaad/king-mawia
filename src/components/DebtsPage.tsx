import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DollarSign, Plus, Search, Trash2, Edit, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getDebts, createDebt, updateDebt, deleteDebt } from '../utils/api';
import { Skeleton } from './ui/skeleton';

export function DebtsPage({ user }: any) {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    notes: '',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  useEffect(() => {
    loadDebts();
    updateDateTime();
    
    // الاستماع لتحديثات الديون من المساعد الذكي
    const handleDebtsUpdate = () => {
      console.log('تم استقبال تحديث الديون من المساعد الذكي');
      loadDebts();
    };
    
    window.addEventListener('debtsUpdated', handleDebtsUpdate);
    
    // Update date/time every minute
    const interval = setInterval(updateDateTime, 60000);
    
    return () => {
      window.removeEventListener('debtsUpdated', handleDebtsUpdate);
      clearInterval(interval);
    };
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('ar-SA', options);
    const dayStr = now.toLocaleDateString('ar-SA', { weekday: 'long' });
    
    setCurrentDate(dateStr);
    setCurrentDay(dayStr);
  };

  const loadDebts = async () => {
    try {
      const data = await getDebts();
      setDebts(data.debts);
    } catch (error: any) {
      toast.error('❌ فشل تحميل الديون');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingDebt) {
        await updateDebt(editingDebt.id, formData);
        toast.success('✅ تم تحديث الدين بنجاح');
      } else {
        await createDebt(formData);
        toast.success('✅ تم تسجيل الدين بنجاح');
      }
      
      await loadDebts();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('❌ ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newPaid = editingDebt.paid + Number(paymentAmount);
      await updateDebt(editingDebt.id, { paid: newPaid });
      toast.success('✅ تم تسجيل الدفعة بنجاح');
      await loadDebts();
      setPaymentDialogOpen(false);
      setEditingDebt(null);
      setPaymentAmount('');
    } catch (error: any) {
      toast.error('❌ ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (debt: any) => {
    setEditingDebt(debt);
    setFormData({
      customerName: debt.customerName || '',
      amount: (debt.amount || 0).toString(),
      notes: debt.notes || '',
      dueDate: debt.dueDate || '',
    });
    setDialogOpen(true);
  };

  const openPaymentDialog = (debt: any) => {
    setEditingDebt(debt);
    setPaymentAmount('');
    setPaymentDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدين؟')) return;

    try {
      await deleteDebt(id);
      toast.success('✅ تم حذف الدين');
      await loadDebts();
    } catch (error: any) {
      toast.error('❌ فشل حذف الدين');
    }
  };

  const resetForm = () => {
    setEditingDebt(null);
    setFormData({
      customerName: '',
      amount: '',
      notes: '',
      dueDate: '',
    });
  };

  const filteredDebts = debts.filter(debt =>
    debt.customerName?.includes(searchQuery) ||
    debt.notes?.includes(searchQuery)
  );

  const totalDebts = filteredDebts.reduce((sum, debt) => sum + (debt.remaining || 0), 0);
  const pendingDebts = filteredDebts.filter(d => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-red-600" />
            إدارة الديون
          </h1>
          <p className="text-gray-600 mt-1">
            إجمالي الديون: {totalDebts.toLocaleString('ar-YE')} ريال ({pendingDebts} معلق)
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="ml-2 h-5 w-5" />
              تسجيل دين جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDebt ? 'تعديل دين' : 'تسجيل دين جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingDebt ? 'قم بتعديل بيانات الدين أدناه' : 'أدخل بيانات الدين الجديدة أدناه'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>اسم الزبون *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="اسم الزبون"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>المبلغ (ريال) *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>تاريخ الاستحقاق</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : editingDebt ? (
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
      </motion.div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة</DialogTitle>
            <DialogDescription>
              أدخل مبلغ الدفعة أدناه
            </DialogDescription>
          </DialogHeader>
          
          {editingDebt && (
            <form onSubmit={handlePayment} className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="text-sm text-gray-600">الزبون: <span className="font-bold">{editingDebt.customerName}</span></p>
                <p className="text-sm text-gray-600">المبلغ الكلي: <span className="font-bold">{(editingDebt.amount || 0).toLocaleString('ar-YE')} ريال</span></p>
                <p className="text-sm text-gray-600">المدفوع: <span className="font-bold text-green-600">{(editingDebt.paid || 0).toLocaleString('ar-YE')} ريال</span></p>
                <p className="text-sm text-gray-600">المتبقي: <span className="font-bold text-red-600">{(editingDebt.remaining || 0).toLocaleString('ar-YE')} ريال</span></p>
              </div>

              <div className="space-y-2">
                <Label>مبلغ الدفعة (ريال) *</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  required
                  min="0.01"
                  max={editingDebt.remaining || 0}
                  step="0.01"
                />
              </div>

              {paymentAmount && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    المتبقي بعد الدفع: <span className="font-bold">
                      {(editingDebt.remaining - Number(paymentAmount)).toLocaleString('ar-YE')} ريال
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'تسجيل الدفعة'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPaymentDialogOpen(false);
                    setEditingDebt(null);
                    setPaymentAmount('');
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Date and Day Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                  📅
                </div>
                <div>
                  <p className="text-xs text-gray-600">التاريخ الهجري</p>
                  <p className="font-bold text-red-700">{currentDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                  🌙
                </div>
                <div>
                  <p className="text-xs text-gray-600">اليوم</p>
                  <p className="font-bold text-red-700">{currentDay}</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="ابحث عن زبون أو ملاحظة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debts Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredDebts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا توجد ديون</p>
              <p className="text-sm mt-2">الحمد لله! لا توجد ديون مسجلة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="mobile-responsive-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>الزبون</TableHead>
                    <TableHead>المبلغ الكلي</TableHead>
                    <TableHead>المدفوع</TableHead>
                    <TableHead>المتبقي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الاستحقاق</TableHead>
                    <TableHead>ملاحظات</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDebts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell data-label="الزبون" className="font-medium">{debt.customerName}</TableCell>
                      <TableCell data-label="المبلغ الكلي">{(debt.amount || 0).toLocaleString('ar-YE')} ريال</TableCell>
                      <TableCell data-label="المدفوع" className="text-green-600">{(debt.paid || 0).toLocaleString('ar-YE')} ريال</TableCell>
                      <TableCell data-label="المتبقي" className="font-bold text-red-600">
                        {(debt.remaining || 0).toLocaleString('ar-YE')} ريال
                      </TableCell>
                      <TableCell data-label="الحالة">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            debt.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {debt.status === 'paid' ? 'مسدد' : 'معلق'}
                        </span>
                      </TableCell>
                      <TableCell data-label="تاريخ الاستحقاق" className="text-sm">
                        {debt.dueDate
                          ? new Date(debt.dueDate).toLocaleDateString('ar-YE')
                          : '-'}
                      </TableCell>
                      <TableCell data-label="ملاحظات" className="text-sm text-gray-600">{debt.notes || '-'}</TableCell>
                      <TableCell data-label="إجراءات">
                        <div className="flex gap-2">
                          {debt.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPaymentDialog(debt)}
                              className="text-green-600"
                            >
                              دفع
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(debt)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user?.role === 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(debt.id)}
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