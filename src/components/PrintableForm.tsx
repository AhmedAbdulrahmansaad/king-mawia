import { useState, useRef } from 'react';
import { Printer, Download, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AnimatedLogo } from './AnimatedLogo';

interface Product {
  id: string;
  name: string;
  category: string;
}

interface PrintableFormProps {
  products: Product[];
}

export function PrintableForm({ products }: PrintableFormProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePrint = () => {
    // Use setTimeout to ensure React has finished rendering before printing
    setTimeout(() => {
      try {
        window.print();
      } catch (error) {
        console.error('Print error:', error);
      }
    }, 100);
  };

  const handleExportPDF = () => {
    // Use browser's print to PDF functionality
    window.print();
  };

  const handleExportWord = () => {
    const content = printRef.current;
    if (!content) return;

    // Create HTML content for Word document
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 2px solid #000; padding: 10px; text-align: center; }
          .header { text-align: center; margin-bottom: 20px; }
          .green-header { background-color: #16a34a; color: white; }
          .red-header { background-color: #dc2626; color: white; }
          .page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل-المبيعات-${selectedDate}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold">نماذج التسجيل اليومي</h2>
          <p className="text-muted-foreground">
            اطبع هذا النموذج وسلمه للبائعين لتسجيل المبيعات اليومية
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          <Button onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير كـ PDF
          </Button>
          <Button onClick={handleExportWord} className="gap-2">
            <FileText className="h-4 w-4" />
            تصدير كـ Word
          </Button>
        </div>
      </div>

      <div ref={printRef} className="print-content">
        {/* ==================== SALES PAGE (النقد) ==================== */}
        <div className="page-break-after">
          {/* Header */}
          <div className="text-center mb-3 border-b-2 border-primary pb-2">
            <div className="flex justify-center mb-1">
              <div style={{ transform: 'scale(0.6)' }}>
                <AnimatedLogo size="large" variant="float" />
              </div>
            </div>
            <h2 className="text-lg font-bold">سجل المبيعات النقدية اليومي</h2>
            <div className="flex justify-between items-center mt-2 text-sm">
              <div className="font-bold">التاريخ: {new Date(selectedDate).toLocaleDateString('ar-YE')}</div>
              <div>اسم البائع: ___________________</div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="mb-3">
            <h3 className="text-base font-bold mb-2 bg-green-100 p-1 rounded">💵 سجل المبيعات النقدية</h3>
            <table className="w-full border-collapse border-2 border-gray-300">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="border-2 border-gray-300 p-2 text-center" style={{ width: '35px' }}>م</th>
                  {products.map((product) => (
                    <th key={product.id} className="border-2 border-gray-300 p-2 text-center product-column">
                      {product.name}
                    </th>
                  ))}
                  <th className="border-2 border-gray-300 p-2 text-center" style={{ width: '80px' }}>الإجمالي</th>
                </tr>
                <tr className="bg-green-500 text-white text-xs">
                  <th className="border-2 border-gray-300 p-1 text-center">رقم</th>
                  {products.map((product) => (
                    <th key={`header-${product.id}`} className="border-2 border-gray-300 p-1 text-center">
                      الكمية × السعر
                    </th>
                  ))}
                  <th className="border-2 border-gray-300 p-1 text-center">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {/* Rows for entries */}
                {[...Array(12)].map((_, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}>
                    <td className="border-2 border-gray-300 p-1 text-center font-bold text-xs">{index + 1}</td>
                    {products.map((product) => (
                      <td key={`${product.id}-${index}`} className="border-2 border-gray-300 p-1">
                        <div className="h-8"></div>
                      </td>
                    ))}
                    <td className="border-2 border-gray-300 p-1">
                      <div className="h-8"></div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-green-700 text-white font-bold">
                  <td className="border-2 border-gray-300 p-1 text-center text-xs">
                    المجموع
                  </td>
                  {products.map((product) => (
                    <td key={`total-${product.id}`} className="border-2 border-gray-300 p-1">
                      <div className="h-6"></div>
                    </td>
                  ))}
                  <td className="border-2 border-gray-300 p-1">
                    <div className="h-6"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Section - أصغر */}
          <div className="border border-blue-600 rounded p-1 bg-blue-50">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="border border-blue-400 rounded p-1 bg-white">
                <span className="text-gray-600">إجمالي المبيعات: _______</span>
              </div>
              <div className="border border-blue-400 rounded p-1 bg-white">
                <span className="text-gray-600">عدد العمليات: _______</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 pt-1 border-t border-gray-300">
            <div className="flex justify-between items-end text-xs">
              <div>توقيع البائع: _____________</div>
              <div>اعتماد المدير: _____________</div>
            </div>
          </div>
        </div>

        {/* ==================== DEBTS PAGE (الديون) ==================== */}
        <div className="page-break-before">
          {/* Header */}
          <div className="text-center mb-3 border-b-2 border-red-600 pb-2">
            <div className="flex justify-center mb-1">
              <div style={{ transform: 'scale(0.6)' }}>
                <AnimatedLogo size="large" variant="float" />
              </div>
            </div>
            <h2 className="text-lg font-bold">سجل الديون اليومي</h2>
            <div className="flex justify-between items-center mt-2 text-sm">
              <div className="font-bold">التاريخ: {new Date(selectedDate).toLocaleDateString('ar-YE')}</div>
              <div>اسم البائع: ___________________</div>
            </div>
          </div>

          {/* Debts Table */}
          <div className="mb-3">
            <h3 className="text-base font-bold mb-2 bg-red-100 p-1 rounded">💰 سجل الديون</h3>
            <table className="w-full border-collapse border-2 border-gray-300">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="border-2 border-gray-300 p-2 text-center" style={{ width: '35px' }}>م</th>
                  <th className="border-2 border-gray-300 p-2 text-center customer-column">اسم الزبون</th>
                  {products.map((product) => (
                    <th key={product.id} className="border-2 border-gray-300 p-2 text-center product-column">
                      {product.name}
                    </th>
                  ))}
                  <th className="border-2 border-gray-300 p-2 text-center" style={{ width: '80px' }}>الإجمالي</th>
                </tr>
                <tr className="bg-red-500 text-white text-xs">
                  <th className="border-2 border-gray-300 p-1 text-center">رقم</th>
                  <th className="border-2 border-gray-300 p-1 text-center">الاسم</th>
                  {products.map((product) => (
                    <th key={`debt-header-${product.id}`} className="border-2 border-gray-300 p-1 text-center">
                      الكمية × السعر
                    </th>
                  ))}
                  <th className="border-2 border-gray-300 p-1 text-center">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {/* Rows for debt entries */}
                {[...Array(12)].map((_, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-red-50' : 'bg-white'}>
                    <td className="border-2 border-gray-300 p-1 text-center font-bold text-xs">{index + 1}</td>
                    <td className="border-2 border-gray-300 p-1">
                      <div className="h-8"></div>
                    </td>
                    {products.map((product) => (
                      <td key={`debt-${product.id}-${index}`} className="border-2 border-gray-300 p-1">
                        <div className="h-8"></div>
                      </td>
                    ))}
                    <td className="border-2 border-gray-300 p-1">
                      <div className="h-8"></div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-red-700 text-white font-bold">
                  <td colSpan={2} className="border-2 border-gray-300 p-1 text-center text-xs">
                    إجمالي الديون
                  </td>
                  {products.map((product) => (
                    <td key={`debt-total-${product.id}`} className="border-2 border-gray-300 p-1">
                      <div className="h-6"></div>
                    </td>
                  ))}
                  <td className="border-2 border-gray-300 p-1">
                    <div className="h-6"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Section - أصغر */}
          <div className="border border-orange-600 rounded p-1 bg-orange-50">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="border border-orange-400 rounded p-1 bg-white">
                <span className="text-gray-600">إجمالي الديون: _______</span>
              </div>
              <div className="border border-orange-400 rounded p-1 bg-white">
                <span className="text-gray-600">عدد الزبائن: _______</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 pt-1 border-t border-gray-300">
            <div className="flex justify-between items-end text-xs">
              <div>توقيع البائع: _____________</div>
              <div>اعتماد المدير: _____________</div>
            </div>
          </div>
        </div>

        {/* Instructions - إخفاءها في الطباعة */}
        <div className="no-print mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <h4 className="font-bold mb-2">📌 تعليمات مهمة:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>الصفحة الأولى: سجل جميع المبيعات النقدية مع ذكر الكمية والسعر لكل نوع</li>
            <li>الصفحة الثانية: سجل جميع الديون مع اسم الزبون والكمية والسعر لكل نوع</li>
            <li>احسب الإجمالي بدقة وتأكد من صحة الأرقام</li>
            <li>احتفظ بالسجل في مكان آمن وسلمه للمدير في نهاية اليوم</li>
            <li>يمكن تصوير هذه السجلات ورفعها للمساعد الذكي لإدخال البيانات تلقائياً</li>
          </ul>
        </div>
      </div>

      <style>{`
        @media print {
          /* Hide all non-print elements */
          .no-print, header, nav, aside, footer, [role="navigation"], [role="banner"] {
            display: none !important;
          }
          
          /* Main content styling - استخدم كامل الصفحة */
          .print-content {
            padding: 5mm !important;
            direction: rtl !important;
            text-align: right !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          
          /* Force RTL for all elements */
          * {
            direction: rtl !important;
            text-align: right !important;
          }
          
          body {
            direction: rtl !important;
            font-family: 'Arial', sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          
          /* Table styling - أوسع الأعمدة */
          table {
            page-break-inside: avoid !important;
            width: 100% !important;
            table-layout: fixed !important;
            direction: rtl !important;
            border-collapse: collapse !important;
          }
          
          /* أعمدة المنتجات أعرض */
          table th, table td {
            padding: 6px 3px !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
          }
          
          /* رقم الصف */
          table th:first-child,
          table td:first-child {
            width: 30px !important;
            max-width: 30px !important;
          }
          
          /* عمود الإجمالي */
          table th:last-child,
          table td:last-child {
            width: 70px !important;
            max-width: 70px !important;
          }
          
          /* أعمدة المنتجات - توزيع متساوي */
          .product-column {
            width: auto !important;
            min-width: 0 !important;
          }
          
          /* عمود اسم الزبون في جدول الديون */
          .customer-column {
            width: 90px !important;
            max-width: 90px !important;
          }
          
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          
          tbody {
            page-break-inside: avoid !important;
          }
          
          /* محاذاة النصوص */
          th, td, div, p, h1, h2, h3, h4, span {
            direction: rtl !important;
          }
          
          /* محاذاة الجداول */
          th, td {
            text-align: center !important;
          }
          
          /* Page breaks */
          .page-break-after {
            page-break-after: always !important;
          }
          
          .page-break-before {
            page-break-before: always !important;
          }
          
          /* Page settings - عرضي مع هوامش أقل */
          @page {
            size: A4 landscape;
            margin: 5mm 8mm;
          }
          
          /* Hide layout elements */
          [class*="sidebar"], [class*="menu"], [class*="nav"] {
            display: none !important;
          }
          
          /* تقليل حجم العناصر */
          h2 {
            font-size: 16px !important;
            margin: 0 0 6px 0 !important;
          }
          
          h3 {
            font-size: 13px !important;
            margin: 0 0 4px 0 !important;
            padding: 4px !important;
          }
          
          .border-b-2 {
            margin-bottom: 6px !important;
            padding-bottom: 6px !important;
          }
          
          /* تقليل المسافات */
          .mb-3 {
            margin-bottom: 8px !important;
          }
          
          .mt-2 {
            margin-top: 6px !important;
          }
          
          .pt-1 {
            padding-top: 4px !important;
          }
        }
        
        /* Screen styling */
        @media screen {
          .print-content {
            direction: rtl;
            text-align: right;
          }
          
          table {
            direction: rtl;
          }
          
          th, td {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}