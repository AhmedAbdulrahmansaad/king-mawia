# 🚀 إعداد سريع لـ Vercel - نظام ملك المавية

## ⚡ خطوات سريعة (5 دقائق)

### الخطوة 1: رفع على GitHub ⬆️

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/king-mawia.git
git push -u origin main
```

---

### الخطوة 2: Supabase Setup 🗄️

1. اذهب إلى: https://supabase.com/dashboard
2. اضغط **"New Project"**
3. املأ البيانات وانتظر
4. اذهب إلى **Settings** > **API**
5. انسخ المفاتيح:
   - `URL`
   - `anon public`
   - `service_role`

#### إنشاء Bucket:
1. اذهب إلى **Storage**
2. اضغط **"New bucket"**
3. الاسم: `uploads`
4. Public: **نعم**
5. احفظ

---

### الخطوة 3: OpenAI Setup 🤖 (اختياري)

1. اذهب إلى: https://platform.openai.com/api-keys
2. اضغط **"Create new secret key"**
3. انسخ المفتاح
4. اذهب إلى Billing وأضف رصيد ($5 كافي)

---

### الخطوة 4: Deploy على Vercel 🌐

1. اذهب إلى: https://vercel.com/new
2. اضغط **"Import Git Repository"**
3. اختر `king-mawia`
4. اضغط **"Import"**

#### أضف Environment Variables:

```env
# Frontend
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-xxxxxxxx
```

5. اضغط **"Deploy"**
6. انتظر 2-3 دقائق

---

### الخطوة 5: اختبار النظام ✅

1. افتح الرابط المعطى من Vercel
2. سجّل دخول:
   - البريد: `admin@mawiya.com`
   - الباسورد: `admin123`
3. جرّب الميزات!

---

## 📂 ملفات المشروع الجاهزة

✅ `/api/smart-assistant/index.js` - المساعد الذكي API
✅ `/api/package.json` - اعتماديات الـ API
✅ `/vercel.json` - تكوين Vercel
✅ `/.env.example` - قالب المتغيرات
✅ `/README.md` - الدليل الشامل
✅ `/DEPLOYMENT.md` - دليل النشر المفصل
✅ `/.gitignore` - ملفات التجاهل

---

## 🔧 بنية Vercel API

```
/api/
  └── smart-assistant/
      ├── index.js       # Serverless Function
      └── package.json   # Dependencies
```

### كيف يعمل:
1. Frontend يرسل طلب إلى `/api/smart-assistant`
2. Vercel يشغل الـ Function
3. Function يستدعي OpenAI
4. Function يحفظ في Supabase
5. يرجع النتيجة للـ Frontend

---

## 🎯 API Endpoints

### POST /api/smart-assistant

#### Text Mode:
```json
{
  "mode": "text",
  "text": "كم إجمالي المبيعات؟",
  "userId": "user-id"
}
```

#### Image Mode:
```json
{
  "mode": "image",
  "imageBase64": "data:image/jpeg;base64,...",
  "text": "حلل هذه الصورة",
  "userId": "user-id"
}
```

#### Command Mode:
```json
{
  "mode": "command",
  "command": "dailyReport",
  "userId": "user-id"
}
```

---

## ⚙️ Environment Variables Details

### VITE_SUPABASE_URL
- **الاستخدام:** Frontend فقط
- **المصدر:** Supabase Settings > API
- **مثال:** `https://abcdefgh.supabase.co`

### VITE_SUPABASE_ANON_KEY
- **الاستخدام:** Frontend فقط
- **المصدر:** Supabase Settings > API > anon public
- **ملاحظة:** آمن للمشاركة

### SUPABASE_URL
- **الاستخدام:** Backend API
- **المصدر:** نفس VITE_SUPABASE_URL
- **مثال:** `https://abcdefgh.supabase.co`

### SUPABASE_SERVICE_ROLE_KEY
- **الاستخدام:** Backend API
- **المصدر:** Supabase Settings > API > service_role
- **⚠️ خطر:** لا تشاركه أبداً!

### OPENAI_API_KEY
- **الاستخدام:** Backend API (المساعد الذكي)
- **المصدر:** OpenAI Platform > API Keys
- **مثال:** `sk-proj-xxxxxxxxxxxxxxxx`
- **⚠️ خطر:** لا تشاركه أبداً!

---

## 🔍 Debugging

### إذا لم يعمل المساعد الذكي:

#### 1. تحقق من Logs:
```
Vercel Dashboard > Project > Deployments > Latest > Functions
```

#### 2. تحقق من Environment Variables:
```
Vercel Dashboard > Project > Settings > Environment Variables
```

#### 3. تحقق من OpenAI:
```
https://platform.openai.com/usage
تأكد من وجود رصيد
```

#### 4. تحقق من Console:
```
F12 في المتصفح > Console
ابحث عن أخطاء حمراء
```

---

## 📊 Monitoring

### Vercel Analytics:
```
Dashboard > Analytics
راقب الزوار والأداء
```

### OpenAI Usage:
```
https://platform.openai.com/usage
راقب استهلاك API
```

### Supabase:
```
Dashboard > Database
راقب حجم البيانات
```

---

## 🔄 Updates

### طريقة التحديث:
```bash
git add .
git commit -m "وصف التحديث"
git push

# Vercel سيقوم بـ Deploy تلقائياً!
```

### Rollback (الرجوع):
```
Vercel Dashboard > Deployments
اختر نسخة سابقة > Promote to Production
```

---

## 💰 التكاليف

| الخدمة | المجاني | المدفوع |
|--------|---------|---------|
| Vercel | ✅ 100GB/شهر | $20/شهر Pro |
| Supabase | ✅ 500MB DB | $25/شهر Pro |
| OpenAI | ❌ حسب الاستخدام | $5-50/شهر |

**ملاحظة:** للبداية، كل شيء مجاني إلا OpenAI (اختياري)

---

## ✅ Checklist

قبل الـ Deploy، تأكد:

- [ ] رفعت المشروع على GitHub
- [ ] أنشأت مشروع Supabase
- [ ] أنشأت Bucket اسمه `uploads`
- [ ] حصلت على جميع المفاتيح
- [ ] أضفت Environment Variables في Vercel
- [ ] عملت Deploy
- [ ] اختبرت تسجيل الدخول
- [ ] اختبرت المبيعات
- [ ] (اختياري) اختبرت المساعد الذكي

---

## 🎉 تم!

النظام الآن **جاهز ويعمل!** 🚀

افتح الرابط من Vercel واستمتع!

### الرابط:
```
https://your-project-name.vercel.app
```

---

## 📞 مساعدة إضافية

- 📖 [README.md](./README.md) - الدليل الشامل
- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - دليل النشر المفصل
- 🌐 [Vercel Docs](https://vercel.com/docs)
- 🌐 [Supabase Docs](https://supabase.com/docs)

---

**بالتوفيق!** 🌟
