# 🔧 كيفية إضافة مفاتيح Supabase

<div dir="rtl">

## ✅ النظام يعمل الآن في "وضع التجريبي"

سترى هذه الرسائل في Console:
```
⚠️ Using demo Supabase URL
⚠️ Using demo Supabase key
⚠️ DEMO MODE: Using temporary credentials
```

**هذا طبيعي!** النظام يعمل لكن بدون قاعدة بيانات حقيقية.

---

## 🎯 لربط قاعدة البيانات الحقيقية:

### الخطوة 1: احصل على المفاتيح

```bash
1. افتح: https://supabase.com/dashboard
2. اختر مشروعك (أو أنشئ واحد جديد)
3. اذهب إلى: Settings → API
4. انسخ هذين:
   ✅ Project URL
   ✅ anon public key
```

يجب أن تبدو هكذا:
```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

---

### الخطوة 2: افتح ملف `.env`

في جذر المشروع، افتح ملف `.env`

---

### الخطوة 3: استبدل القيم

**قبل:**
```bash
VITE_SUPABASE_URL=https://demo-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8i...
```

**بعد (ضع مفاتيحك):**
```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... [مفتاحك الحقيقي]
```

---

### الخطوة 4: أعد تشغيل السيرفر

```bash
# أوقف السيرفر (Ctrl+C)
# ثم شغله مجدداً:
npm run dev
```

---

### الخطوة 5: تحقق من النجاح

افتح Console (F12) يجب أن ترى:
```
✅ 🔌 Supabase Client initialized
✅ 📍 URL: https://your-project.supabase.co
✅ 🔑 Key: ✓ Present
```

**بدون** رسائل التحذير!

---

## 🎉 تم! الآن مربوط بقاعدة البيانات!

---

## ❓ الأسئلة الشائعة

### س: أين أجد ملف `.env`؟
**ج:** في جذر المشروع (نفس مستوى `package.json`)

### س: هل يجب إعادة التشغيل بعد التعديل؟
**ج:** نعم! دائماً أعد تشغيل السيرفر بعد تعديل `.env`

### س: ماذا لو لم أجد الملف؟
**ج:** أنشئه يدوياً:
```bash
# في جذر المشروع
touch .env
```

ثم أضف المحتوى:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### س: هل يمكنني استخدام النظام بدون Supabase؟
**ج:** نعم، لكن:
- ❌ لن تُحفظ البيانات
- ❌ لن يعمل تسجيل الدخول
- ✅ ستشاهد الواجهة فقط

---

## 📋 Checklist

```
☐ فتحت Supabase Dashboard
☐ نسخت Project URL
☐ نسخت anon key
☐ فتحت ملف .env
☐ لصقت القيم
☐ حفظت الملف
☐ أوقفت السيرفر (Ctrl+C)
☐ شغلت السيرفر (npm run dev)
☐ فتحت Console (F12)
☐ تحققت من عدم وجود تحذيرات
☐ ✅ يعمل!
```

---

## 🔥 مثال كامل لملف `.env`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmno.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQyNTQyNDAwLCJleHAiOjE5NTgxMTg0MDB9.abc123xyz456

# Optional: For Next.js compatibility
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQyNTQyNDAwLCJleHAiOjE5NTgxMTg0MDB9.abc123xyz456
```

**⚠️ هذا مثال فقط! استخدم مفاتيحك الحقيقية!**

---

## 💡 نصيحة

احفظ مفاتيحك في مكان آمن! ستحتاجها عند النشر على Vercel أيضاً.

---

## 🎊 الآن جاهز للاستخدام الكامل!

</div>
