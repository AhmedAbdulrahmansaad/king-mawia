import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileText, Download, Printer, Search, Users, DollarSign, Calendar, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { exportToPDF } from '../utils/exportHelpers';

interface Debt {
  id: string;
  customerName: string;
  amount: number;
  paid: number;
  remaining: number;
  status: string;
  createdAt: string;
  notes?: string;
}

interface CustomerDebtSummary {
  customerName: string;
  totalDebt: number;
  totalPaid: number;
  totalRemaining: number;
  debtsCount: number;
  debts: Debt[];
}

export function CustomerDebtReports({ user }: any) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerSummaries, setCustomerSummaries] = useState<CustomerDebtSummary[]>([]);

  useEffect(() => {
    loadDebts();
  }, []);

  useEffect(() => {
    if (debts.length > 0) {
      calculateCustomerSummaries();
    }
  }, [debts]);

  const loadDebts = async () => {
    try {
      setLoading(true);
      // Load actual debts from API
      const { getDebts } = await import('../utils/api');
      const response = await getDebts();
      
      // Map debts to the correct format
      const mappedDebts: Debt[] = (response.debts || []).map((debt: any) => ({
        id: debt.id,
        customerName: debt.customer_name || 'غير محدد',
        amount: debt.amount || 0,
        paid: debt.paid_amount || 0,
        remaining: debt.remaining_amount || 0,
        status: debt.status || 'pending',
        createdAt: debt.createdAt || debt.sale_date || new Date().toISOString(),
        notes: debt.notes || ''
      }));
      
      setDebts(mappedDebts);
    } catch (error) {
      console.error('Failed to load debts:', error);
      toast.error('❌ فشل تحميل الديون');
    } finally {
      setLoading(false);
    }
  };

  const calculateCustomerSummaries = () => {
    const customerMap = new Map<string, CustomerDebtSummary>();

    debts.forEach(debt => {
      if (!customerMap.has(debt.customerName)) {
        customerMap.set(debt.customerName, {
          customerName: debt.customerName,
          totalDebt: 0,
          totalPaid: 0,
          totalRemaining: 0,
          debtsCount: 0,
          debts: []
        });
      }

      const summary = customerMap.get(debt.customerName)!;
      summary.totalDebt += debt.amount;
      summary.totalPaid += debt.paid;
      summary.totalRemaining += debt.remaining;
      summary.debtsCount += 1;
      summary.debts.push(debt);
    });

    const summaries = Array.from(customerMap.values()).sort((a, b) => 
      b.totalRemaining - a.totalRemaining
    );

    setCustomerSummaries(summaries);
  };

  const filteredSummaries = customerSummaries.filter(summary =>
    summary.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generatePDFReport = async (summary: CustomerDebtSummary) => {
    try {
      // Create simple HTML-based PDF using print
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('❌ يرجى السماح بالنوافذ المنبثقة');
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>كشف حساب ${summary.customerName}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: 'Arial', 'Tahoma', sans-serif;
              direction: rtl;
              margin: 0;
              padding: 20px;
            }

            .header {
              text-align: center;
              border-bottom: 3px solid #16a34a;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }

            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #16a34a;
              margin-bottom: 10px;
            }

            .title {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              margin: 10px 0;
            }

            .date {
              font-size: 12px;
              color: #666;
            }

            .summary {
              background: #f0fdf4;
              border: 2px solid #16a34a;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              font-size: 14px;
            }

            .summary-label {
              font-weight: bold;
              color: #059669;
            }

            .summary-value {
              font-weight: bold;
            }

            .remaining {
              color: #dc2626;
              font-size: 18px;
            }

            .debts-section {
              margin-top: 30px;
            }

            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #16a34a;
              border-bottom: 2px solid #16a34a;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }

            .debt-item {
              border: 1px solid #d1d5db;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 15px;
              background: white;
              page-break-inside: avoid;
            }

            .debt-header {
              font-weight: bold;
              color: #16a34a;
              margin-bottom: 8px;
              font-size: 14px;
            }

            .debt-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 12px;
            }

            .detail-row {
              display: flex;
              justify-content: space-between;
            }

            .detail-label {
              color: #6b7280;
            }

            .detail-value {
              font-weight: bold;
            }

            .status-paid {
              color: #16a34a;
              background: #f0fdf4;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
            }

            .status-pending {
              color: #dc2626;
              background: #fef2f2;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
            }

            .footer {
              position: fixed;
              bottom: 15mm;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 10px;
              color: #999;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🏆 ملك الماوية</div>
            <div class="title">كشف حساب الزبون</div>
            <div class="date">التاريخ: ${new Date().toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</div>
          </div>

          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">اسم الزبون:</span>
              <span class="summary-value">${summary.customerName}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">إجمالي الديون:</span>
              <span class="summary-value">${summary.totalDebt.toLocaleString('ar-SA')} ريال يمني</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">المبلغ المدفوع:</span>
              <span class="summary-value">${summary.totalPaid.toLocaleString('ar-SA')} ريال يمني</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">المبلغ المتبقي:</span>
              <span class="summary-value remaining">${summary.totalRemaining.toLocaleString('ar-SA')} ريال يمني</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">عدد العمليات:</span>
              <span class="summary-value">${summary.debtsCount}</span>
            </div>
          </div>

          <div class="debts-section">
            <div class="section-title">تفاصيل الديون</div>
            
            ${summary.debts.map((debt, index) => `
              <div class="debt-item">
                <div class="debt-header">
                  عملية #${index + 1} - ${new Date(debt.createdAt).toLocaleDateString('ar-SA')}
                </div>
                <div class="debt-details">
                  <div class="detail-row">
                    <span class="detail-label">المبلغ:</span>
                    <span class="detail-value">${debt.amount.toLocaleString('ar-SA')} ريال</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">المدفوع:</span>
                    <span class="detail-value">${debt.paid.toLocaleString('ar-SA')} ريال</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">المتبقي:</span>
                    <span class="detail-value" style="color: ${debt.remaining > 0 ? '#dc2626' : '#16a34a'};">
                      ${debt.remaining.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">الحالة:</span>
                    <span class="${debt.status === 'paid' ? 'status-paid' : 'status-pending'}">
                      ${debt.status === 'paid' ? '✅ مدفوع' : '⏳ معلق'}
                    </span>
                  </div>
                </div>
                ${debt.notes ? `
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #d1d5db;">
                    <span class="detail-label">ملاحظات:</span>
                    <span style="margin-right: 5px;">${debt.notes}</span>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <div class="footer">
            نظام ملك الماوية - كشف حساب ${summary.customerName} - ${new Date().toLocaleDateString('ar-SA')}
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 100);
              }, 500);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      
      toast.success('✅ تم إنشاء كشف الحساب بنجاح');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('❌ فشل إنشاء ملف PDF');
    }
  };

  const generateExcelReport = (summary: CustomerDebtSummary) => {
    try {
      let csv = 'الزبون,التاريخ,المبلغ,المدفوع,المتبقي,الحالة,الملاحظات\n';
      
      summary.debts.forEach(debt => {
        csv += `${summary.customerName},`;
        csv += `${new Date(debt.createdAt).toLocaleDateString('ar-YE')},`;
        csv += `${debt.amount},`;
        csv += `${debt.paid},`;
        csv += `${debt.remaining},`;
        csv += `${debt.status === 'paid' ? 'مدفوع' : 'معلق'},`;
        csv += `"${debt.notes || ''}"\n`;
      });
      
      // Add summary
      csv += '\n';
      csv += `إجمالي الديون,,${summary.totalDebt},,,\n`;
      csv += `إجمالي المدفوع,,${summary.totalPaid},,,\n`;
      csv += `إجمالي المتبقي,,${summary.totalRemaining},,,\n`;
      
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `كشف_حساب_${summary.customerName}_${new Date().toLocaleDateString('ar-YE')}.csv`;
      link.click();
      
      toast.success('✅ تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('❌ فشل تصدير البيانات');
    }
  };

  const printCustomerReport = (summary: CustomerDebtSummary) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب - ${summary.customerName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            direction: rtl;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #16a34a;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #16a34a;
            margin: 0;
            font-size: 32px;
          }
          .header h2 {
            color: #333;
            margin: 10px 0;
          }
          .summary {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #86efac;
          }
          .summary-item:last-child {
            border-bottom: none;
          }
          .summary-item.highlight {
            font-weight: bold;
            font-size: 18px;
            color: #dc2626;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 12px;
            text-align: right;
            border: 1px solid #ddd;
          }
          th {
            background-color: #16a34a;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 2px solid #16a34a;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏆 ملك الماوية</h1>
          <h2>كشف حساب الزبون: ${summary.customerName}</h2>
          <p>التاريخ: ${new Date().toLocaleDateString('ar-YE')} - ${new Date().toLocaleTimeString('ar-YE')}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <span>إجمالي الديون:</span>
            <strong>${summary.totalDebt.toLocaleString('ar-YE')} ريال</strong>
          </div>
          <div class="summary-item">
            <span>المبلغ المدفوع:</span>
            <strong>${summary.totalPaid.toLocaleString('ar-YE')} ريال</strong>
          </div>
          <div class="summary-item highlight">
            <span>المبلغ المتبقي:</span>
            <strong>${summary.totalRemaining.toLocaleString('ar-YE')} ريال</strong>
          </div>
          <div class="summary-item">
            <span>عدد العمليات:</span>
            <strong>${summary.debtsCount}</strong>
          </div>
        </div>

        <h3>تفاصيل الديون</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>التاريخ</th>
              <th>المبلغ</th>
              <th>المدفوع</th>
              <th>المتبقي</th>
              <th>الحالة</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${summary.debts.map((debt, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${new Date(debt.createdAt).toLocaleDateString('ar-YE')}</td>
                <td>${debt.amount.toLocaleString('ar-YE')}</td>
                <td>${debt.paid.toLocaleString('ar-YE')}</td>
                <td>${debt.remaining.toLocaleString('ar-YE')}</td>
                <td>${debt.status === 'paid' ? '✅ مدفوع' : '⏳ معلق'}</td>
                <td>${debt.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>نظام إدارة مبيعات القات - ملك الماوية</p>
          <p>تم الإنشاء بواسطة: ${user.name}</p>
        </div>

        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          تقارير الديون حسب الزبون
        </h1>
        <p className="text-gray-600 mt-1">
          كشوفات حساب مفصلة لكل زبون مع إمكانية الطباعة والتصدير
        </p>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الزبائن</p>
                <p className="text-3xl font-bold text-blue-600">{customerSummaries.length}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الديون</p>
                <p className="text-2xl font-bold text-red-600">
                  {customerSummaries.reduce((sum, s) => sum + s.totalRemaining, 0).toLocaleString('ar-YE')}
                </p>
                <p className="text-xs text-gray-500">ريال</p>
              </div>
              <DollarSign className="h-10 w-10 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المدفوعات</p>
                <p className="text-2xl font-bold text-green-600">
                  {customerSummaries.reduce((sum, s) => sum + s.totalPaid, 0).toLocaleString('ar-YE')}
                </p>
                <p className="text-xs text-gray-500">ريال</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">عدد العمليات</p>
                <p className="text-3xl font-bold text-purple-600">{debts.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن زبون..."
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSummaries.map((summary, index) => (
          <motion.div
            key={summary.customerName}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {summary.customerName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{summary.customerName}</CardTitle>
                      <p className="text-sm text-gray-500">{summary.debtsCount} عملية</p>
                    </div>
                  </div>
                  <Badge 
                    variant={summary.totalRemaining > 0 ? 'destructive' : 'default'}
                    className={summary.totalRemaining > 0 ? 'bg-red-600' : 'bg-green-600'}
                  >
                    {summary.totalRemaining > 0 ? '⏳ ديون معلقة' : '✅ مسدد'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">إجمالي الديون</p>
                    <p className="font-bold text-gray-900">{summary.totalDebt.toLocaleString('ar-YE')}</p>
                    <p className="text-xs text-gray-500">ريال</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">المدفوع</p>
                    <p className="font-bold text-green-600">{summary.totalPaid.toLocaleString('ar-YE')}</p>
                    <p className="text-xs text-gray-500">ريال</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">المتبقي</p>
                    <p className="font-bold text-red-600">{summary.totalRemaining.toLocaleString('ar-YE')}</p>
                    <p className="text-xs text-gray-500">ريال</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => generatePDFReport(summary)}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تنزيل PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => generateExcelReport(summary)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تنزيل Excel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => printCustomerReport(summary)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Printer className="ml-2 h-4 w-4" />
                    طباعة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredSummaries.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'لم يتم العثور على نتائج' : 'لا توجد ديون مسجلة'}
          </p>
        </Card>
      )}
    </div>
  );
}