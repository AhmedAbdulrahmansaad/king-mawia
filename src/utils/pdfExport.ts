/**
 * نظام تصدير PDF مع دعم كامل للعربية
 * يستخدم طريقة الطباعة من المتصفح لضمان عرض صحيح للعربية
 */

import logoImage from 'figma:asset/eb93a45a387f09423d4a9ce3fe3a9b5424d58d98.png';

export async function exportToPDFDirect(
  title: string,
  headers: string[],
  rows: any[][],
  filename: string,
  summary?: { label: string; value: string }[]
) {
  try {
    // Convert logo image to base64
    const logoBase64 = await fetch(logoImage)
      .then(r => r.blob())
      .then(blob => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }))
      .catch(() => ''); // Fallback if image loading fails

    // Create print-friendly HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('يرجى السماح بالنوافذ المنبثقة لتصدير PDF');
    }

    const dateStr = new Date().toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let summaryHTML = '';
    if (summary && summary.length > 0) {
      summaryHTML = `
        <div class="summary">
          <h3>الملخص</h3>
          <div class="summary-grid">
            ${summary.map(item => `
              <div class="summary-item">
                <span class="summary-label">${item.label}:</span>
                <span class="summary-value">${item.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${headers.length > 5 ? 'A4 landscape' : 'A4 portrait'};
      margin: 15mm;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Tahoma', 'Segoe UI', sans-serif;
      direction: rtl;
      text-align: right;
      padding: 20px;
      background: white;
      color: #000;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #16a34a;
      padding-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }
    
    .logo-container {
      width: 180px;
      height: auto;
      margin-bottom: 10px;
    }
    
    .logo-container img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
    
    .company-name {
      font-size: 28px;
      font-weight: bold;
      color: #16a34a;
      margin: 10px 0;
    }
    
    .title {
      font-size: 22px;
      font-weight: bold;
      color: #000;
      margin: 8px 0;
    }
    
    .date {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
    
    .summary {
      background: #f0fdf4;
      border: 2px solid #16a34a;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    
    .summary h3 {
      color: #16a34a;
      font-size: 20px;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #d1d5db;
    }
    
    .summary-label {
      color: #666;
      font-size: 14px;
      font-weight: normal;
    }
    
    .summary-value {
      font-weight: bold;
      font-size: 16px;
      color: #16a34a;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      direction: rtl;
      background: white;
    }
    
    th {
      background-color: #16a34a !important;
      color: white !important;
      padding: 12px 8px;
      text-align: center;
      border: 1px solid #047857;
      font-weight: bold;
      font-size: 14px;
    }
    
    td {
      padding: 10px 8px;
      text-align: center;
      border: 1px solid #d1d5db;
      font-size: 13px;
      color: #000;
    }
    
    tr:nth-child(even) {
      background-color: #f9fafb !important;
    }
    
    tr:nth-child(odd) {
      background-color: white !important;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #666;
      font-size: 12px;
    }
    
    .footer .company-title {
      font-size: 16px;
      font-weight: bold;
      color: #16a34a;
      margin-bottom: 8px;
    }
    
    @media print {
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    ${logoBase64 ? `
      <div class="logo-container">
        <img src="${logoBase64}" alt="ملك الماوية" />
      </div>
    ` : `
      <div class="company-name">ملك الماوية</div>
    `}
    <div class="title">${title}</div>
    <div class="date">التاريخ: ${dateStr}</div>
  </div>

  ${summaryHTML}

  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map(row => `
        <tr>
          ${row.map(cell => `<td>${cell || '-'}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p class="company-title">ملك الماوية - عبده ماوية</p>
    <p style="margin-top: 8px; font-size: 11px;">تم إنشاء هذا التقرير في: ${dateStr}</p>
  </div>

  <script>
    // Auto print when page loads
    window.onload = function() {
      setTimeout(function() {
        window.print();
        // Close window after printing (optional)
        // window.onafterprint = function() { window.close(); };
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('فشل تصدير PDF: ' + (error as Error).message);
  }
}
