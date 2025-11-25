/**
 * ---------------------------------------------------------
 *  SMART ASSISTANT API — VERCEL SERVERLESS FUNCTION
 * ---------------------------------------------------------
 *
 * مسار API الصحيح لـ Vercel:
 * ✓ الملف: /api/smart-assistant.js
 * ✓ الاستدعاء: /api/smart-assistant
 * ✓ Method: POST
 * ✓ Content-Type: application/json
 *
 * الميزات:
 * ✓ المساعد الذكي
 * ✓ رفع صور إلى Supabase Storage
 * ✓ تحليل الصور (Vision)
 * ✓ استخراج بيانات المبيعات
 * ✓ إدخال البيانات في Supabase
 * ✓ أوامر الديون
 * ✓ أوامر التقارير (يومي + شهري)
 * ✓ رد نصّي
 *
 * ---------------------------------------------------------
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ---------------------------------------------------------
// (1) تهيئة OpenAI
// ---------------------------------------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------------------------------------------------
// (2) تهيئة Supabase SERVICE ROLE
// ---------------------------------------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------------------------------------
// (3) رفع صورة إلى Supabase Storage
// ---------------------------------------------------------
async function uploadImageToSupabase(base64String, userId) {
  // Extract base64 data (remove data:image/... prefix if exists)
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const fileName = `assistant/${userId}_${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(fileName, Buffer.from(base64Data, "base64"), {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`فشل رفع الصورة إلى التخزين: ${error.message}`);
  }

  const { data: urlInfo } = supabase.storage
    .from("uploads")
    .getPublicUrl(fileName);

  return urlInfo.publicUrl;
}

// ---------------------------------------------------------
// (4) تحليل صورة باستخدام OpenAI Vision
// ---------------------------------------------------------
async function analyzeImage(imageUrl, instruction = "") {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
أنت مساعد ذكي متخصص في قراءة الصور التي تحتوي على مبيعات وعمليات مالية.
اخرج JSON منظم:
{
  "items": [
    { "type": "", "quantity": 0, "unit_price": 0, "total": 0, "customerName": "", "note": "" }
  ],
  "summary": { "total_sales": 0, "by_type": {} },
  "notes": ""
}
`
      },
      {
        role: "user",
        content: [
          { type: "text", text: instruction || "حلل هذه الصورة واستخرج بيانات المبيعات" },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}

// ---------------------------------------------------------
// (5) إدخال بيانات المبيعات داخل جدول sales
// ---------------------------------------------------------
async function insertSales(items, userId) {
  const formatted = items.map((x) => ({
    type: x.type,
    quantity: x.quantity,
    unit_price: x.unit_price,
    total_price: x.total,
    customer_name: x.customerName || null,
    notes: x.note || null,
    seller_id: userId || null,
    source: "image",
  }));

  const { data, error } = await supabase
    .from("sales")
    .insert(formatted)
    .select("*");

  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error(`فشل حفظ البيانات: ${error.message}`);
  }
  return data;
}

// ---------------------------------------------------------
// (6) إضافة دين جديد
// ---------------------------------------------------------
async function addDebt({ customer, amount, note, due_date }) {
  const { data, error } = await supabase
    .from("debts")
    .insert({
      customer_name: customer,
      amount,
      notes: note || null,
      status: "unpaid",
      due_date,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------
// (7) تحديث دين إلى "مدفوع"
// ---------------------------------------------------------
async function markDebtPaid(id) {
  const { data, error } = await supabase
    .from("debts")
    .update({ status: "paid" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------
// (8) تقرير يومي
// ---------------------------------------------------------
async function dailyReport() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .gte("created_at", `${today} 00:00:00`)
    .lte("created_at", `${today} 23:59:59`);

  if (error) throw new Error(error.message);

  const total = data.reduce((sum, i) => sum + i.total_price, 0);
  return { total, items: data };
}

// ---------------------------------------------------------
// (9) تقرير شهري
// ---------------------------------------------------------
async function monthlyReport(year, month) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = new Date(year, month, 0).getDate();
  const last = `${year}-${String(month).padStart(2, "0")}-${end}`;

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .gte("created_at", `${start} 00:00:00`)
    .lte("created_at", `${last} 23:59:59`);

  if (error) throw new Error(error.message);

  const total = data.reduce((sum, i) => sum + i.total_price, 0);
  return { total, items: data };
}

// ---------------------------------------------------------
// (10) رد نصي بدون صور
// ---------------------------------------------------------
async function handleText(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `أنت مساعد ذكي داخل نظام مبيعات وديون باسم "ملك الماوية" لتجارة القات.`
      },
      { role: "user", content: text }
    ]
  });

  return completion.choices[0].message.content;
}

// ---------------------------------------------------------
// (11) API الرئيسي — يستقبل الطلبات من الواجهة
// ---------------------------------------------------------
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "فقط POST مسموح" });
  }

  try {
    console.log('Smart Assistant API called');
    console.log('Request body:', JSON.stringify(req.body).substring(0, 200));

    const { mode, text, imageBase64, userId, command, payload } = req.body;

    if (!mode) {
      return res.status(400).json({ error: "يجب تحديد mode" });
    }

    // -------- TEXT --------
    if (mode === "text") {
      console.log('Processing text mode');
      const reply = await handleText(text);
      return res.status(200).json({ success: true, reply });
    }

    // -------- IMAGE --------
    if (mode === "image") {
      console.log('Processing image mode');
      
      if (!imageBase64) {
        return res.status(400).json({ error: "يجب إرفاق صورة" });
      }

      console.log('Uploading image to Supabase...');
      const url = await uploadImageToSupabase(imageBase64, userId);
      console.log('Image uploaded:', url);
      
      console.log('Analyzing image with OpenAI...');
      const extracted = await analyzeImage(url, text);
      console.log('Image analyzed:', extracted);
      
      console.log('Inserting sales data...');
      const saved = await insertSales(extracted.items, userId);
      console.log('Sales data inserted:', saved.length);

      return res.status(200).json({
        success: true,
        extracted,
        insertedCount: saved.length,
        reply: "تم تحليل الصورة وحفظ العمليات."
      });
    }

    // -------- COMMAND MODE --------
    if (mode === "command") {
      console.log('Processing command:', command);
      
      switch (command) {
        case "addDebt":
          return res.status(200).json({ success: true, result: await addDebt(payload) });

        case "markDebtPaid":
          return res.status(200).json({ success: true, result: await markDebtPaid(payload.id) });

        case "dailyReport":
          return res.status(200).json({ success: true, result: await dailyReport() });

        case "monthlyReport":
          return res.status(200).json({ success: true, result: await monthlyReport(payload.year, payload.month) });

        default:
          return res.status(400).json({ error: "أمر غير معروف" });
      }
    }

    return res.status(400).json({ error: "Mode غير معروف: " + mode });

  } catch (err) {
    console.error('Smart Assistant API error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'حدث خطأ غير متوقع'
    });
  }
}
