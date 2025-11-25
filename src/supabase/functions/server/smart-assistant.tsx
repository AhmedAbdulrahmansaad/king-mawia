/**
 * ---------------------------------------------------------
 *  SMART ASSISTANT API — FULL VERSION (ARABIC + COMMENTS)
 * ---------------------------------------------------------
 *
 * المساعد الذكي الشامل لنظام ملك المavia
 * ✓ تحليل الصور (Vision)
 * ✓ استخراج بيانات المبيعات
 * ✓ إدخال البيانات في قاعدة البيانات
 * ✓ أوامر الديون
 * ✓ أوامر التقارير (يومي + شهري)
 * ✓ رد نصّي ذكي
 *
 * ---------------------------------------------------------
 */

import OpenAI from 'npm:openai@4';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// ---------------------------------------------------------
// (1) تهيئة OpenAI
// ---------------------------------------------------------
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// ---------------------------------------------------------
// (2) تهيئة Supabase (SERVICE_ROLE)
// ---------------------------------------------------------
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ---------------------------------------------------------
// (3) رفع صورة إلى Supabase Storage
// ---------------------------------------------------------
async function uploadImageToSupabase(base64: string, userId: string): Promise<string> {
  const bucketName = 'make-06efd250-uploads';

  // إنشاء Bucket إذا لم يكن موجوداً
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: true });
  }

  const fileName = `assistant/${userId}_${Date.now()}.jpg`;

  // تحويل base64 إلى Uint8Array
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, bytes, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw new Error('فشل رفع الصورة إلى التخزين: ' + error.message);

  const { data: pub } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return pub.publicUrl;
}

// ---------------------------------------------------------
// (3.5) إضافة إشعار
// ---------------------------------------------------------
async function addNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  amount?: number;
  customerName?: string;
}) {
  try {
    const notificationId = crypto.randomUUID();
    const notification = {
      id: notificationId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      amount: data.amount,
      customerName: data.customerName,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`notification:${notificationId}`, notification);
    return notification;
  } catch (error) {
    console.error('Error adding notification:', error);
    // لا نرمي الخطأ حتى لا نعطل العملية الأساسية
  }
}

// ---------------------------------------------------------
// (4) تحليل صورة عبر OpenAI Vision
// ---------------------------------------------------------
async function analyzeImage(imageUrl: string, instruction: string = '') {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },

      messages: [
        {
          role: 'system',
          content: `
أنت مساعد ذكي متخصص في قراءة الصور التي تحتوي على مبيعات وعمليات مالية لنظام "ملك المavia".

أنواع القات المتاحة:
- طوفان
- طلب خاص
- حسين
- طلب عمنا
- القحطاني
- عبيده
- رقم واحد

الكميات المتاحة:
- حبة
- نص حبة (0.5)
- ثلثين حبة (0.66)
- ربع حبة (0.25)
- 3 حبات
- أي عدد من الحبات

أخرج JSON فقط كالتالي:

{
  "items": [
    {
      "type": "اسم نوع القات",
      "quantity": العدد_رقمي,
      "unit_price": السعر_للوحدة,
      "total": الإجمالي,
      "customerName": "اسم الزبون أو فارغ",
      "note": "ملاحظات أو فارغ"
    }
  ],
  "summary": {
    "total_sales": الإجمالي_الكلي,
    "by_type": {
      "طوفان": العدد,
      "طلب خاص": العدد
    }
  },
  "notes": "ملاحظات إضافية"
}

اقرأ الصورة بعناية واستخرج كل البيانات بدقة. العملة بالريال اليمني.
`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: instruction || 'حلل هذه الصورة واستخرج بيانات المبيعات' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error: any) {
    // Handle quota errors
    if (error.status === 429 || error.code === 'insufficient_quota') {
      throw new Error('نفد رصيد OpenAI API. يرجى إضافة رصيد أو استخدام API Key خاص بك.');
    }
    throw error;
  }
}

