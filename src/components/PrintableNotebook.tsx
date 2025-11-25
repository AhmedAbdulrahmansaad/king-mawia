import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { BookOpen, Printer, DollarSign, CreditCard, FileText } from 'lucide-react';

const QHAT_TYPES = ['طوفان', 'طلب خاص', 'حسين', 'طلب عمنا', 'القحطاني', 'عبيده', 'رقم واحد'];

export function PrintableNotebook() {
  const [pages, setPages] = useState(10);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [notebookType, setNotebookType] = useState<'cash' | 'debt'>('cash');

  const generateCashNotebook = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const pagesArray = Array.from({ length: pages }, (_, i) => i + 1);

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>دفتر النقد - ملك الماوية</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            margin: 0;
            padding: 0;
            direction: rtl;
          }

          .page {
            page-break-after: always;
            width: 100%;
            padding: 15px;
            box-sizing: border-box;
            position: relative;
            background: white;
          }

          .page:last-child {
            page-break-after: auto;
          }

          .header {
            text-align: center;
            padding-bottom: 12px;
            border-bottom: 3px solid #16a34a;
            margin-bottom: 15px;
            background: linear-gradient(to bottom, #f0fdf4, white);
          }

          .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 3px;
          }

          .subtitle {
            font-size: 12px;
            color: #059669;
            font-weight: bold;
          }

          .date-section {
            margin-bottom: 15px;
            padding: 8px;
            background: #f0fdf4;
            border-right: 4px solid #16a34a;
            display: flex;
            gap: 30px;
          }

          .date-label {
            font-weight: bold;
            color: #16a34a;
            font-size: 11px;
          }

          .horizontal-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          .horizontal-table th {
            background: #16a34a;
            color: white;
            padding: 10px 5px;
            font-size: 11px;
            border: 1px solid #10b981;
            text-align: center;
            font-weight: bold;
          }

          .horizontal-table td {
            border: 1px solid #d1d5db;
            padding: 8px 5px;
            min-height: 35px;
            text-align: center;
            font-size: 10px;
          }

          .horizontal-table .row-number {
            background: #f0fdf4;
            font-weight: bold;
            color: #16a34a;
            width: 40px;
          }

          .horizontal-table tbody tr:nth-child(even) {
            background: #f9fafb;
          }

          .product-name {
            writing-mode: horizontal-tb;
            font-weight: bold;
            font-size: 10px;
          }

          .footer-notes {
            margin-top: 15px;
            padding: 10px;
            border: 2px dashed #16a34a;
            border-radius: 4px;
            min-height: 50px;
            background: #f0fdf4;
          }

          .footer-notes-label {
            font-size: 10px;
            color: #16a34a;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .page-number {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #999;
          }

          .summary-row {
            background: #f0fdf4 !important;
            font-weight: bold;
          }

          .summary-row td {
            border-top: 2px solid #16a34a;
            padding: 10px 5px;
          }

          .cash-badge {
            display: inline-block;
            background: #16a34a;
            color: white;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 10px;
            margin-right: 10px;
          }

          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
          }

          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(22, 163, 74, 0.03);
            font-weight: bold;
            z-index: -1;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        ${pagesArray.map(pageNum => `
          <div class="page">
            ${includeHeader ? `
              <div class="header">
                <div class="logo-text">🏆 ملك الماوية</div>
                <div class="subtitle">
                  <span class="cash-badge">💵 دفتر النقد - المبيعات المدفوعة</span>
                </div>
              </div>
            ` : ''}
            
            <div class="watermark">نقد</div>
            
            <div class="date-section">
              <div>
                <span class="date-label">التاريخ:</span>
                <span style="margin-right: 5px;">_______________</span>
              </div>
              <div>
                <span class="date-label">اليوم:</span>
                <span style="margin-right: 5px;">_______________</span>
              </div>
              <div>
                <span class="date-label">البائع:</span>
                <span style="margin-right: 5px;">_______________</span>
              </div>
            </div>

            <table class="horizontal-table">
              <thead>
                <tr>
                  <th rowspan="2" class="row-number">#</th>
                  <th colspan="${QHAT_TYPES.length}" style="background: #059669; font-size: 12px;">
                    أنواع القات (الكمية بالحبة)
                  </th>
                  <th rowspan="2" style="width: 80px;">اسم الزبون</th>
                  <th rowspan="2" style="width: 70px;">الإجمالي<br>(ريال)</th>
                  <th rowspan="2" style="width: 100px;">ملاحظات</th>
                </tr>
                <tr>
                  ${QHAT_TYPES.map(type => `
                    <th class="product-name" style="width: 70px;">${type}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${Array.from({ length: 18 }, (_, i) => `
                  <tr>
                    <td class="row-number">${i + 1}</td>
                    ${QHAT_TYPES.map(() => `
                      <td></td>
                    `).join('')}
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                `).join('')}
                <tr class="summary-row">
                  <td>المجموع</td>
                  ${QHAT_TYPES.map(() => `
                    <td style="min-height: 30px;"></td>
                  `).join('')}
                  <td colspan="3" style="text-align: right; padding-right: 10px; color: #16a34a;">
                    💵 إجمالي النقد: ______________ ريال
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="footer-notes">
              <div class="footer-notes-label">📝 ملاحظات اليوم (النقد المدفوع):</div>
              <div style="height: 35px; margin-top: 5px;"></div>
            </div>

            <div class="page-number">
              صفحة ${pageNum} من ${pages} - 💵 دفتر النقد - نظام ملك الماوية © 2024
            </div>
          </div>
        `).join('')}

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const generateDebtNotebook = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const pagesArray = Array.from({ length: pages }, (_, i) => i + 1);

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>دفتر الديون - ملك الماوية</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            margin: 0;
            padding: 0;
            direction: rtl;
          }

          .page {
            page-break-after: always;
            width: 100%;
            padding: 15px;
            box-sizing: border-box;
            position: relative;
            background: white;
          }

          .page:last-child {
            page-break-after: auto;
          }

          .header {
            text-align: center;
            padding-bottom: 12px;
            border-bottom: 3px solid #dc2626;
            margin-bottom: 15px;
            background: linear-gradient(to bottom, #fef2f2, white);
          }

          .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 3px;
          }

          .subtitle {
            font-size: 12px;
            color: #ef4444;
            font-weight: bold;
          }

          .date-section {
            margin-bottom: 15px;
            padding: 8px;
            background: #fef2f2;
            border-right: 4px solid #dc2626;
            display: flex;
            gap: 30px;
          }

          .date-label {
            font-weight: bold;
            color: #dc2626;
            font-size: 11px;
          }

          .horizontal-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          .horizontal-table th {
            background: #dc2626;
            color: white;
            padding: 10px 5px;
            font-size: 11px;
            border: 1px solid #ef4444;
            text-align: center;
            font-weight: bold;
          }

          .horizontal-table td {
            border: 1px solid #fecaca;
            padding: 8px 5px;
            min-height: 35px;
            text-align: center;
            font-size: 10px;
          }

          .horizontal-table .row-number {
            background: #fef2f2;
            font-weight: bold;
            color: #dc2626;
            width: 40px;
          }

          .horizontal-table tbody tr:nth-child(even) {
            background: #fef9f9;
          }

          .product-name {
            writing-mode: horizontal-tb;
            font-weight: bold;
            font-size: 10px;
          }

          .footer-notes {
            margin-top: 15px;
            padding: 10px;
            border: 2px dashed #dc2626;
            border-radius: 4px;
            min-height: 50px;
            background: #fef2f2;
          }

          .footer-notes-label {
            font-size: 10px;
            color: #dc2626;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .page-number {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #999;
          }

          .summary-row {
            background: #fef2f2 !important;
            font-weight: bold;
          }

          .summary-row td {
            border-top: 2px solid #dc2626;
            padding: 10px 5px;
          }

          .debt-badge {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 10px;
            margin-right: 10px;
          }

          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
          }

          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(220, 38, 38, 0.03);
            font-weight: bold;
            z-index: -1;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        ${pagesArray.map(pageNum => `
          <div class="page">
            ${includeHeader ? `
              <div class="header">
                <div class="logo-text">🏆 ملك الماوية</div>
                <div class="subtitle">
                  <span class="debt-badge">💳 دفتر الديون - المبيعات المعلقة</span>
                </div>
              </div>
            ` : ''}
            
            <div class="watermark">ديون</div>
            
            <div class="date-section">
              <div>
                <span class="date-label">التاريخ:</span>
                <span style="margin-right: 5px;">_______________</span>
              </div>
              <div>
                <span class="date-label">اليوم:</span>
                <span style="margin-right: 5px;">_______________</span>
              </div>
              <div>
                <span class="date-label">البائع:</span>
                <span style="margin-right: 5px;">_______________</span>
              </div>
            </div>

            <table class="horizontal-table">
              <thead>
                <tr>
                  <th rowspan="2" class="row-number">#</th>
                  <th rowspan="2" style="width: 100px;">اسم الزبون<br>(المدين)</th>
                  <th colspan="${QHAT_TYPES.length}" style="background: #b91c1c; font-size: 12px;">
                    أنواع القات (الكمية بالحبة)
                  </th>
                  <th rowspan="2" style="width: 70px;">الإجمالي<br>(ريال)</th>
                  <th rowspan="2" style="width: 70px;">تاريخ<br>الاستحقاق</th>
                  <th rowspan="2" style="width: 100px;">ملاحظات</th>
                </tr>
                <tr>
                  ${QHAT_TYPES.map(type => `
                    <th class="product-name" style="width: 70px;">${type}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${Array.from({ length: 18 }, (_, i) => `
                  <tr>
                    <td class="row-number">${i + 1}</td>
                    <td></td>
                    ${QHAT_TYPES.map(() => `
                      <td></td>
                    `).join('')}
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                `).join('')}
                <tr class="summary-row">
                  <td colspan="2">المجموع</td>
                  ${QHAT_TYPES.map(() => `
                    <td style="min-height: 30px;"></td>
                  `).join('')}
                  <td colspan="3" style="text-align: right; padding-right: 10px; color: #dc2626;">
                    💳 إجمالي الديون: ______________ ريال
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="footer-notes">
              <div class="footer-notes-label">⚠️ ملاحظات الديون المعلقة:</div>
              <div style="height: 35px; margin-top: 5px;"></div>
            </div>

            <div class="page-number">
              صفحة ${pageNum} من ${pages} - 💳 دفتر الديون - نظام ملك الماوية © 2024
            </div>
          </div>
        `).join('')}

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrint = () => {
    if (notebookType === 'cash') {
      generateCashNotebook();
    } else {
      generateDebtNotebook();
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-green-600" />
          دفاتر تسجيل المبيعات
        </h1>
        <p className="text-gray-600 mt-1">
          اطبع دفتر فارغ للكتابة اليدوية، ثم صوّره للمساعد الذكي لتحليله تلقائياً
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ إعدادات الدفتر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                نوع الدفتر
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNotebookType('cash')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    notebookType === 'cash'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-medium text-sm">💵 دفتر النقد</p>
                  <p className="text-xs text-gray-500">المبيعات المدفوعة</p>
                </button>

                <button
                  onClick={() => setNotebookType('debt')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    notebookType === 'debt'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="font-medium text-sm">💳 دفتر الديون</p>
                  <p className="text-xs text-gray-500">المبيعات المعلقة</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                عدد الصفحات
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                كل صفحة تحتوي على 18 سطر مع 7 أنواع قات
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="header"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="header" className="text-sm">
                إضافة رأس الصفحة (شعار ملك الماوية)
              </label>
            </div>

            <div className="pt-4">
              <Button
                onClick={handlePrint}
                className={`w-full ${
                  notebookType === 'cash'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Printer className="ml-2 h-5 w-5" />
                طباعة {notebookType === 'cash' ? 'دفتر النقد' : 'دفتر الديون'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className={`border-2 ${
          notebookType === 'cash'
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
        }`}>
          <CardHeader>
            <CardTitle>
              👁️ معاينة {notebookType === 'cash' ? '💵 دفتر النقد' : '💳 دفتر الديون'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-2 rounded shadow-lg border-2 border-gray-200 overflow-x-auto">
              <div className={`text-center border-b-2 pb-1 mb-2 ${
                notebookType === 'cash' ? 'border-green-600' : 'border-red-600'
              }`}>
                <div className={`font-bold text-sm ${
                  notebookType === 'cash' ? 'text-green-600' : 'text-red-600'
                }`}>
                  🏆 ملك الماوية
                </div>
                <div className="text-[9px] text-gray-600">
                  {notebookType === 'cash' ? '💵 دفتر النقد' : '💳 دفتر الديون'}
                </div>
              </div>

              <table className="w-full border-collapse text-[7px]">
                <thead>
                  <tr>
                    <th rowSpan={2} className={`border border-gray-300 p-1 ${
                      notebookType === 'cash' ? 'bg-green-600' : 'bg-red-600'
                    } text-white`}>#</th>
                    {notebookType === 'debt' && (
                      <th rowSpan={2} className={`border border-gray-300 p-1 ${
                        notebookType === 'cash' ? 'bg-green-600' : 'bg-red-600'
                      } text-white`}>الزبون</th>
                    )}
                    {QHAT_TYPES.slice(0, 4).map(type => (
                      <th key={type} className={`border border-gray-300 p-1 ${
                        notebookType === 'cash' ? 'bg-green-600' : 'bg-red-600'
                      } text-white`}>
                        {type}
                      </th>
                    ))}
                    {notebookType === 'cash' && (
                      <th rowSpan={2} className="border border-gray-300 bg-green-600 text-white p-1">الزبون</th>
                    )}
                    <th rowSpan={2} className={`border border-gray-300 p-1 ${
                      notebookType === 'cash' ? 'bg-green-600' : 'bg-red-600'
                    } text-white`}>إجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }, (_, i) => (
                    <tr key={i}>
                      <td className={`border border-gray-300 text-center font-bold p-1 ${
                        notebookType === 'cash' ? 'bg-green-50' : 'bg-red-50'
                      }`}>{i + 1}</td>
                      {notebookType === 'debt' && (
                        <td className="border border-gray-300 p-2"></td>
                      )}
                      {Array.from({ length: 4 }, (_, j) => (
                        <td key={j} className="border border-gray-300 p-2"></td>
                      ))}
                      {notebookType === 'cash' && (
                        <td className="border border-gray-300 p-2"></td>
                      )}
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-center text-[8px] text-gray-500 mt-1">وهكذا لباقي الأنواع...</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>📖 كيفية الاستخدام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-green-800">💵 دفتر النقد (أخضر):</h3>
              <div className="flex items-start gap-2">
                <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                <div>خاص بالمبيعات المدفوعة فوراً</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                <div>لتسجيل النقد اليومي</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                <div>حساب إجمالي النقد في نهاية اليوم</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-red-800">💳 دفتر الديون (أحمر):</h3>
              <div className="flex items-start gap-2">
                <div className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                <div>خاص بالمبيعات المعلقة (الآجلة)</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                <div>تسجيل اسم الزبون المدين بوضوح</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                <div>متابعة الديون وتواريخ الاستحقاق</div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-2xl">💡</span>
              <div>
                <strong className="text-yellow-800">نصيحة مهمة:</strong>
                <p className="text-yellow-700 mt-1">
                  استخدم دفتر النقد الأخضر للمدفوع فوراً، ودفتر الديون الأحمر للمبيعات المعلقة.
                  هذا يساعدك في تنظيم حساباتك بشكل أفضل! 📊
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
