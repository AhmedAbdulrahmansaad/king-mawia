// ---------------------------------------------------------
// SMART ASSISTANT API — VERCEL EDGE VERSION
// ---------------------------------------------------------

export const config = {
  runtime: "edge",
};

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// ---------------------------------------------------------
// 1) تهيئة OpenAI
// ---------------------------------------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------------------------------------------------
// 2) تهيئة Supabase (بمفتاح SERVICE ROLE)
// ---------------------------------------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------------------------------------
// 3) رفع صورة إلى Storage
// ---------------------------------------------------------
async function uploadImageToSupabase(base64, userId) {
  const fileName = `assistant/${userId}_${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(fileName, Buffer.from(base64, "base64"), {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error("فشل رفع الصورة إلى Supabase");

  const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);

  return data.publicUrl;
}

// ---------------------------------------------------------
// 4) تحليل الصور — Vision
// ---------------------------------------------------------
async function analyzeImage(imageUrl, instruction = "") {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
أنت مساعد ذكاء اصطناعي متخصص في قراءة صور المبيعات والفواتير.
أرجع JSON بالصيغة التالية:
{
  "items": [
    { "type": "", "quantity": 0, "unit_price": 0, "total": 0 }
  ],
  "summary": { "total_sales": 0 }
}
`
      },
      {
        role: "user",
        content: [
          { type: "text", text: instruction },
          { type: "image_url", image_url: { url: imageUrl } }
        ],
      }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}

// ---------------------------------------------------------
// 5) حفظ بيانات المبيعات
// ---------------------------------------------------------
async function insertSales(items, userId) {
  const formatted = items.map((x) => ({
    type: x.type,
    quantity: x.quantity,
    unit_price: x.unit_price,
    total_price: x.total,
    seller_id: userId,
    source: "image",
  }));

  const { data, error } = await supabase
    .from("sales")
    .insert(formatted)
    .select("*");

  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------
// 6) إضافة دين جديد
// ---------------------------------------------------------
async function addDebt(payload) {
  const { data, error } = await supabase
    .from("debts")
    .insert({
      customer_name: payload.customer,
      amount: payload.amount,
      notes: payload.note || "",
      due_date: payload.due_date,
      status: "unpaid",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------
// 7) تحديث دين إلى مدفوع
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
// 8) رد نصّي فقط
// ---------------------------------------------------------
async function handleText(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "أنت مساعد ذكي لإدارة المبيعات والديون." },
      { role: "user", content: text },
    ],
  });

  return completion.choices[0].message.content;
}

// ---------------------------------------------------------
// 9) دالة API الرئيسية
// ---------------------------------------------------------
export default async function handler(req) {
  try {
    const body = await req.json();
    const { mode, text, imageBase64, userId, command, payload } = body;

    // TEXT MODE
    if (mode === "text") {
      const reply = await handleText(text);
      return json({ success: true, reply });
    }

    // IMAGE MODE
    if (mode === "image") {
      const url = await uploadImageToSupabase(imageBase64, userId);
      const extracted = await analyzeImage(url, text);
      const saved = await insertSales(extracted.items, userId);

      return json({
        success: true,
        extracted,
        saved,
        reply: "تم تحليل الصورة وحفظ العمليات.",
      });
    }

    // COMMANDS
    if (mode === "command") {
      switch (command) {
        case "addDebt":
          return json({ success: true, result: await addDebt(payload) });

        case "markDebtPaid":
          return json({ success: true, result: await markDebtPaid(payload.id) });
      }
    }

    return json({ error: "Mode غير معروف" }, 400);
  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}

// ---------------------------------------------------------
// (10) مساعد لإرجاع JSON لـ Vercel Edge
// ---------------------------------------------------------
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