// ---------------------------------------------------------
// (5) إدخال بيانات المبيعات في KV Store
// ---------------------------------------------------------
async function insertSales(items: any[], userId: string) {
  const saved = [];

  for (const item of items) {
    const saleId = `sale:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const total = item.unit_price * item.quantity;
    
    const sale = {
      id: saleId,
      product_name: item.type,
      quantity: item.quantity,
      price: item.unit_price,
      total_amount: total,
      customer_name: item.customerName || '',
      payment_status: 'paid',
      notes: item.note || 'تم الإضافة عبر المساعد الذكي - تحليل صورة',
      sale_date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      createdBy: userId,
      seller_name: '', // سيتم ملؤه لاحقاً
      source: 'smart-assistant-image',
    };

    await kv.set(saleId, sale);
    saved.push(sale);
    
    // إضافة إشعار
    await addNotification({
      userId,
      type: 'sale',
      title: '✅ تسجيل بيع جديد',
      message: `تم تسجيل بيع ${item.type} - ${item.quantity} حبة بمبلغ ${total.toLocaleString('ar-YE')} ريال`,
      amount: total,
      customerName: item.customerName,
    });
  }

  return saved;
}

// ---------------------------------------------------------
// (6) إضافة دين جديد
// ---------------------------------------------------------
async function addDebt({ customer, amount, note, due_date }: any) {
  const debtId = crypto.randomUUID();
  const debt = {
    id: debtId,
    customerName: customer,
    amount: amount,
    notes: note || '',
    status: 'unpaid',
    dueDate: due_date,
    createdAt: new Date().toISOString(),
  };

  await kv.set(`debt:${debtId}`, debt);
  return debt;
}

// ---------------------------------------------------------
// (7) تحديث دين إلى مدفوع
// ---------------------------------------------------------
async function markDebtPaid(id: string) {
  const debt = await kv.get(`debt:${id}`);
  if (!debt) throw new Error('الدين غير موجود');

  const updated = { ...debt, status: 'paid', paidAt: new Date().toISOString() };
  await kv.set(`debt:${id}`, updated);
  return updated;
}

// ---------------------------------------------------------
// (8) تقارير المبيعات اليومية
// ---------------------------------------------------------
async function dailyReport() {
  const today = new Date().toISOString().split('T')[0];

  const allSales = await kv.getByPrefix('sale:');
  const todaySales = allSales.filter((sale: any) => {
    const saleDate = sale.createdAt?.split('T')[0] || sale.sale_date;
    return saleDate === today;
  });

  // إصلاح: استخدام total_amount بدلاً من totalPrice
  const total = todaySales.reduce((s: number, x: any) => s + (x.total_amount || x.totalPrice || 0), 0);

  console.log('📊 [DAILY REPORT]:', {
    today,
    count: todaySales.length,
    total
  });

  return { total, items: todaySales, count: todaySales.length };
}

// ---------------------------------------------------------
// (9) تقرير شهري
// ---------------------------------------------------------
async function monthlyReport(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${endMonth}`;

  const allSales = await kv.getByPrefix('sale:');
  const monthSales = allSales.filter((sale: any) => {
    const saleDate = sale.createdAt?.split('T')[0] || sale.sale_date;
    return saleDate >= startDate && saleDate <= endDate;
  });

  // إصلاح: استخدام total_amount بدلاً من totalPrice
  const total = monthSales.reduce((s: number, x: any) => s + (x.total_amount || x.totalPrice || 0), 0);

  console.log('📊 [MONTHLY REPORT]:', {
    year,
    month,
    count: monthSales.length,
    total
  });

  return { total, items: monthSales, count: monthSales.length };
}

// ---------------------------------------------------------
// (10) رد نصي ذكي (بدون صور)
// ---------------------------------------------------------
async function handleText(text: string, userId: string) {
  try {
    // جلب جميع البيانات من النظام
    const allSales = await kv.getByPrefix('sale:');
    const allDebts = await kv.getByPrefix('debt:');
    const allCustomers = await kv.getByPrefix('customer:');
    const allProducts = await kv.getByPrefix('product:');
    const allUsers = await kv.getByPrefix('user:');
    
    // حساب إحصائيات المبيعات - إصلاح: استخدام total_amount
    const totalSales = allSales.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.totalPrice || 0), 0);
    const totalSalesCount = allSales.length;
    
    // حساب الديون
    const unpaidDebts = allDebts.filter((debt: any) => debt.status === 'unpaid' || debt.status === 'pending');
    const totalDebts = unpaidDebts.reduce((sum: number, debt: any) => sum + (debt.remaining_amount || debt.amount || 0), 0);
    
    // مبيعات اليوم
    const today = new Date().toISOString().split('T')[0];
    const todaySales = allSales.filter((sale: any) => {
      const saleDate = sale.createdAt?.split('T')[0] || sale.sale_date;
      return saleDate === today;
    });
    const todayTotal = todaySales.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.totalPrice || 0), 0);
    
    // مبيعات هذا الشهر
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthSales = allSales.filter((sale: any) => {
      const saleMonth = sale.createdAt?.substring(0, 7) || sale.sale_date?.substring(0, 7);
      return saleMonth === thisMonth;
    });
    const monthTotal = monthSales.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.totalPrice || 0), 0);
    
    // أكثر المنتجات مبيعاً
    const productStats: any = {};
    allSales.forEach((sale: any) => {
      const type = sale.product_name || sale.type || 'غير محدد';
      if (!productStats[type]) {
        productStats[type] = { count: 0, quantity: 0, total: 0 };
      }
      productStats[type].count++;
      productStats[type].quantity += sale.quantity || 0;
      productStats[type].total += sale.total_amount || sale.totalPrice || 0;
    });
    
    const topProducts = Object.entries(productStats)
      .sort((a: any, b: any) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([name, stats]: any) => ({
        name,
        count: stats.count,
        quantity: stats.quantity,
        total: stats.total
      }));
    
    // أكثر العملاء شراءً
    const customerStats: any = {};
    allSales.forEach((sale: any) => {
      const customer = sale.customer_name || sale.customerName || 'غير محدد';
      if (!customerStats[customer]) {
        customerStats[customer] = { count: 0, total: 0 };
      }
      customerStats[customer].count++;
      customerStats[customer].total += sale.total_amount || sale.totalPrice || 0;
    });
    
    const topCustomers = Object.entries(customerStats)
      .filter(([name]) => name !== 'غير محدد' && name !== '')
      .sort((a: any, b: any) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([name, stats]: any) => ({
        name,
        count: stats.count,
        total: stats.total
      }));
    
    // بناء سياق البيانات للمساعد
    const dataContext = `
البيانات الحالية للنظام:

📊 إحصائيات المبيعات:
- إجمالي المبيعات الكلي: ${totalSales.toLocaleString('ar-YE')} ريال يمني
- عدد عمليات البيع الكلي: ${totalSalesCount}
- مبيعات اليوم: ${todayTotal.toLocaleString('ar-YE')} ريال يمني (${todaySales.length} عملية)
- مبيعات هذا الشهر: ${monthTotal.toLocaleString('ar-YE')} ريال يمني (${monthSales.length} عملية)

💰 الديون:
- عدد الديون المعلقة: ${unpaidDebts.length}
- إجمالي الديون المعلقة: ${totalDebts.toLocaleString('ar-YE')} ريال يمني

 أفضل 5 منتجات مبيعاً:
${topProducts.map((p, i) => `${i + 1}. ${p.name}: ${p.quantity} حبة، ${p.total.toLocaleString('ar-YE')} ريال (${p.count} عملية)`).join('\n')}

👥 أفضل 5 عملاء:
${topCustomers.map((c, i) => `${i + 1}. ${c.name}: ${c.total.toLocaleString('ar-YE')} ريال (${c.count} عملية)`).join('\n')}

عدد العملاء المسجلين: ${allCustomers.length}
عدد المنتجات: ${allProducts.length}
عدد المستخدمين: ${allUsers.length}

تفاصيل المبيعات الأخيرة (آخر 10):
${allSales.slice(-10).reverse().map((s: any, i: number) => 
  `${i + 1}. ${s.type || 'غير محدد'} - ${s.quantity} حبة - ${(s.totalPrice || 0).toLocaleString('ar-YE')} ريال - ${s.customerName || 'بدون اسم'} - ${new Date(s.createdAt).toLocaleDateString('ar-YE')}`
).join('\n')}

تفاصيل الديون المعلقة:
${unpaidDebts.slice(0, 10).map((d: any, i: number) => 
  `${i + 1}. ${d.customerName || 'غير محدد'}: ${(d.amount || 0).toLocaleString('ar-YE')} ريال - تاريخ الاستحقاق: ${d.dueDate ? new Date(d.dueDate).toLocaleDateString('ar-YE') : 'غير محدد'}`
).join('\n')}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
أنت مساعد ذكي متقدم داخل نظام "ملك المavia" لإدارة مبيعات وتجارة القات.

نظام القات يدعم الأنواع التالية:
- طوفان
- طلب خاص
- حسين
- طلب عمنا
- القحطاني
- عبيده
- رقم واحد

لديك وصول كامل لجميع بيانات النظام الحقيقية.

يمكنك:
✓ تحليل البيانات وإعطاء إحصائيات دقيقة
✓ استخراج التقارير اليومية والشهرية
✓ حساب الديون والأرباح
✓ تحديد أفضل المنتجات والعملاء
✓ إعطاء توصيات بناءً على البيانات
✓ الإجابة على أي سؤال عن المبيعات والديون والعملاء
✓ تحليل الاتجاهات والأنماط
✓ مقارنة الأداء بين الفترات
✓ اقتراح تحسينات للمبيعات

استخدم أسلوب عربي واضح ومباشر ومهني. كن مفيداً ودقيقاً وقدم تحليلات عميقة.
استخدم الأيقونات (emojis) لجعل الردود أكثر وضوحاً.
قدم الأرقام بتنسيق عربي واضح مع فواصل الآلاف.
العملة دائماً: الريال اليمني

${dataContext}
`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    return completion.choices[0].message.content || 'عذراً، لم أتمكن من فهم طلبك.';
  } catch (error: any) {
    // Handle quota errors specifically
    if (error.status === 429 || error.code === 'insufficient_quota') {
      return `⚠️ **نفد رصيد OpenAI API**

للاستمرار في استخدام المساعد الذكي:

🔑 **الحل 1: أضف API Key خاص بك**
1. اذهب إلى: https://platform.openai.com/api-keys
2. أنشئ مفتاح جديد
3. أضفه في Supabase Environment Variables
4. أعد تشغيل النظام

💳 **الحل 2: فعّل الدفع في OpenAI**
1. اذهب إلى: https://platform.openai.com/settings/organization/billing
2. أضف بطاقة ائتمان
3. أضف رصيد ($5-10 كافي للبداية)

💡 **البدائل:**
• استخدم نظام المبيعات العادي
• أدخل البيانات يدوياً
• استخدم التقارير المدمجة (بدون AI)`;
    }
    
    throw error;
  }
}

