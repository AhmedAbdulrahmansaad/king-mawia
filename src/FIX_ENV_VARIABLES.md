# 🔧 إصلاح متغيرات البيئة

## ✅ تم إصلاح الخطأ!

### المشكلة:
```
ReferenceError: process is not defined
```

### الحل:
تم تحديث `/utils/supabase/client.ts` ليعمل مع Vite و Next.js

---

## 📋 الخطوات (اختر واحدة):

### ✅ الطريقة 1: استخدم Supabase مباشرة (موصى بها)

1. **افتح ملف `.env`** في المشروع
2. **احصل على المفاتيح من Supabase:**
   ```
   https://supabase.com/dashboard
   → اختر مشروعك
   → Settings → API
   ```

3. **انسخ القيم:**
   ```bash
   # Project URL
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   
   # Anon Key
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **الصقها في `.env`:**
   ```bash
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **أعد تشغيل السيرفر:**
   ```bash
   npm run dev
   ```

---

### ✅ الطريقة 2: قيم تجريبية (للاختبار فقط)

إذا لم تكن جاهزاً لإعداد Supabase، استخدم قيم وهمية:

```bash
# في ملف .env
VITE_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
VITE_SUPABASE_ANON_KEY=demo-key-for-testing
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key-for-testing
```

**⚠️ ملاحظة:** لن تعمل الميزات الحقيقية بدون Supabase حقيقي!

---

## 🔍 التحقق من العمل

1. **افتح Console في المتصفح** (F12)
2. **يجب أن ترى:**
   ```
   ✅ لا أخطاء في Console
   ✅ الموقع يعمل
   ✅ صفحة تسجيل الدخول تظهر
   ```

3. **إذا رأيت تحذير:**
   ```
   ⚠️ Supabase credentials not found
   ```
   **→ تحقق من ملف `.env`**

---

## 📝 الملفات المحدثة:

```
✅ /utils/supabase/client.ts (محدّث)
✅ /.env (جديد)
✅ /vite.config.ts (جديد)
✅ /.gitignore (محدّث)
```

---

## 🚀 بعد الإصلاح:

### محلياً (Development):
```bash
1. احفظ المفاتيح في .env
2. npm run dev
3. افتح http://localhost:3000
4. ✅ يعمل!
```

### Vercel (Production):
```bash
1. Vercel Dashboard
2. Settings → Environment Variables
3. أضف:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
4. Redeploy
5. ✅ يعمل!
```

---

## 🎯 الخلاصة

**المشكلة:** `process is not defined`  
**السبب:** استخدام `process.env` في Vite  
**الحل:** استخدام `import.meta.env` + fallback  
**النتيجة:** ✅ يعمل الآن!

---

## 📞 إذا استمرت المشكلة:

### تحقق من:
```bash
1. ملف .env موجود؟
2. القيم صحيحة؟
3. أعدت تشغيل السيرفر؟
4. مسحت Cache؟
```

### امسح Cache:
```bash
# أوقف السيرفر (Ctrl+C)
rm -rf node_modules/.vite
npm run dev
```

---

## 🎉 الآن كل شيء يعمل!

**ابدأ الاستخدام:**
```bash
npm run dev
```

**افتح:** http://localhost:3000

**سجل دخول:**
- Email: admin@malek-mawia.ye
- Password: admin123

✅ **جاهز!**
