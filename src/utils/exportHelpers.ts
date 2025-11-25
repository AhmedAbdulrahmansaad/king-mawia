/**
 * مكتبة شاملة لتصدير البيانات بجميع الصيغ
 * تدعم العربية بشكل كامل: PDF, Excel, Word
 */

import * as XLSX from 'xlsx';
import { exportToPDFDirect } from './pdfExport';

// ============= PDF Export with Full Arabic Support =============

export async function exportToPDF(
  title: string,
  headers: string[],
  rows: any[][],
  filename: string,
  summary?: { label: string; value: string }[]
) {
  try {
    // Use direct PDF export method (stable and reliable)
    await exportToPDFDirect(title, headers, rows, filename, summary);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('فشل تصدير PDF: ' + (error as Error).message);
  }
}

// ============= Excel Export =============

export function exportToExcel(
  title: string,
  headers: string[],
  rows: any[][],
  filename: string,
  summary?: { label: string; value: string }[]
) {
  try {
    const data: any[][] = [];

    // Add title
    data.push([title]);
    data.push([]);

    // Add date
    const dateStr = new Date().toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    data.push(['التاريخ:', dateStr]);
    data.push([]);

    // Add summary if provided
    if (summary && summary.length > 0) {
      data.push(['الملخص']);
      summary.forEach(item => {
        data.push([item.label, item.value]);
      });
      data.push([]);
    }

    // Add headers
    data.push(headers);

    // Add rows
    rows.forEach(row => {
      data.push(row);
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    const maxWidths = headers.map(() => 15);
    ws['!cols'] = maxWidths.map(w => ({ wch: w }));

    // Set RTL
    if (!ws['!views']) ws['!views'] = [{}];
    ws['!views'][0] = { rtl: true };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات');

    // Generate Excel file
    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    throw new Error('فشل تصدير Excel: ' + (error as Error).message);
  }
}

// ============= Word Export =============

export function exportToWord(
  title: string,
  headers: string[],
  rows: any[][],
  filename: string,
  summary?: { label: string; value: string }[]
) {
  try {
    let html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            text-align: right;
            padding: 20px;
          }
          h1 {
            color: #16a34a;
            text-align: center;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .title {
            text-align: center;
            font-size: 20px;
            margin-bottom: 20px;
            font-weight: bold;
          }
          .date {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .summary {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .summary h3 {
            color: #16a34a;
            margin-top: 0;
            margin-bottom: 10px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .summary-item:last-child {
            border-bottom: none;
          }
          .summary-label {
            color: #666;
          }
          .summary-value {
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            direction: rtl;
          }
          th {
            background-color: #16a34a;
            color: white;
            padding: 12px;
            text-align: center;
            border: 1px solid #ddd;
            font-weight: bold;
          }
          td {
            padding: 10px;
            text-align: center;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>ملك الماوية</h1>
        <div class="title">${title}</div>
        <div class="date">التاريخ: ${new Date().toLocaleDateString('ar-YE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}</div>
    `;

    // Add summary
    if (summary && summary.length > 0) {
      html += `
        <div class="summary">
          <h3>الملخص</h3>
      `;
      summary.forEach(item => {
        html += `
          <div class="summary-item">
            <span class="summary-label">${item.label}:</span>
            <span class="summary-value">${item.value}</span>
          </div>
        `;
      });
      html += `</div>`;
    }

    // Add table
    html += `
      <table>
        <thead>
          <tr>
    `;

    headers.forEach(header => {
      html += `<th>${header}</th>`;
    });

    html += `
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${cell || ''}</td>`;
      });
      html += '</tr>';
    });

    html += `
        </tbody>
      </table>
      <div class="footer">نظام ملك الماوية لإدارة المبيعات</div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    return true;
  } catch (error) {
    console.error('Word Export Error:', error);
    throw new Error('فشل تصدير Word: ' + (error as Error).message);
  }
}

// ============= Print Function =============

export function printData(
  title: string,
  headers: string[],
  rows: any[][],
  summary?: { label: string; value: string }[]
) {
  try {
    let printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            text-align: right;
            padding: 20px;
            margin: 0;
          }
          h1 {
            color: #16a34a;
            text-align: center;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .title {
            text-align: center;
            font-size: 22px;
            margin-bottom: 15px;
            font-weight: bold;
          }
          .date {
            text-align: center;
            color: #666;
            margin-bottom: 25px;
            font-size: 14px;
          }
          .summary {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
          }
          .summary h3 {
            color: #16a34a;
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 18px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .summary-item:last-child {
            border-bottom: none;
          }
          .summary-label {
            color: #666;
            font-size: 14px;
          }
          .summary-value {
            font-weight: bold;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            direction: rtl;
          }
          th {
            background-color: #16a34a !important;
            color: white !important;
            padding: 12px;
            text-align: center;
            border: 1px solid #ddd;
            font-weight: bold;
            font-size: 14px;
          }
          td {
            padding: 10px;
            text-align: center;
            border: 1px solid #ddd;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb !important;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <h1>ملك الماوية</h1>
        <div class="title">${title}</div>
        <div class="date">التاريخ: ${new Date().toLocaleDateString('ar-YE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}</div>
    `;

    // Add summary
    if (summary && summary.length > 0) {
      printContent += `
        <div class="summary">
          <h3>الملخص</h3>
      `;
      summary.forEach(item => {
        printContent += `
          <div class="summary-item">
            <span class="summary-label">${item.label}:</span>
            <span class="summary-value">${item.value}</span>
          </div>
        `;
      });
      printContent += `</div>`;
    }

    // Add table
    printContent += `
      <table>
        <thead>
          <tr>
    `;

    headers.forEach(header => {
      printContent += `<th>${header}</th>`;
    });

    printContent += `
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(row => {
      printContent += '<tr>';
      row.forEach(cell => {
        printContent += `<td>${cell || ''}</td>`;
      });
      printContent += '</tr>';
    });

    printContent += `
        </tbody>
      </table>
      <div class="footer">نظام ملك الماوية لإدارة المبيعات</div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } else {
      throw new Error('فشل فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
    }

    return true;
  } catch (error) {
    console.error('Print Error:', error);
    throw new Error('فشل الطباعة: ' + (error as Error).message);
  }
}