// ---------------------------------------------------------
// (11) الوظائف المصدّرة
// ---------------------------------------------------------
export async function processAssistantRequest(body: any) {
  const { mode, text, imageBase64, userId, command, payload } = body;

  // ---------------- TEXT MODE ----------------
  if (mode === 'text') {
    // تحليل النص لاكتشاف الأوامر
    const lowerText = text.toLowerCase();
    
    // أوامر إضافة مبيعات
    if (lowerText.includes('سجل') || lowerText.includes('أضف مبيع') || lowerText.includes('بيع جديد')) {
      // محاولة استخراج بيانات البيع من النص
      try {
        const saleData = await extractSaleFromText(text, userId);
        if (saleData) {
          // التأكد من وجود الأسعار قبل العرض
          const displayUnitPrice = saleData.unitPrice || saleData.price || 0;
          const displayTotalPrice = saleData.totalPrice || saleData.total_amount || 0;
          
          return {
            success: true,
            reply: `✅ تم تسجيل عملية البيع بنجاح!\n\n📦 النوع: ${saleData.type || saleData.product_name}\n🔢 الكمية: ${saleData.quantity} حبة\n💵 السعر للحبة: ${displayUnitPrice.toLocaleString('ar-YE')} ريال\n💰 الإجمالي: ${displayTotalPrice.toLocaleString('ar-YE')} ريال يمني\n${saleData.customerName || saleData.customer_name ? `👤 العميل: ${saleData.customerName || saleData.customer_name}\n` : ''}\n✨ تم الحفظ في النظام!`,
            data: saleData
          };
        }
      } catch (e) {
        console.error('Error processing sale:', e);
        // إذا فشل الاستخراج، نكمل بالرد العادي
      }
    }
    
    // أوامر البحث عن عملاء
    if (lowerText.includes('ابحث عن') || lowerText.includes('معلومات عن') || lowerText.includes('كشف حساب')) {
      const customerData = await searchCustomerData(text);
      if (customerData) {
        return {
          success: true,
          reply: customerData,
        };
      }
    }
    
    // أوامر التقارير مع PDF
    if (lowerText.includes('تقرير') && (lowerText.includes('pdf') || lowerText.includes('ملف'))) {
      if (lowerText.includes('يوم') || lowerText.includes('اليوم')) {
        const reportData = await dailyReport();
        return {
          success: true,
          reply: `📊 تقرير اليوم\\n\\n💰 الإجمالي: ${reportData.total.toLocaleString('ar-YE')} ريال\\n📦 عدد العمليات: ${reportData.count}\\n\\n📥 يمكنك تحميل التقرير من صفحة التقارير أو استخدام زر التصدير`,
          result: reportData,
          reportType: 'daily'
        };
      }
    }
    
    const reply = await handleText(text, userId);
    return { success: true, reply };
  }

  // ---------------- IMAGE MODE ----------------
  if (mode === 'image') {
    const url = await uploadImageToSupabase(imageBase64, userId);
    const extracted = await analyzeImage(url, text);
    const saved = await insertSales(extracted.items, userId);

    return {
      success: true,
      reply: '✅ تم تحليل الصورة وحفظ العمليات بنجاح!',
      extracted,
      insertedCount: saved.length,
      savedSales: saved,
    };
  }

  // ---------------- COMMAND MODE ----------------
  if (mode === 'command') {
    switch (command) {
      case 'addDebt':
        return {
          success: true,
          result: await addDebt(payload),
          message: '✅ تم إضافة الدين بنجاح'
        };

      case 'markDebtPaid':
        return {
          success: true,
          result: await markDebtPaid(payload.id),
          message: '✅ تم تحديث حالة الدين إلى مدفوع'
        };

      case 'dailyReport':
        return {
          success: true,
          result: await dailyReport(),
          message: '📊 تقرير المبيعات اليومية'
        };

      case 'monthlyReport':
        return {
          success: true,
          result: await monthlyReport(payload.year, payload.month),
          message: '📊 تقرير المبيعات الشهرية'
        };
      
      case 'addSale':
        return {
          success: true,
          result: await addSaleCommand(payload, userId),
          message: '✅ تم إضافة عملية البيع بنجاح'
        };
      
      case 'searchCustomer':
        return {
          success: true,
          result: await searchCustomer(payload.customerName),
          message: '📋 بيانات العميل'
        };

      default:
        throw new Error('أمر غير معروف');
    }
  }

  throw new Error('mode غير معروف');
}

