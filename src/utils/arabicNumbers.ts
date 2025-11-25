/**
 * تحويل الأرقام العربية إلى إنجليزية
 * Converts Arabic/Persian numbers to English numbers
 */
export function convertArabicToEnglish(input: string): string {
  if (!input) return input;

  const arabicNumbers: { [key: string]: string } = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
    // Persian/Urdu numbers
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };

  let result = input.toString();
  
  // Replace Arabic numerals with English
  for (const [arabic, english] of Object.entries(arabicNumbers)) {
    result = result.replace(new RegExp(arabic, 'g'), english);
  }

  return result;
}

/**
 * تحويل نص الكمية العربي إلى رقم
 * Converts Arabic quantity text to number
 */
export function parseArabicQuantity(input: string): number {
  if (!input) return 0;

  // Convert Arabic numbers first
  let normalized = convertArabicToEnglish(input.toLowerCase().trim());

  // Handle Arabic text quantities
  const textToNumber: { [key: string]: number } = {
    'حبة': 1,
    'حبه': 1,
    'واحد': 1,
    'واحدة': 1,
    'حبتين': 2,
    'حبتان': 2,
    'اثنين': 2,
    'اثنتين': 2,
    'ثلاثة': 3,
    'ثلاث': 3,
    'اربعة': 4,
    'اربع': 4,
    'أربعة': 4,
    'أربع': 4,
    'خمسة': 5,
    'خمس': 5,
    'ستة': 6,
    'ست': 6,
    'سبعة': 7,
    'سبع': 7,
    'ثمانية': 8,
    'ثماني': 8,
    'تسعة': 9,
    'تسع': 9,
    'عشرة': 10,
    'عشر': 10,
  };

  // Check for text numbers
  for (const [text, num] of Object.entries(textToNumber)) {
    if (normalized.includes(text)) {
      return num;
    }
  }

  // Handle fractions
  if (normalized.includes('نص') || normalized.includes('نصف')) {
    return 0.5;
  }
  if (normalized.includes('ربع')) {
    return 0.25;
  }
  if (normalized.includes('ثلث')) {
    return 0.33;
  }
  if (normalized.includes('ثلثين') || normalized.includes('ثلثان')) {
    return 0.67;
  }

  // Try to extract number from string
  const numberMatch = normalized.match(/\d+\.?\d*/);
  if (numberMatch) {
    return parseFloat(numberMatch[0]);
  }

  return 0;
}

/**
 * تحويل السعر من نص عربي إلى رقم
 * Converts Arabic price text to number
 */
export function parseArabicPrice(input: string): number {
  if (!input) return 0;

  // Convert Arabic numbers first
  let normalized = convertArabicToEnglish(input.toLowerCase().trim());

  // Remove common words
  normalized = normalized
    .replace(/ريال|ريالات|الف|ألف|الاف|آلاف/g, '')
    .trim();

  // Handle thousands
  let multiplier = 1;
  const originalInput = input.toLowerCase();
  if (originalInput.includes('الف') || originalInput.includes('ألف') || originalInput.includes('الاف') || originalInput.includes('آلاف') || originalInput.includes('k')) {
    multiplier = 1000;
  }

  // Extract number
  const numberMatch = normalized.match(/\d+\.?\d*/);
  if (numberMatch) {
    return parseFloat(numberMatch[0]) * multiplier;
  }

  return 0;
}

/**
 * تنسيق الكمية للعرض بالعربية
 * Format quantity for display in Arabic
 */
export function formatQuantityArabic(quantity: number): string {
  if (quantity === 0.25) return 'ربع حبة';
  if (quantity === 0.33) return 'ثلث حبة';
  if (quantity === 0.5) return 'نص حبة';
  if (quantity === 0.67) return 'ثلثين حبة';
  if (quantity === 1) return 'حبة';
  if (quantity === 2) return 'حبتين';
  if (quantity === 3) return '٣ حبات';
  if (quantity > 3 && quantity < 11) return `${quantity} حبات`;
  return `${quantity} حبة`;
}
