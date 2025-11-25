import { useState, useMemo } from 'react';
import { Search, FileText, Download, Printer, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Sale {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  sale_date: string;
  payment_status: string;
  customer_name?: string;
}

interface Debt {
  id: string;
  customer_name: string;
  amount: number;
  product_name: string;
  sale_date: string;
  status: string;
  paid_amount: number;
  remaining_amount: number;
}

interface CustomerStatementProps {
  sales: Sale[];
  debts: Debt[];
}

export function CustomerStatement({ sales, debts }: CustomerStatementProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique customer names
  const customers = useMemo(() => {
    const names = new Set<string>();
    sales.forEach(sale => {
      if (sale.customer_name) names.add(sale.customer_name);
    });
    debts.forEach(debt => {
      names.add(debt.customer_name);
    });
    return Array.from(names).sort();
  }, [sales, debts]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    return customers.filter(name => 
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  // Get customer data
  const customerData = useMemo(() => {
    if (!selectedCustomer) return null;

    const customerSales = sales.filter(s => s.customer_name === selectedCustomer);
    const customerDebts = debts.filter(d => d.customer_name === selectedCustomer);
    
    const totalPurchases = customerSales.reduce((sum, s) => sum + s.total, 0);
    const totalDebts = customerDebts.reduce((sum, d) => sum + d.remaining_amount, 0);
    const totalPaid = customerDebts.reduce((sum, d) => sum + d.paid_amount, 0);

    return {
      name: selectedCustomer,
      sales: customerSales,
      debts: customerDebts,
      totalPurchases,
      totalDebts,
      totalPaid,
      balance: totalDebts
    };
  }, [selectedCustomer, sales, debts]);

  const exportCustomerStatement = () => {
    if (!customerData) return;

    const statementHTML = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب - ${customerData.name}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body {
      font-family: 'Arial', 'Simplified Arabic', sans-serif;
      direction: rtl;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 36px; margin: 0; }
    .header h2 { font-size: 24px; margin: 10px 0; }
    .customer-info {
      background: #f0fdf4;
      border: 3px solid #059669;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
    }
    .customer-info h2 {
      color: #047857;
      margin: 0 0 15px 0;
      font-size: 28px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 20px;
    }
    .summary-item {
      background: white;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .summary-item h3 {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 8px 0;
    }
    .summary-item p {
      font-size: 24px;
      font-weight: bold;
      color: #059669;
      margin: 0;
    }
    .section-title {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      font-size: 20px;
      font-weight: bold;
      margin: 30px 0 15px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th {
      background: #059669;
      color: white;
      padding: 15px;
      border: 1px solid #047857;
      font-weight: bold;
    }
    td {
      padding: 12px;
      border: 1px solid #d1d5db;
      text-align: center;
    }
    tr:nth-child(even) { background-color: #f9fafb; }
    .total-row {
      background: #dcfce7;
      font-weight: bold;
      font-size: 16px;
    }
    .balance-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 3px solid #f59e0b;
      border-radius: 12px;
      padding: 25px;
      margin: 30px 0;
      text-align: center;
    }
    .balance-box h3 {
      font-size: 24px;
      color: #92400e;
      margin: 0 0 15px 0;
    }
    .balance-box p {
      font-size: 48px;
      font-weight: bold;
      color: #b45309;
      margin: 0;
    }
    .notes {
      background: #f3f4f6;
      border-right: 5px solid #6b7280;
      padding: 20px;
      margin-top: 30px;
      border-radius: 8px;
    }
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px dashed #d1d5db;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      border-bottom: 2px solid #000;
      width: 200px;
      margin: 30px auto 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏆 نظام ملك الماوية</h1>
    <h2>كشف حساب العميل</h2>
    <p>📅 التاريخ: ${new Date().toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="customer-info">
    <h2><span style="background: #059669; color: white; padding: 8px 15px; border-radius: 8px; display: inline-flex; align-items: center; gap: 10px;">👤 ${customerData.name}</span></h2>
    <div class="summary-grid">
      <div class="summary-item">
        <h3>إجمالي المشتريات</h3>
        <p>${customerData.totalPurchases.toLocaleString()}</p>
      </div>
      <div class="summary-item">
        <h3>إجمالي المدفوع</h3>
        <p style="color: #059669;">${customerData.totalPaid.toLocaleString()}</p>
      </div>
      <div class="summary-item">
        <h3>المتبقي</h3>
        <p style="color: #dc2626;">${customerData.totalDebts.toLocaleString()}</p>
      </div>
      <div class="summary-item">
        <h3>عدد المعاملات</h3>
        <p style="color: #3b82f6;">${customerData.sales.length}</p>
      </div>
    </div>
  </div>

  <div class="section-title">📋 تفاصيل المعاملات</div>
  <table>
    <thead>
      <tr>
        <th>م</th>
        <th>التاريخ</th>
        <th>المنتج</th>
        <th>الكمية</th>
        <th>سعر الوحدة</th>
        <th>المبلغ الإجمالي</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${customerData.sales.map((sale, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${new Date(sale.sale_date).toLocaleDateString('ar-YE')}</td>
          <td><strong>${sale.product_name}</strong></td>
          <td>${sale.quantity}</td>
          <td>${sale.price.toLocaleString()} ريال</td>
          <td><strong>${sale.total.toLocaleString()} ريال</strong></td>
          <td>${sale.payment_status === 'cash' ? '✅ نقدي' : '⏳ دين'}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="5">الإجمالي</td>
        <td colspan="2">${customerData.totalPurchases.toLocaleString()} ريال</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">💰 تفاصيل الديون</div>
  <table>
    <thead>
      <tr>
        <th>م</th>
        <th>التاريخ</th>
        <th>المنتج</th>
        <th>المبلغ الكلي</th>
        <th>المدفوع</th>
        <th>المتبقي</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${customerData.debts.map((debt, index) => {
        const statusIcon = debt.status === 'paid' ? '✅' : debt.status === 'partial' ? '⏳' : '❌';
        const statusText = debt.status === 'paid' ? 'مدفوع بالكامل' : debt.status === 'partial' ? 'مدفوع جزئياً' : 'معلق';
        return `
        <tr>
          <td>${index + 1}</td>
          <td>${new Date(debt.sale_date).toLocaleDateString('ar-YE')}</td>
          <td>${debt.product_name}</td>
          <td>${debt.amount.toLocaleString()} ريال</td>
          <td style="color: #059669;"><strong>${debt.paid_amount.toLocaleString()} ريال</strong></td>
          <td style="color: #dc2626;"><strong>${debt.remaining_amount.toLocaleString()} ريال</strong></td>
          <td>${statusIcon} ${statusText}</td>
        </tr>
        `;
      }).join('')}
      <tr class="total-row">
        <td colspan="4">الإجمالي</td>
        <td style="color: #059669;">${customerData.totalPaid.toLocaleString()} ريال</td>
        <td style="color: #dc2626;">${customerData.totalDebts.toLocaleString()} ريال</td>
        <td>-</td>
      </tr>
    </tbody>
  </table>

  <div class="balance-box">
    <h3>💳 الرصيد المتبقي للعميل</h3>
    <p>${customerData.balance.toLocaleString()} ريال</p>
    <p style="font-size: 16px; color: #92400e; margin-top: 10px;">
      ${customerData.balance > 0 ? '⚠️ يوجد دين متبقي' : '✅ تم السداد بالكامل'}
    </p>
  </div>

  <div class="notes">
    <h3 style="margin: 0 0 10px 0; color: #374151;">📌 ملاحظات:</h3>
    <ul style="margin: 0; padding-right: 20px;">
      <li>هذا الكشف يوضح جميع المعاملات التجارية بين العميل ومؤسسة ملك الماوية</li>
      <li>جميع المبالغ المذكورة بالريال اليمني</li>
      <li>تاريخ إصدار الكشف: ${new Date().toLocaleString('ar-YE')}</li>
      <li>للاستفسارات، يرجى التواصل مع إدارة المؤسسة</li>
    </ul>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <h4>العميل</h4>
      <div class="signature-line"></div>
      <p>الاسم: ${customerData.name}</p>
      <p>التاريخ: _______________</p>
    </div>
    <div class="signature-box">
      <h4>المؤسسة</h4>
      <div class="signature-line"></div>
      <p>مؤسسة ملك الماوية</p>
      <p>التاريخ: _______________</p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #d1d5db; color: #6b7280;">
    <p><strong>نظام ملك الماوية</strong> - نظام إدارة وتجارة القات المتكامل</p>
    <p style="font-size: 12px;">تم الإنشاء تلقائياً بواسطة النظام الإلكتروني ⚡</p>
  </div>
</body>
</html>
`;

    // Create and download
    const blob = new Blob(['\ufeff', statementHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `كشف_حساب_${customerData.name}_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printCustomerStatement = () => {
    if (!customerData) return;
    
    // Similar to export but opens print dialog
    exportCustomerStatement();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            كشف حساب الزبائن
          </CardTitle>
          <CardDescription>
            اختر زبون لعرض كشف حساب شامل بجميع معاملاته
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن زبون..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="اختر زبون" />
              </SelectTrigger>
              <SelectContent>
                {filteredCustomers.map((customer) => (
                  <SelectItem key={customer} value={customer}>
                    {customer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCustomer && customerData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                      <p className="text-2xl font-bold text-primary">
                        {customerData.totalPurchases.toLocaleString()} ريال
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">المدفوع</p>
                      <p className="text-2xl font-bold text-green-600">
                        {customerData.totalPaid.toLocaleString()} ريال
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">المتبقي</p>
                      <p className="text-2xl font-bold text-red-600">
                        {customerData.totalDebts.toLocaleString()} ريال
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">المعاملات</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {customerData.sales.length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button onClick={exportCustomerStatement} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير كشف الحساب (Word)
                </Button>
                <Button onClick={printCustomerStatement} variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  طباعة
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