// ---------------------------------------------------------
// (12) استخراج بيانات البيع من النص
// ---------------------------------------------------------
async function extractSaleFromText(text: string, userId: string) {
  try {
    // جلب جميع المبيعات لحساب متوسط الأسعار
    const allSales = await kv.getByPrefix('sale:');
    
    // حساب متوسط أسعار كل منتج من المبيعات السابقة
    const priceAverages: any = {};
    const productCounts: any = {};
    
    allSales.forEach((sale: any) => {
      if (sale.type && sale.unitPrice && sale.unitPrice > 0) {
        if (!priceAverages[sale.type]) {
          priceAverages[sale.type] = 0;
          productCounts[sale.type] = 0;
        }
        priceAverages[sale.type] += sale.unitPrice;
        productCounts[sale.type]++;
      }
    });
    
    // حساب المتوسطات النهائية
    for (const type in priceAverages) {
      priceAverages[type] = Math.round(priceAverages[type] / productCounts[type]);
    }
    
    // أسعار افتراضية في حال عدم وجود مبيعات سابقة
    const defaultPrices: any = {
      'طوفان': 15000,
      'طلب خاص': 22000,
      'حسين': 15000,
      'طلب عمنا': 18000,
      'القحطاني': 16000,
      'عبيده': 14000,
      'رقم واحد': 25000
    };
    
    // بناء قائمة الأسعار المتاحة للمساعد
    const availablePrices: any = {};
    for (const type in defaultPrices) {
      availablePrices[type] = priceAverages[type] || defaultPrices[type];
    }
    
    const pricesList = Object.entries(availablePrices)
      .map(([type, price]) => `${type}: ${price} ريال/حبة`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `استخرج بيانات عملية البيع من النص العربي. الأنواع المتاحة: طوفان، طلب خاص، حسين، طلب عمنا، القحطاني، عبيده، رقم واحد.

**الأسعار الحالية في النظام:**
${pricesList}

**مهم جداً:**
- إذا ذكر المستخدم السعر صراحة، استخدمه
- إذا لم يذكر السعر، استخدم السعر من القائمة أعلاه
- إذا ذكر الإجمالي فقط، احسب السعر للحبة = الإجمالي / الكمية
- **يجب ألا يكون السعر صفراً أبداً**
- الكميات المتاحة: حبة (1)، نص حبة (0.5)، ربع حبة (0.25)، ثلثين حبة (0.66)، 3 حبات (3)، إلخ

أخرج JSON بهذا الشكل:
{
  "type": "نوع القات",
  "quantity": الكمية_رقمية,
  "unitPrice": السعر_للحبة_الواحدة,
  "totalPrice": الإجمالي,
  "customerName": "اسم العميل أو فارغ",
  "paymentStatus": "paid أو pending",
  "notes": "ملاحظات"
}

**أمثلة:**
- "سجل بيع طوفان 3 حبات" → استخدم السعر من القائمة (15000) × 3 = 45000
- "سجل بيع طوفان 3 حبات بـ 45000" → استخدم 45000 كإجمالي، السعر للحبة = 15000
- "سجل بيع طلب خاص حبة بـ 20000" → استخدم 20000

تأكد من حساب unitPrice و totalPrice بشكل صحيح.`
        },
        { role: 'user', content: text }
      ]
    });
    
    const data = JSON.parse(completion.choices[0].message.content || '{}');
    
    if (!data.type || !data.quantity) {
      return null;
    }
    
    // التأكد من وجود الأسعار - استخدام الأسعار من النظام
    let unitPrice = data.unitPrice || 0;
    let totalPrice = data.totalPrice || 0;
    
    // إذا لم يكن هناك سعر، استخدم السعر من القائمة
    if (unitPrice === 0 && totalPrice === 0) {
      unitPrice = availablePrices[data.type] || defaultPrices[data.type] || 15000;
      totalPrice = unitPrice * data.quantity;
    } else if (totalPrice === 0 && unitPrice > 0) {
      // إذا كان هناك سعر للحبة فقط
      totalPrice = unitPrice * data.quantity;
    } else if (unitPrice === 0 && totalPrice > 0) {
      // إذا كان هناك إجمالي فقط
      unitPrice = Math.round(totalPrice / data.quantity);
    }
    
    // التأكد من أن الأسعار ليست صفراً
    if (unitPrice === 0 || totalPrice === 0) {
      unitPrice = availablePrices[data.type] || defaultPrices[data.type] || 15000;
      totalPrice = unitPrice * data.quantity;
    }
    
    console.log('💰 [SALE] الأسعار النهائية:', {
      unitPrice,
      totalPrice,
      type: data.type,
      quantity: data.quantity
    });
    
    // إضافة البيع إلى قاعدة البيانات بنفس تنسيق صفحة المبيعات
    const saleId = `sale:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sale = {
      id: saleId,
      product_name: data.type,
      quantity: data.quantity,
      price: unitPrice,
      total_amount: totalPrice,
      customer_name: data.customerName || '',
      payment_status: data.paymentStatus || 'paid',
      notes: data.notes || 'تم الإضافة عبر المساعد الذكي',
      sale_date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      createdBy: userId,
      seller_name: '', // سيتم ملؤه من بيانات المستخدم
      source: 'smart-assistant-text',
    };
    
    console.log('📦 [SALE] حفظ البيع في قاعدة البيانات:', saleId);
    await kv.set(saleId, sale);
    console.log('✅ [SALE] تم الحفظ بنجاح!');
    
    // إنشاء دين إذا كانت الحالة pending
    if (data.paymentStatus === 'pending' && data.customerName) {
      const debtId = `debt:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const debt = {
        id: debtId,
        sale_id: saleId,
        customer_name: data.customerName,
        product_name: data.type,
        quantity: data.quantity,
        amount: totalPrice,
        paid_amount: 0,
        remaining_amount: totalPrice,
        status: 'pending',
        sale_date: new Date().toISOString().split('T')[0],
        notes: data.notes || 'تم الإضافة عبر المساعد الذكي',
        createdAt: new Date().toISOString(),
        createdBy: userId,
        seller_name: '',
      };
      await kv.set(debtId, debt);
    }
    
    // إضافة إشعار
    await addNotification({
      userId,
      type: 'sale',
      title: '✅ تسجيل بيع جديد',
      message: `تم تسجيل بيع ${data.type} - ${data.quantity} حبة بمبلغ ${totalPrice.toLocaleString('ar-YE')} ريال${data.customerName ? ` للعميل ${data.customerName}` : ''}`,
      amount: totalPrice,
      customerName: data.customerName,
    });
    
    return {
      ...sale,
      type: data.type,
      unitPrice,
      totalPrice,
      customerName: data.customerName,
      paymentStatus: data.paymentStatus || 'paid',
    };
  } catch (error) {
    console.error('Error extracting sale:', error);
    return null;
  }
}

