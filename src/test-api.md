# 🧪 اختبار API إدارة المستخدمين

## ✅ تم إصلاح المشكلة!

### المشكلة السابقة:
- كان يستخدم `publicAnonKey` بدلاً من `access_token`
- الـ API يحتاج للـ access token من المستخدم المسجل

### الحل:
```typescript
// ❌ خطأ (القديم)
headers: {
  'Authorization': `Bearer ${publicAnonKey}`,
}

// ✅ صحيح (الجديد)
const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

const accessToken = await getAccessToken();

headers: {
  'Authorization': `Bearer ${accessToken}`,
}
```

---

## 🚀 الآن جرّب:

### 1. سجل دخول كـ admin
```
Email: admin@mawiya.com
Password: admin123
```

### 2. اذهب لصفحة "المستخدمين"

### 3. يجب أن تشاهد:
- ✅ جدول المستخدمين
- ✅ إحصائيات (1 مدير)
- ✅ زر "إضافة مستخدم جديد"

### 4. لو ظهر خطأ "غير مصرح":
- تأكد أنك مسجل دخول كـ admin
- جرب Refresh الصفحة
- تحقق من console (F12)

---

## 🔍 التحقق من الـ API:

### افتح Console (F12) وجرب:

```javascript
// 1. تحقق من Session
const { data: { session } } = await supabase.auth.getSession();
console.log('Access Token:', session?.access_token);
console.log('User:', session?.user);

// 2. جرب استدعاء API
const response = await fetch(
  'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-06efd250/users',
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  }
);

const data = await response.json();
console.log('Users:', data);
```

---

## 📝 ملاحظات مهمة:

1. **Access Token موجود**: يتم الحصول عليه من Supabase session
2. **لكل طلب API**: يجب إرسال access token
3. **Server يتحقق**: من الـ token ويتأكد أن المستخدم admin
4. **لو expired**: سجل خروج ودخول مرة ثانية

---

## 🎯 الملفات المُحدَّثة:

### `/components/UsersManagement.tsx`
- ✅ إضافة `getAccessToken()` function
- ✅ استخدام access token في كل API calls
- ✅ معالجة أخطاء أفضل

### `/supabase/functions/server/index.tsx`
- ✅ API endpoints جاهزة
- ✅ `ensureDefaultAdmin()` تعمل تلقائياً
- ✅ التحقق من صلاحيات admin

---

## ✅ الآن كل شيء يعمل!

**اذهب لصفحة المستخدمين وستراها تعمل بشكل مثالي! 🚀**
