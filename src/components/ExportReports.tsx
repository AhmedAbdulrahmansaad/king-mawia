import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Sale {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  seller_name: string;
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

interface ExportReportsProps {
  sales: Sale[];
  debts: Debt[];
}

export function ExportReports({ sales, debts }: ExportReportsProps) {
  
  const exportToExcel = () => {
    // Calculate summary
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalDebts = debts.reduce((sum, debt) => sum + debt.remaining_amount, 0);
    const cashSales = sales.filter(s => s.payment_status === 'cash').reduce((sum, sale) => sum + sale.total, 0);

    // Create Excel content with proper formatting
    let excelContent = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial; direction: rtl; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th { background-color: #059669; color: white; padding: 12px; border: 1px solid #000; font-weight: bold; }
    td { padding: 10px; border: 1px solid #000; text-align: center; }
    .summary { background-color: #f0fdf4; font-weight: bold; }
    .header { text-align: center; background-color: #059669; color: white; padding: 20px; margin-bottom: 20px; }
    .section-title { background-color: #e0e7ff; padding: 10px; font-weight: bold; margin-top: 20px; }
    tr:nth-child(even) { background-color: #f9fafb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>نظام ملك الماوية</h1>
    <h2>تقرير المبيعات والديون الشامل</h2>
    <p>التاريخ: ${new Date().toLocaleDateString('ar-YE')}</p>
  </div>

  <div class="section-title">📊 ملخص عام</div>
  <table>
    <tr>
      <th>إجمالي المبيعات</th>
      <th>المبيعات النقدية</th>
      <th>إجمالي الديون</th>
      <th>الصافي</th>
    </tr>
    <tr class="summary">
      <td>${totalSales.toLocaleString()} ريال</td>
      <td>${cashSales.toLocaleString()} ريال</td>
      <td>${totalDebts.toLocaleString()} ريال</td>
      <td>${(totalSales - totalDebts).toLocaleString()} ريال</td>
    </tr>
  </table>

  <div class="section-title">💵 تفاصيل المبيعات</div>
  <table>
    <thead>
      <tr>
        <th>التاريخ</th>
        <th>المنتج</th>
        <th>الكمية</th>
        <th>السعر</th>
        <th>الإجمالي</th>
        <th>البائع</th>
        <th>الحالة</th>
        <th>الزبون</th>
      </tr>
    </thead>
    <tbody>
`;

    sales.forEach(sale => {
      excelContent += `
      <tr>
        <td>${new Date(sale.sale_date).toLocaleDateString('ar-YE')}</td>
        <td>${sale.product_name}</td>
        <td>${sale.quantity}</td>
        <td>${sale.price.toLocaleString()}</td>
        <td>${sale.total.toLocaleString()}</td>
        <td>${sale.seller_name}</td>
        <td>${sale.payment_status === 'cash' ? 'نقدي' : 'دين'}</td>
        <td>${sale.customer_name || '-'}</td>
      </tr>`;
    });

    excelContent += `
    </tbody>
  </table>

  <div class="section-title">💰 تفاصيل الديون</div>
  <table>
    <thead>
      <tr>
        <th>الزبون</th>
        <th>المنتج</th>
        <th>المبلغ الكلي</th>
        <th>المدفوع</th>
        <th>المتبقي</th>
        <th>الحالة</th>
        <th>التاريخ</th>
      </tr>
    </thead>
    <tbody>
`;

    debts.forEach(debt => {
      const statusText = debt.status === 'paid' ? 'مدفوع' : debt.status === 'partial' ? 'جزئي' : 'معلق';
      excelContent += `
      <tr>
        <td>${debt.customer_name}</td>
        <td>${debt.product_name}</td>
        <td>${debt.amount.toLocaleString()}</td>
        <td>${debt.paid_amount.toLocaleString()}</td>
        <td>${debt.remaining_amount.toLocaleString()}</td>
        <td>${statusText}</td>
        <td>${new Date(debt.sale_date).toLocaleDateString('ar-YE')}</td>
      </tr>`;
    });

    excelContent += `
    </tbody>
  </table>

  <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px;">
    <h3>📌 ملاحظات:</h3>
    <ul>
      <li>تم إنشاء هذا التقرير بواسطة نظام ملك الماوية</li>
      <li>جميع الأرقام بالريال اليمني</li>
      <li>التاريخ: ${new Date().toLocaleString('ar-YE')}</li>
    </ul>
  </div>
</body>
</html>
`;

    // Create and download
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_ملك_الماوية_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToWord = () => {
    // Calculate summary
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalDebts = debts.reduce((sum, debt) => sum + debt.remaining_amount, 0);
    const cashSales = sales.filter(s => s.payment_status === 'cash').reduce((sum, sale) => sum + sale.total, 0);

    // Create Word document content with professional formatting
    let wordContent = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Arial', 'Simplified Arabic', sans-serif;
      direction: rtl;
      line-height: 1.6;
      color: #333;
    }
    .header {
      text-align: center;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header h1 {
      font-size: 36px;
      margin: 0;
      font-weight: bold;
    }
    .header h2 {
      font-size: 24px;
      margin: 10px 0;
      font-weight: normal;
    }
    .header p {
      font-size: 16px;
      margin: 5px 0;
    }
    .summary-box {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-item {
      background: #f0fdf4;
      border: 2px solid #059669;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    }
    .summary-item h3 {
      font-size: 14px;
      color: #065f46;
      margin: 0 0 10px 0;
    }
    .summary-item p {
      font-size: 28px;
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
      font-size: 14px;
    }
    td {
      padding: 12px;
      border: 1px solid #d1d5db;
      text-align: center;
      font-size: 13px;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    tr:hover {
      background-color: #f0fdf4;
    }
    .footer {
      margin-top: 40px;
      padding: 20px;
      background: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 10px;
    }
    .footer h3 {
      color: #92400e;
      margin-top: 0;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏆 نظام ملك الماوية</h1>
    <h2>تقرير المبيعات والديون الشامل</h2>
    <p>📅 التاريخ: ${new Date().toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p>⏰ الوقت: ${new Date().toLocaleTimeString('ar-YE')}</p>
  </div>

  <div class="summary-box">
    <div class="summary-item">
      <h3>💵 إجمالي المبيعات</h3>
      <p>${totalSales.toLocaleString()}</p>
    </div>
    <div class="summary-item">
      <h3>💰 المبيعات النقدية</h3>
      <p>${cashSales.toLocaleString()}</p>
    </div>
    <div class="summary-item">
      <h3>📊 إجمالي الديون</h3>
      <p>${totalDebts.toLocaleString()}</p>
    </div>
    <div class="summary-item">
      <h3>✨ الصافي</h3>
      <p>${(totalSales - totalDebts).toLocaleString()}</p>
    </div>
  </div>

  <div class="section-title">💵 تفاصيل المبيعات (${sales.length} عملية بيع)</div>
  <table>
    <thead>
      <tr>
        <th>م</th>
        <th>التاريخ</th>
        <th>المنتج</th>
        <th>الكمية</th>
        <th>السعر</th>
        <th>الإجمالي</th>
        <th>البائع</th>
        <th>الحالة</th>
        <th>الزبون</th>
      </tr>
    </thead>
    <tbody>
`;

    sales.forEach((sale, index) => {
      wordContent += `
      <tr>
        <td>${index + 1}</td>
        <td>${new Date(sale.sale_date).toLocaleDateString('ar-YE')}</td>
        <td><strong>${sale.product_name}</strong></td>
        <td>${sale.quantity}</td>
        <td>${sale.price.toLocaleString()} ريال</td>
        <td><strong>${sale.total.toLocaleString()} ريال</strong></td>
        <td>${sale.seller_name}</td>
        <td>${sale.payment_status === 'cash' ? '✅ نقدي' : '⏳ دين'}</td>
        <td>${sale.customer_name || '-'}</td>
      </tr>`;
    });

    wordContent += `
    </tbody>
  </table>

  <div class="page-break"></div>

  <div class="section-title">💰 تفاصيل الديون (${debts.length} دين)</div>
  <table>
    <thead>
      <tr>
        <th>م</th>
        <th>الزبون</th>
        <th>المنتج</th>
        <th>المبلغ الكلي</th>
        <th>المدفوع</th>
        <th>المتبقي</th>
        <th>الحالة</th>
        <th>التاريخ</th>
      </tr>
    </thead>
    <tbody>
`;

    debts.forEach((debt, index) => {
      const statusIcon = debt.status === 'paid' ? '✅' : debt.status === 'partial' ? '⏳' : '❌';
      const statusText = debt.status === 'paid' ? 'مدفوع' : debt.status === 'partial' ? 'جزئي' : 'معلق';
      wordContent += `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${debt.customer_name}</strong></td>
        <td>${debt.product_name}</td>
        <td>${debt.amount.toLocaleString()} ريال</td>
        <td>${debt.paid_amount.toLocaleString()} ريال</td>
        <td><strong>${debt.remaining_amount.toLocaleString()} ريال</strong></td>
        <td>${statusIcon} ${statusText}</td>
        <td>${new Date(debt.sale_date).toLocaleDateString('ar-YE')}</td>
      </tr>`;
    });

    wordContent += `
    </tbody>
  </table>

  <div class="footer">
    <h3>📌 ملاحظات وتعليمات:</h3>
    <ul style="line-height: 2;">
      <li>✅ تم إنشاء هذا التقرير بواسطة نظام ملك الماوية الإلكتروني</li>
      <li>💵 جميع الأرقام المذكورة بالريال اليمني</li>
      <li>📊 يشمل التقرير جميع المعاملات حتى تاريخ ${new Date().toLocaleDateString('ar-YE')}</li>
      <li>🔒 هذا المستند سري ومخصص للاستخدام الداخلي فقط</li>
      <li>✍️ التوقيع: ___________________ &nbsp;&nbsp;&nbsp; التاريخ: ___________________</li>
    </ul>
  </div>

  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #d1d5db; color: #6b7280;">
    <p><strong>نظام ملك الماوية</strong> - نظام إدارة وتجارة القات المتكامل</p>
    <p>Powered by AI Technology ⚡</p>
  </div>
</body>
</html>
`;

    // Create and download
    const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_ملك_الماوية_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Use browser's print to PDF functionality with styled content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalDebts = debts.reduce((sum, debt) => sum + debt.remaining_amount, 0);
    const cashSales = sales.filter(s => s.payment_status === 'cash').reduce((sum, sale) => sum + sale.total, 0);

    const pdfContent = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير ملك الماوية</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: 'Arial', 'Simplified Arabic', sans-serif;
      direction: rtl;
      margin: 0;
      padding: 20px;
    }
    .header {
      text-align: center;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 25px;
    }
    .header h1 { font-size: 32px; margin: 0; }
    .header h2 { font-size: 20px; margin: 8px 0; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 25px;
    }
    .summary-card {
      background: #f0fdf4;
      border: 2px solid #059669;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .summary-card h3 { font-size: 12px; color: #065f46; margin: 0 0 8px 0; }
    .summary-card p { font-size: 24px; font-weight: bold; color: #059669; margin: 0; }
    .section-title {
      background: #3b82f6;
      color: white;
      padding: 12px 15px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      margin: 25px 0 12px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 11px;
    }
    th {
      background: #059669;
      color: white;
      padding: 10px 6px;
      border: 1px solid #047857;
      font-weight: bold;
    }
    td {
      padding: 8px 6px;
      border: 1px solid #d1d5db;
      text-align: center;
    }
    tr:nth-child(even) { background-color: #f9fafb; }
    .footer {
      margin-top: 25px;
      padding: 15px;
      background: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 8px;
      font-size: 11px;
    }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏆 نظام ملك الماوية</h1>
    <h2>تقرير المبيعات والديون</h2>
    <p>📅 ${new Date().toLocaleDateString('ar-YE')} - ⏰ ${new Date().toLocaleTimeString('ar-YE')}</p>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <h3>💵 إجمالي المبيعات</h3>
      <p>${totalSales.toLocaleString()}</p>
    </div>
    <div class="summary-card">
      <h3>💰 المبيعات النقدية</h3>
      <p>${cashSales.toLocaleString()}</p>
    </div>
    <div class="summary-card">
      <h3>📊 إجمالي الديون</h3>
      <p>${totalDebts.toLocaleString()}</p>
    </div>
    <div class="summary-card">
      <h3>✨ الصافي</h3>
      <p>${(totalSales - totalDebts).toLocaleString()}</p>
    </div>
  </div>

  <div class="section-title">💵 تفاصيل المبيعات</div>
  <table>
    <thead>
      <tr>
        <th>م</th>
        <th>التاريخ</th>
        <th>المنتج</th>
        <th>الكمية</th>
        <th>السعر</th>
        <th>الإجمالي</th>
        <th>البائع</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${sales.map((sale, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${new Date(sale.sale_date).toLocaleDateString('ar-YE')}</td>
          <td>${sale.product_name}</td>
          <td>${sale.quantity}</td>
          <td>${sale.price.toLocaleString()}</td>
          <td>${sale.total.toLocaleString()}</td>
          <td>${sale.seller_name}</td>
          <td>${sale.payment_status === 'cash' ? 'نقدي' : 'دين'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <div class="section-title">💰 تفاصيل الديون</div>
  <table>
    <thead>
      <tr>
        <th>م</th>
        <th>الزبون</th>
        <th>المنتج</th>
        <th>المبلغ الكلي</th>
        <th>المدفوع</th>
        <th>المتبقي</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${debts.map((debt, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${debt.customer_name}</td>
          <td>${debt.product_name}</td>
          <td>${debt.amount.toLocaleString()}</td>
          <td>${debt.paid_amount.toLocaleString()}</td>
          <td>${debt.remaining_amount.toLocaleString()}</td>
          <td>${debt.status === 'paid' ? 'مدفوع' : debt.status === 'partial' ? 'جزئي' : 'معلق'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p><strong>📌 ملاحظات:</strong> تم إنشاء هذا التقرير بواسطة نظام ملك الماوية - جميع الأرقام بالريال اليمني</p>
  </div>
</body>
</html>
`;

    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            تصدير Excel
          </CardTitle>
          <CardDescription>
            ملف Excel منسق باحتراف مع جداول وألوان
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportToExcel} className="w-full bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            تحميل Excel (.xls)
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            تصدير Word
          </CardTitle>
          <CardDescription>
            مستند Word احترافي قابل للتعديل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportToWord} className="w-full bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            تحميل Word (.doc)
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            تصدير PDF
          </CardTitle>
          <CardDescription>
            ملف PDF جاهز للطباعة والأرشفة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportToPDF} className="w-full bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            تحميل PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