// ---------------------------------------------------------
// (13) البحث عن بيانات عميل
// ---------------------------------------------------------
async function searchCustomerData(text: string) {
  const allSales = await kv.getByPrefix('sale:');
  const allDebts = await kv.getByPrefix('debt:');
  
  // محاولة استخراج اسم العميل من النص
  const customerNameMatch = text.match(/عن\s+(.+?)(?:\s|$|؟)/);
  const searchName = customerNameMatch ? customerNameMatch[1].trim() : '';
  
  if (!searchName) {
    return null;
  }
  
  // البحث في المبيعات
  const customerSales = allSales.filter((sale: any) => 
    (sale.customer_name?.toLowerCase().includes(searchName.toLowerCase()) ||
     sale.customerName?.toLowerCase().includes(searchName.toLowerCase()))
  );
  
  // البحث في الديون
  const customerDebts = allDebts.filter((debt: any) => 
    (debt.customer_name?.toLowerCase().includes(searchName.toLowerCase()) ||
     debt.customerName?.toLowerCase().includes(searchName.toLowerCase()))
  );
  
  if (customerSales.length === 0 && customerDebts.length === 0) {
    return `❌ لم يتم العثور على بيانات للعميل "${searchName}"`;
  }
  
  // إصلاح: استخدام total_amount بدلاً من totalPrice
  const totalPurchases = customerSales.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.totalPrice || 0), 0);
  const unpaidDebts = customerDebts.filter((d: any) => d.status === 'unpaid' || d.status === 'pending');
  const totalDebts = unpaidDebts.reduce((sum: number, debt: any) => sum + (debt.remaining_amount || debt.amount || 0), 0);
  
  console.log('🔍 [SEARCH CUSTOMER]:', {
    searchName,
    totalPurchases,
    salesCount: customerSales.length,
    totalDebts,
    debtsCount: unpaidDebts.length
  });
  
  let report = `📋 **كشف حساب العميل: ${searchName}**\n\n`;
  report += `📊 **إحصائيات:**\n`;
  report += `- إجمالي المشتريات: ${totalPurchases.toLocaleString('ar-YE')} ريال يمني\n`;
  report += `- عدد عمليات الشراء: ${customerSales.length}\n`;
  report += `- الديون المعلقة: ${totalDebts.toLocaleString('ar-YE')} ريال يمني (${unpaidDebts.length} دين)\n\n`;
  
  if (customerSales.length > 0) {
    report += `🛒 **آخر 5 عمليات شراء:**\n`;
    customerSales.slice(-5).reverse().forEach((sale: any, i: number) => {
      const saleTotal = sale.total_amount || sale.totalPrice || 0;
      const saleType = sale.product_name || sale.type || 'غير محدد';
      report += `${i + 1}. ${saleType} - ${sale.quantity} حبة - ${saleTotal.toLocaleString('ar-YE')} ريال - ${new Date(sale.createdAt).toLocaleDateString('ar-YE')}\n`;
    });
  }
  
  if (unpaidDebts.length > 0) {
    report += `\n💰 **الديون المعلقة:**\n`;
    unpaidDebts.forEach((debt: any, i: number) => {
      const debtAmount = debt.remaining_amount || debt.amount || 0;
      report += `${i + 1}. ${debtAmount.toLocaleString('ar-YE')} ريال - ${debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('ar-YE') : 'بدون تاريخ'}\n`;
    });
  }
  
  return report;
}

