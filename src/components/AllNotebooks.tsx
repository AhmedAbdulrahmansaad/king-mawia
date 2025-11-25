import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { BookOpen, Printer, DollarSign, CreditCard, FileText, Download, Table2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const QHAT_TYPES = ['طوفان', 'طلب خاص', 'حسين', 'طلب عمنا', 'القحطاني', 'عبيده', 'رقم واحد'];

export function AllNotebooks() {
  const [pages, setPages] = useState(10);
  const [includeHeader, setIncludeHeader] = useState(true);

  // 1. دفتر النقد (Cash - أخضر)
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

  // 2. دفتر الديون (Debt - أحمر)
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

  // 3. دفتر تقليدي (Traditional - أزرق)
  const generateTraditionalNotebook = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const pagesArray = Array.from({ length: pages }, (_, i) => i + 1);

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>دفتر تقليدي - ملك الماوية</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            margin: 0;
            padding: 0;
            direction: rtl;
          }

          .page {
            page-break-after: always;
            padding: 20px;
          }

          .page:last-child {
            page-break-after: auto;
          }

          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }

          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
          }

          .subtitle {
            font-size: 14px;
            color: #1e40af;
          }

          .date-box {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            background: #eff6ff;
            border-right: 4px solid #2563eb;
          }

          .date-item {
            display: flex;
            gap: 8px;
          }

          .date-label {
            font-weight: bold;
            color: #2563eb;
          }

          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          .table th {
            background: #2563eb;
            color: white;
            padding: 12px;
            border: 1px solid #1e40af;
            text-align: center;
          }

          .table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
            height: 40px;
          }

          .table tbody tr:nth-child(even) {
            background: #f9fafb;
          }

          .notes-section {
            margin-top: 20px;
            padding: 15px;
            border: 2px dashed #2563eb;
            border-radius: 4px;
            min-height: 60px;
          }

          .notes-title {
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }

          .page-number {
            text-align: center;
            margin-top: 20px;
            color: #999;
            font-size: 11px;
          }

          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        ${pagesArray.map(pageNum => `
          <div class="page">
            ${includeHeader ? `
              <div class="header">
                <div class="logo">🏆 ملك الماوية</div>
                <div class="subtitle">📔 دفتر التسجيل التقليدي</div>
              </div>
            ` : ''}
            
            <div class="date-box">
              <div class="date-item">
                <span class="date-label">التاريخ:</span>
                <span>_______________</span>
              </div>
              <div class="date-item">
                <span class="date-label">اليوم:</span>
                <span>_______________</span>
              </div>
              <div class="date-item">
                <span class="date-label">البائع:</span>
                <span>_______________</span>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>المنتج</th>
                  <th style="width: 80px;">الكمية</th>
                  <th style="width: 90px;">السعر (ريال)</th>
                  <th style="width: 90px;">الإجمالي (ريال)</th>
                  <th>الزبون</th>
                  <th style="width: 70px;">الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${Array.from({ length: 20 }, (_, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="notes-section">
              <div class="notes-title">📝 ملاحظات اليوم:</div>
              <div style="min-height: 40px;"></div>
            </div>

            <div class="page-number">
              صفحة ${pageNum} من ${pages} - 📔 دفتر تقليدي - نظام ملك الماوية © 2024
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

  // 4. دفتر مفصل (Detailed - بنفسجي)
  const generateDetailedNotebook = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const pagesArray = Array.from({ length: pages }, (_, i) => i + 1);

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>دفتر مفصل - ملك الماوية</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            margin: 0;
            padding: 0;
            direction: rtl;
          }

          .page {
            page-break-after: always;
            padding: 20px;
          }

          .page:last-child {
            page-break-after: auto;
          }

          .header {
            text-align: center;
            border-bottom: 3px solid #7c3aed;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }

          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 8px;
          }

          .subtitle {
            font-size: 14px;
            color: #6d28d9;
          }

          .date-box {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            background: #f5f3ff;
            border-right: 4px solid #7c3aed;
          }

          .date-item {
            display: flex;
            gap: 8px;
          }

          .date-label {
            font-weight: bold;
            color: #7c3aed;
          }

          .entry {
            border: 2px solid #7c3aed;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background: white;
          }

          .entry-number {
            background: #7c3aed;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .field-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }

          .field {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            border-bottom: 1px dashed #d1d5db;
          }

          .field-label {
            font-weight: bold;
            color: #7c3aed;
            font-size: 13px;
          }

          .field-value {
            flex: 1;
            margin-right: 10px;
            border-bottom: 1px solid #e5e7eb;
          }

          .page-number {
            text-align: center;
            margin-top: 20px;
            color: #999;
            font-size: 11px;
          }

          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        ${pagesArray.map(pageNum => `
          <div class="page">
            ${includeHeader ? `
              <div class="header">
                <div class="logo">🏆 ملك الماوية</div>
                <div class="subtitle">📋 دفتر التسجيل المفصل</div>
              </div>
            ` : ''}
            
            <div class="date-box">
              <div class="date-item">
                <span class="date-label">التاريخ:</span>
                <span>_______________</span>
              </div>
              <div class="date-item">
                <span class="date-label">اليوم:</span>
                <span>_______________</span>
              </div>
              <div class="date-item">
                <span class="date-label">البائع:</span>
                <span>_______________</span>
              </div>
            </div>

            ${Array.from({ length: 5 }, (_, i) => `
              <div class="entry">
                <span class="entry-number">عملية #${i + 1}</span>
                
                <div class="field-row">
                  <div class="field">
                    <span class="field-label">نوع القات:</span>
                    <div class="field-value"></div>
                  </div>
                  <div class="field">
                    <span class="field-label">الكمية:</span>
                    <div class="field-value"></div>
                  </div>
                </div>

                <div class="field-row">
                  <div class="field">
                    <span class="field-label">السعر:</span>
                    <div class="field-value"></div>
                  </div>
                  <div class="field">
                    <span class="field-label">الإجمالي:</span>
                    <div class="field-value"></div>
                  </div>
                </div>

                <div class="field-row">
                  <div class="field">
                    <span class="field-label">اسم الزبون:</span>
                    <div class="field-value"></div>
                  </div>
                  <div class="field">
                    <span class="field-label">الحالة:</span>
                    <div class="field-value"></div>
                  </div>
                </div>

                <div class="field">
                  <span class="field-label">ملاحظات:</span>
                  <div class="field-value"></div>
                </div>
              </div>
            `).join('')}

            <div class="page-number">
              صفحة ${pageNum} من ${pages} - 📋 دفتر مفصل - نظام ملك الماوية © 2024
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-green-600" />
          دفاتر تسجيل المبيعات (4 أنواع)
        </h1>
        <p className="text-gray-600 mt-1">
          اختر النوع المناسب، اطبع، املأ يدوياً، ثم صوّره للمساعد الذكي! 📸
        </p>
      </motion.div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ إعدادات عامة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Notebooks Tabs */}
      <Tabs defaultValue="cash" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="cash" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            💵 النقد
          </TabsTrigger>
          <TabsTrigger value="debt" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            💳 الديون
          </TabsTrigger>
          <TabsTrigger value="traditional" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            📔 تقليدي
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            📋 مفصل
          </TabsTrigger>
        </TabsList>

        {/* 1. Cash Notebook */}
        <TabsContent value="cash">
          <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">💵 دفتر النقد (المبيعات المدفوعة)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                <h3 className="font-bold text-green-800 mb-2">المميزات:</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>✅ تصميم أفقي للأنواع السبعة</li>
                  <li>✅ 18 سطر لكل صفحة</li>
                  <li>✅ حساب تلقائي للمجاميع</li>
                  <li>✅ مساحة للملاحظات</li>
                  <li>✅ لون أخضر للتمييز</li>
                </ul>
              </div>

              <Button
                onClick={generateCashNotebook}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Printer className="ml-2 h-5 w-5" />
                طباعة دفتر النقد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Debt Notebook */}
        <TabsContent value="debt">
          <Card className="border-2 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">💳 دفتر الديون (المبيعات المعلقة)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-red-200">
                <h3 className="font-bold text-red-800 mb-2">المميزات:</h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>✅ عمود خاص لاسم المدين</li>
                  <li>✅ تاريخ الاستحقاق</li>
                  <li>✅ تصميم أفقي للأنواع السبعة</li>
                  <li>✅ 18 سطر لكل صفحة</li>
                  <li>✅ لون أحمر للتحذير</li>
                </ul>
              </div>

              <Button
                onClick={generateDebtNotebook}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Printer className="ml-2 h-5 w-5" />
                طباعة دفتر الديون
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Traditional Notebook */}
        <TabsContent value="traditional">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">📔 دفتر تقليدي (جدول عمودي)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">المميزات:</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>✅ تصميم تقليدي بسيط</li>
                  <li>✅ جدول عمودي سهل القراءة</li>
                  <li>✅ 20 سطر لكل صفحة</li>
                  <li>✅ مساحة واسعة للملاحظات</li>
                  <li>✅ مناسب لكل الأغراض</li>
                </ul>
              </div>

              <Button
                onClick={generateTraditionalNotebook}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Printer className="ml-2 h-5 w-5" />
                طباعة دفتر تقليدي
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Detailed Notebook */}
        <TabsContent value="detailed">
          <Card className="border-2 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700">📋 دفتر مفصل (نموذج كامل)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                <h3 className="font-bold text-purple-800 mb-2">المميزات:</h3>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li>✅ نموذج كامل لكل عملية</li>
                  <li>✅ كل التفاصيل منفصلة</li>
                  <li>✅ 5 عمليات لكل صفحة</li>
                  <li>✅ سهل للبائعين الجدد</li>
                  <li>✅ واضح ومنظم جداً</li>
                </ul>
              </div>

              <Button
                onClick={generateDetailedNotebook}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Printer className="ml-2 h-5 w-5" />
                طباعة دفتر مفصل
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
        <CardHeader>
          <CardTitle>📖 دليل الاستخدام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-800 mb-2">💵 النقد:</h3>
              <p className="text-green-700 text-xs">للمبيعات المدفوعة فوراً، جمع النقد اليومي</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h3 className="font-bold text-red-800 mb-2">💳 الديون:</h3>
              <p className="text-red-700 text-xs">للمبيعات المعلقة، متابعة المدينين</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2">📔 تقليدي:</h3>
              <p className="text-blue-700 text-xs">تصميم بسيط، سهل الاستخدام</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-2">📋 مفصل:</h3>
              <p className="text-purple-700 text-xs">نموذج كامل، للبائعين الجدد</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-2xl">💡</span>
              <div>
                <strong className="text-blue-800">خطوات العمل:</strong>
                <ol className="text-blue-700 mt-2 space-y-1 text-xs list-decimal list-inside">
                  <li>اختر نوع الدفتر المناسب</li>
                  <li>اطبعه (عدد الصفحات حسب احتياجك)</li>
                  <li>املأه يدوياً طوال اليوم</li>
                  <li>صوّر الصفحات بكاميرا جيدة</li>
                  <li>ارفع الصور للمساعد الذكي</li>
                  <li>سيحللها تلقائياً ويسجلها! 🚀</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
