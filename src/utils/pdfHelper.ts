// PDF Helper with Arabic RTL Support
import jsPDF from 'jspdf';

// Add Arabic font support
const addArabicFont = async (doc: jsPDF) => {
  try {
    // Use built-in fonts that support Arabic
    doc.setFont('helvetica');
  } catch (error) {
    console.error('Error setting font:', error);
  }
};

export const generateArabicPDF = async (
  title: string,
  headers: string[],
  rows: any[][],
  filename: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  await addArabicFont(doc);

  // Set RTL text direction
  doc.setR2L(true);

  // Title
  doc.setFontSize(18);
  const pageWidth = doc.internal.pageSize.width;
  doc.text(title, pageWidth - 15, 20, { align: 'right' });

  // Add date
  doc.setFontSize(10);
  doc.text(
    new Date().toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    pageWidth - 15,
    30,
    { align: 'right' }
  );

  // Draw table
  let y = 45;
  const cellHeight = 10;
  const startX = 15;
  const tableWidth = pageWidth - 30;
  const colWidth = tableWidth / headers.length;

  // Headers
  doc.setFillColor(22, 163, 74); // Green
  doc.setTextColor(255, 255, 255); // White
  doc.setFontSize(12);

  headers.reverse().forEach((header, i) => {
    const x = startX + (i * colWidth);
    doc.rect(x, y, colWidth, cellHeight, 'F');
    doc.text(header, x + colWidth - 5, y + 7, { align: 'right' });
  });

  y += cellHeight;

  // Rows
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  rows.forEach((row, rowIndex) => {
    if (y > doc.internal.pageSize.height - 30) {
      doc.addPage();
      y = 20;
    }

    // Alternate row colors
    if (rowIndex % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(startX, y, tableWidth, cellHeight, 'F');
    }

    row.reverse().forEach((cell, i) => {
      const x = startX + (i * colWidth);
      const text = String(cell || '');
      doc.text(text, x + colWidth - 5, y + 7, { align: 'right' });
    });

    y += cellHeight;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `صفحة ${i} من ${pageCount} - نظام ملك الماوية`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(filename);
};

export default generateArabicPDF;
