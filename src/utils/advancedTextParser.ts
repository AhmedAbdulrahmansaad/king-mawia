/**
 * محلل نصوص متقدم للأرقام والكميات العربية
 * Advanced Arabic text parser for numbers and quantities
 */

import { parseArabicQuantity, parseArabicPrice, convertArabicToEnglish } from './arabicNumbers';

/**
 * تحويل النصوص العربية للأرقام إلى أرقام
 * مثل: "عشرة آلاف" -> 10000
 */
export function parseArabicTextToNumber(text: string): number {
  if (!text) return 0;

  const normalized = text.toLowerCase().trim();

  // الأرقام الأساسية
  const basicNumbers: Record<string, number> = {
    'صفر': 0,
    'واحد': 1, 'واحدة': 1,
    'اثنين': 2, 'اثنتين': 2, 'اثنان': 2,
    'ثلاثة': 3, 'ثلاث': 3,
    'اربعة': 4, 'اربع': 4, 'أربعة': 4, 'أربع': 4,
    'خمسة': 5, 'خمس': 5,
    'ستة': 6, 'ست': 6, 'سته': 6,
    'سبعة': 7, 'سبع': 7,
    'ثمانية': 8, 'ثماني': 8, 'ثمان': 8,
    'تسعة': 9, 'تسع': 9,
    'عشرة': 10, 'عشر': 10,
  };

  // العشرات
  const tens: Record<string, number> = {
    'عشرين': 20,
    'ثلاثين': 30,
    'اربعين': 40, 'أربعين': 40,
    'خمسين': 50,
    'ستين': 60,
    'سبعين': 70,
    'ثمانين': 80,
    'تسعين': 90,
  };

  // المئات
  const hundreds: Record<string, number> = {
    'مئة': 100, 'مائة': 100, 'مية': 100,
    'مئتين': 200, 'مائتين': 200, 'ميتين': 200,
    'ثلاثمئة': 300, 'ثلاثمائة': 300,
    'اربعمئة': 400, 'اربعمائة': 400, 'أربعمئة': 400, 'أربعمائة': 400,
    'خمسمئة': 500, 'خمسمائة': 500,
    'ستمئة': 600, 'ستمائة': 600,
    'سبعمئة': 700, 'سبعمائة': 700,
    'ثمانمئة': 800, 'ثمانمائة': 800,
    'تسعمئة': 900, 'تسعمائة': 900,
  };

  // الآلاف والملايين
  const multipliers: Record<string, number> = {
    'الف': 1000, 'ألف': 1000, 'الاف': 1000, 'آلاف': 1000,
    'الفين': 2000, 'ألفين': 2000,
    'مليون': 1000000,
    'مليونين': 2000000,
  };

  let total = 0;
  let current = 0;

  // أولاً: تحقق من الأرقام المباشرة
  const directMatch = normalized.match(/\d+/);
  if (directMatch) {
    return parseInt(directMatch[0]);
  }

  // ثانياً: تحليل النص
  const words = normalized.split(/[\s\-و]+/);

  for (const word of words) {
    // تحقق من الأرقام الأساسية
    if (basicNumbers[word] !== undefined) {
      current += basicNumbers[word];
    }
    // تحقق من العشرات
    else if (tens[word] !== undefined) {
      current += tens[word];
    }
    // تحقق من المئات
    else if (hundreds[word] !== undefined) {
      current += hundreds[word];
    }
    // تحقق من الضوارب (ألف، مليون، إلخ)
    else if (multipliers[word] !== undefined) {
      if (current === 0) current = 1;
      total += current * multipliers[word];
      current = 0;
    }
  }

  return total + current;
}

/**
 * استخراج اسم المنتج من النص
 */