// ---------------------------------------------------------
// (14) إضافة بيع عبر أمر مباشر
// ---------------------------------------------------------
async function addSaleCommand(data: any, userId: string) {
  const saleId = crypto.randomUUID();
  const sale = {
    id: saleId,
    type: data.type,
    quantity: data.quantity,
    unitPrice: data.unitPrice || 0,
    totalPrice: data.totalPrice || (data.unitPrice * data.quantity),
    customerName: data.customerName || '',
    paymentStatus: data.paymentStatus || 'paid',
    notes: data.notes || '',
    sellerId: userId,
    source: 'smart-assistant-command',
    createdAt: new Date().toISOString(),
  };
  
  await kv.set(`sale:${saleId}`, sale);
  return sale;
}

// ---------------------------------------------------------
// (15) البحث عن عميل
// ---------------------------------------------------------
async function searchCustomer(customerName: string) {
  const allSales = await kv.getByPrefix('sale:');
  const allDebts = await kv.getByPrefix('debt:');
  
  const customerSales = allSales.filter((sale: any) => 
    (sale.customer_name?.toLowerCase().includes(customerName.toLowerCase()) ||
     sale.customerName?.toLowerCase().includes(customerName.toLowerCase()))
  );
  
  const customerDebts = allDebts.filter((debt: any) => 
    (debt.customer_name?.toLowerCase().includes(customerName.toLowerCase()) ||
     debt.customerName?.toLowerCase().includes(customerName.toLowerCase()))
  );
  
  const totalPurchases = customerSales.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.totalPrice || 0), 0);
  const unpaidDebts = customerDebts.filter((d: any) => d.status === 'unpaid' || d.status === 'pending');
  const totalDebts = unpaidDebts.reduce((sum: number, debt: any) => sum + (debt.remaining_amount || debt.amount || 0), 0);
  
  return {
    customerName,
    totalPurchases,
    purchaseCount: customerSales.length,
    totalDebts,
    debtCount: unpaidDebts.length,
    recentSales: customerSales.slice(-10).reverse(),
    unpaidDebts: unpaidDebts
  };
}