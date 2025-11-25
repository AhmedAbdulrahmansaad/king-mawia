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
أنت مساعد ذكي متخصص في قراءة الصور التي تحتوي على مبيعات وعمليات مالية لنظام "ملك الماوية".

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
    const saleId = crypto.randomUUID();
    const sale = {
      id: saleId,
      type: item.type,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total,
      customerName: item.customerName || '',
      paymentStatus: 'paid',
      notes: item.note || '',
      sellerId: userId,
      source: 'smart-assistant-image',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`sale:${saleId}`, sale);
    saved.push(sale);
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
    const saleDate = sale.createdAt.split('T')[0];
    return saleDate === today;
  });

  const total = todaySales.reduce((s: number, x: any) => s + (x.totalPrice || 0), 0);

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
    const saleDate = sale.createdAt.split('T')[0];
    return saleDate >= startDate && saleDate <= endDate;
  });

  const total = monthSales.reduce((s: number, x: any) => s + (x.totalPrice || 0), 0);

  return { total, items: monthSales, count: monthSales.length };
}

// ---------------------------------------------------------
// (10) رد نصي ذكي (بدون صور)
// ---------------------------------------------------------
async function handleText(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
أنت مساعد ذكي داخل نظام "ملك المavia" لإدارة مبيعات وتجارة القات.

نظام القات يدعم الأنواع التالية:
- طوفان
- طلب خاص
- حسين
- طلب عمنا
- القحطاني
- عبيده
- رقم واحد

يمكنك:
✓ تحليل البيانات
✓ استخراج التقارير
✓ حساب الديون
✓ إعطاء توصيات
✓ الإجابة على الأسئلة

استخدم أسلوب عربي واضح ومباشر. كن مفيداً ودقيقاً.
المستخدم العام: عبده ماوية (المدير)
العملة: الريال اليمني
`
        },
        { role: 'user', content: text }
      ]
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
    const reply = await handleText(text);
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

      default:
        throw new Error('أمر غير معروف');
    }
  }

  throw new Error('mode غير معروف');
}