export function extractProductName(text: string): string | null {
  const normalized = text.toLowerCase();

  // قائمة المنتجات المتاحة
  const products = [
    'طوفان',
    'طلب خاص',
    'حسين',
    'طلب عمنا',
    'القحطاني',
    'عبيده',
    'رقم واحد',
    'رقم 1',
  ];

  // ابحث عن المنتج في النص
  for (const product of products) {
    if (normalized.includes(product)) {
      return product === 'رقم 1' ? 'رقم واحد' : product;
    }
  }

  // محاولة استخراج أي اسم محتمل
  const patterns = [
    /(?:منتج|نوع|صنف)\s+(.+?)(?:\s|$|،|بـ)/,
    /^(.+?)(?:\s+حبة|\s+حبات|\s+بـ)/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * استخراج الكمية من النص
 */
export function extractQuantity(text: string): number {
  const normalized = text.toLowerCase();

  // ابحث عن كميات نصية
  const quantityPatterns = [
    /(\d+|نص|نصف|ربع|ثلث|ثلثين|واحد|اثنين|ثلاثة|اربعة|خمسة|ستة|سبعة|ثمانية|تسعة|عشرة|احدعشر|اثناعشر|ثلاثطعشر|اربعطعشر|خمسطعشر|ستطعشر|سبعطعشر|ثمانطعشر|تسعطعشر|عشرين|ثلاثين|اربعين|خمسين)\s*(?:حبة|حبات|حبه|وحدة|وحدات)/,
    /كمية\s+(\d+|نص|نصف|ربع|ثلث|ثلثين|واحد|اثنين|ثلاثة|اربعة|خمسة)/,
  ];

  for (const pattern of quantityPatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const quantityText = match[1];
      return parseArabicQuantity(quantityText);
    }
  }

  // إذا لم نجد، جرب البحث عن أي رقم
  const numberMatch = normalized.match(/(\d+)/);
  if (numberMatch) {
    return parseInt(numberMatch[1]);
  }

  return 1; // افتراضي: حبة واحدة
}

/**
 * استخراج السعر من النص
 */
export function extractPrice(text: string): number {
  const normalized = text.toLowerCase();

  // أنماط السعر
  const pricePatterns = [
    /(?:بـ|ب|سعر|ثمن)\s*(\d+|عشرة|عشرين|ثلاثين|اربعين|خمسين|ستين|سبعين|ثمانين|تسعين|مئة|مائة|مئتين|ثلاثمئة|اربعمئة|خمسمئة)\s*(?:الف|ألف|آلاف|الاف)?/,
    /(\d+)\s*(?:ريال|ر\.ي|ر ي)/,
    /سعرها?\s+(\d+|عشرة|عشرين|ثلاثين)/,
  ];

  for (const pattern of pricePatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      // حول النص إلى رقم
      let priceNum = parseArabicTextToNumber(match[1]);
      
      // إذا كان هناك "ألف" في النص
      if (normalized.includes('الف') || normalized.includes('ألف')) {
        if (priceNum < 1000) {
          priceNum *= 1000;
        }
      }
      
      return priceNum;
    }
  }

  // ابحث عن أي رقم كبير (أكثر من 100)
  const allNumbers = normalized.match(/\d+/g);
  if (allNumbers) {
    const largeNumbers = allNumbers.map(n => parseInt(n)).filter(n => n > 100);
    if (largeNumbers.length > 0) {
      return Math.max(...largeNumbers);
    }
  }

  return 0;
}

/**
 * استخراج اسم العميل من النص
 */
export function extractCustomerName(text: string): string | null {
  const normalized = text.toLowerCase();

  // أنماط اسم العميل
  const patterns = [
    /(?:لـ|ل|زبون|عميل|شخص|باسم)\s+([أ-ي\s]+?)(?:\s|$|،|بـ|مدفوع|معلق|دين)/,
    /(?:اسم|اسمه)\s+([أ-ي\s]+?)(?:\s|$|،)/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // تأكد أن الاسم ليس كلمة محجوزة
      if (name && !['حبة', 'حبات', 'ريال', 'الف', 'مدفوع', 'معلق'].includes(name)) {
        return name;
      }
    }
  }

  return null;
}

/**
 * تحديد حالة الدفع من النص
 */
export function extractPaymentStatus(text: string): 'paid' | 'pending' {
  const normalized = text.toLowerCase();

  // كلمات تدل على "معلق" أو "دين"
  const pendingKeywords = ['معلق', 'آجل', 'دين', 'ذمة', 'عليه', 'مؤجل', 'باقي', 'نسيئة'];
  
  for (const keyword of pendingKeywords) {
    if (normalized.includes(keyword)) {
      return 'pending';
    }
  }

  return 'paid'; // الافتراضي: مدفوع
}

/**
 * تحليل الأمر الصوتي/النصي الكامل
 */
export function parseFullCommand(command: string): {
  action: string;
  productName: string | null;
  quantity: number;
  price: number;
  customerName: string | null;
  paymentStatus: 'paid' | 'pending';
} {
  const normalized = command.toLowerCase();

  // تحديد نوع الأمر
  let action = 'createSale';
  if (normalized.includes('دين') && !normalized.includes('سجل بيع')) {
    action = 'createDebt';
  }

  return {
    action,
    productName: extractProductName(command),
    quantity: extractQuantity(command),
    price: extractPrice(command),
    customerName: extractCustomerName(command),
    paymentStatus: extractPaymentStatus(command),
  };
}
