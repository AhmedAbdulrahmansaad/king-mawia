# 📁 هيكل مشروع King Mawia - دليل كامل

## 🎯 نظرة عامة

المشروع مبني على **Next.js 14** مع **React** و **TypeScript**
Backend: **Supabase** + **Vercel Serverless Functions**
AI: **OpenAI GPT-4o-mini** + **Vision API**

---

## 📂 الهيكل الكامل

```
king-mawia/
│
├── 📁 api/                          # Vercel Serverless Functions
│   ├── 📁 smart-assistant/
│   │   ├── index.js                # المساعد الذكي API
│   │   └── package.json            # اعتماديات الـ API
│   └── ...                         # يمكن إضافة APIs أخرى
│
├── 📁 app/                          # Next.js App Router
│   ├── layout.tsx                  # Layout رئيسي
│   ├── page.tsx                    # الصفحة الرئيسية
│   └── globals.css                 # Styles عامة
│
├── 📁 components/                   # React Components
│   ├── 📄 Dashboard.tsx            # لوحة التحكم الرئيسية
│   ├── 📄 SmartAssistant.tsx       # واجهة المساعد الذكي ✨
│   ├── 📄 SalesPage.tsx            # صفحة المبيعات
│   ├── 📄 DebtsPage.tsx            # صفحة الديون
│   ├── 📄 CustomersStatements.tsx  # كشوفات الزبائن
│   ├── 📄 ProductsReports.tsx      # كشوفات المنتجات
│   ├── 📄 ReportsPage.tsx          # التقارير العامة
│   ├── 📄 AdvancedReports.tsx      # تقارير متقدمة
│   ├── 📄 UsersManagement.tsx      # إدارة المستخدمين
│   ├── 📄 AnimatedLogo.tsx         # الشعار المتحرك
│   ├── 📄 Logo.tsx                 # الشعار الثابت
│   └── 📁 ui/                      # UI Components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ...
│
├── 📁 supabase/functions/          # Supabase Edge Functions
│   └── 📁 server/
│       ├── index.tsx               # الخادم الرئيسي
│       ├── smart-assistant.tsx     # المساعد الذكي (Edge)
│       └── kv_store.tsx            # Key-Value Store
│
├── 📁 utils/                       # Utilities & Helpers
│   ├── api.ts                      # API Functions
│   └── 📁 supabase/
│       └── info.tsx                # معلومات Supabase
│
├── 📁 styles/                      # Styling Files
│   └── globals.css                 # Global Styles + Tailwind
│
├── 📁 public/                      # Static Assets
│   ├── images/
│   └── ...
│
├── 📄 vercel.json                  # تكوين Vercel
├── 📄 package.json                 # Dependencies
├── 📄 tsconfig.json                # TypeScript Config
├── 📄 tailwind.config.js           # Tailwind Config
├── 📄 next.config.js               # Next.js Config
│
├── 📄 .env.example                 # قالب المتغيرات
├── 📄 .gitignore                   # ملفات التجاهل
│
├── 📄 README.md                    # الدليل الشامل
├── 📄 DEPLOYMENT.md                # دليل النشر المفصل
├── 📄 VERCEL_SETUP.md              # إعداد سريع لـ Vercel
└── 📄 PROJECT_STRUCTURE.md         # هذا الملف
```

---

## 🎨 Components Details

### 📊 Dashboard.tsx
**الوظيفة:** لوحة التحكم الرئيسية
**الميزات:**
- قائمة جانبية RTL
- تنقل بين الصفحات
- شعار متحرك
- إدارة المستخدم

**Exports:**
```typescript
export function Dashboard({ user, onLogout }: DashboardProps)
```

---

### ✨ SmartAssistant.tsx
**الوظيفة:** واجهة المساعد الذكي
**الميزات:**
- رفع وتحليل الصور
- محادثة نصية
- أوامر سريعة
- عرض النتائج

**API Endpoint:**
```
POST /api/smart-assistant
```

**Modes:**
- `text` - محادثة نصية
- `image` - تحليل صور
- `command` - أوامر سريعة

---

### 💰 SalesPage.tsx
**الوظيفة:** إدارة المبيعات
**الميزات:**
- إضافة مبيعات جديدة
- عرض جميع المبيعات
- تعديل المبيعات
- حذف (Admin فقط)
- تصدير Excel/PDF
- طباعة

---

### 📋 DebtsPage.tsx
**الوظيفة:** إدارة الديون
**الميزات:**
- عرض جميع الديون
- إضافة دفعة جديدة
- تحديث حالة الدفع
- تصفية حسب الحالة
- كشف حساب لكل زبون

---

### 📊 CustomersStatements.tsx
**الوظيفة:** كشوفات الزبائن
**الميزات:**
- قائمة جميع الزبائن
- كشف حساب مفصل
- إجماليات
- تصدير وطباعة

---

### 📦 ProductsReports.tsx
**الوظيفة:** كشوفات المنتجات
**الميزات:**
- تقارير لكل منتج
- إحصائيات مبيعات
- رسوم بيانية

---

## 🔌 API Structure

### Vercel API (`/api/smart-assistant/`)

**الملف:** `api/smart-assistant/index.js`

**Functions:**
```javascript
uploadImageToSupabase(base64, userId)    // رفع صورة
analyzeImage(imageUrl, instruction)       // تحليل بـ Vision
insertSales(items, userId)                // حفظ مبيعات
addDebt(payload)                          // إضافة دين
markDebtPaid(id)                          // تحديث دين
dailyReport()                             // تقرير يومي
monthlyReport(year, month)                // تقرير شهري
handleText(text)                          // محادثة نصية
```

**Request Format:**
```json
{
  "mode": "text|image|command",
  "text": "...",
  "imageBase64": "data:image/jpeg;base64,...",
  "userId": "...",
  "command": "...",
  "payload": {}
}
```

**Response Format:**
```json
{
  "success": true,
  "reply": "...",
  "extracted": {...},
  "insertedCount": 5,
  "result": {...}
}
```

---

### Supabase Edge Function (`/supabase/functions/server/`)

**الملف:** `supabase/functions/server/index.tsx`

**Routes:**
```typescript
POST /make-server-06efd250/auth/signup      // إنشاء حساب
POST /make-server-06efd250/auth/signin      // تسجيل دخول

GET  /make-server-06efd250/sales            // عرض المبيعات
POST /make-server-06efd250/sales            // إضافة مبيعات
PUT  /make-server-06efd250/sales/:id        // تعديل
DELETE /make-server-06efd250/sales/:id      // حذف (Admin)

GET  /make-server-06efd250/debts            // عرض الديون
POST /make-server-06efd250/debts            // إضافة دين
PUT  /make-server-06efd250/debts/:id        // تعديل
DELETE /make-server-06efd250/debts/:id      // حذف (Admin)
POST /make-server-06efd250/debts/:id/payment // دفعة جديدة

GET  /make-server-06efd250/users            // عرض المستخدمين (Admin)
POST /make-server-06efd250/users            // إضافة مستخدم (Admin)
PUT  /make-server-06efd250/users/:id        // تعديل (Admin)
DELETE /make-server-06efd250/users/:id      // حذف (Admin)

GET  /make-server-06efd250/stats            // إحصائيات
GET  /make-server-06efd250/customers        // قائمة الزبائن
GET  /make-server-06efd250/customers/:name/statement // كشف حساب

POST /make-server-06efd250/assistant        // المساعد الذكي (بديل)
```

---

## 🗄️ Data Structure

### KV Store Keys

```
user:{userId}          // بيانات المستخدم
sale:{saleId}          // بيانات المبيعات
debt:{debtId}          // بيانات الديون
product:{productId}    // بيانات المنتجات
```

### Sale Object:
```typescript
{
  id: string,
  product_name: string,
  quantity: number,
  price: number,
  total_amount: number,
  customer_name: string,
  payment_status: 'paid' | 'pending' | 'partial',
  notes: string,
  sale_date: string,
  createdAt: string,
  createdBy: string,
  seller_name: string
}
```

### Debt Object:
```typescript
{
  id: string,
  sale_id: string,
  customer_name: string,
  product_name: string,
  quantity: number,
  amount: number,
  paid_amount: number,
  remaining_amount: number,
  status: 'pending' | 'partial' | 'paid',
  sale_date: string,
  notes: string,
  createdAt: string,
  createdBy: string,
  seller_name: string
}
```

### User Object:
```typescript
{
  id: string,
  email: string,
  name: string,
  role: 'admin' | 'supervisor' | 'seller',
  createdAt: string
}
```

---

## 🎨 Styling

### Tailwind Configuration

**الألوان الرئيسية:**
- Primary: Green (`green-600`)
- Secondary: Emerald (`emerald-600`)
- Danger: Red (`red-600`)
- Warning: Yellow (`yellow-600`)

**Typography:**
- جميع النصوص بالعربي
- اتجاه RTL
- خطوط نظام التشغيل

---

## 🔐 Authentication Flow

```
1. User visits site
   ↓
2. Check localStorage for token
   ↓ (if no token)
3. Show Login page
   ↓
4. User enters email + password
   ↓
5. POST /auth/signin
   ↓
6. Get session token
   ↓
7. Save to localStorage
   ↓
8. Redirect to Dashboard
```

---

## 🔄 Data Flow

### Sales Creation:
```
1. User fills form
   ↓
2. Submit to API
   ↓
3. Validate data
   ↓
4. Save to KV Store
   ↓
5. If pending: Create debt
   ↓
6. Return success
   ↓
7. Update UI
```

### Smart Assistant (Image):
```
1. User uploads image
   ↓
2. Convert to base64
   ↓
3. Send to /api/smart-assistant
   ↓
4. Upload to Supabase Storage
   ↓
5. Get public URL
   ↓
6. Send to OpenAI Vision
   ↓
7. Extract data (JSON)
   ↓
8. Save sales to database
   ↓
9. Return results
   ↓
10. Display in chat
```

---

## 🚀 Deployment Flow

```
1. Code changes
   ↓
2. git push
   ↓
3. GitHub receives push
   ↓
4. Vercel detects change
   ↓
5. Vercel builds project
   ↓
6. Vercel deploys
   ↓
7. New version live
```

---

## 🔧 Environment Variables

### Frontend (.env.local):
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Backend (Vercel):
```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```

---

## 📦 Dependencies

### Main:
- `next` - Framework
- `react` - UI Library
- `@supabase/supabase-js` - Database
- `lucide-react` - Icons
- `motion` - Animations
- `recharts` - Charts
- `sonner` - Toasts

### API:
- `openai` - AI Assistant
- `@supabase/supabase-js` - Storage

---

## 🔍 Key Features Location

| Feature | File | Line |
|---------|------|------|
| Login | `components/LoginPage.tsx` | - |
| Dashboard | `components/Dashboard.tsx` | - |
| Sales | `components/SalesPage.tsx` | - |
| Debts | `components/DebtsPage.tsx` | - |
| Smart Assistant | `components/SmartAssistant.tsx` | - |
| Reports | `components/ReportsPage.tsx` | - |
| API Auth | `supabase/functions/server/index.tsx` | 76 |
| API Sales | `supabase/functions/server/index.tsx` | 177 |
| API Debts | `supabase/functions/server/index.tsx` | 397 |
| AI Assistant | `api/smart-assistant/index.js` | 1 |

---

## 📝 Notes

### RTL Support:
- جميع الصفحات تدعم RTL
- Tailwind مكوّن للعربية
- النصوص محاذاة لليمين

### Performance:
- Next.js SSR
- Image optimization
- Code splitting
- Lazy loading

### Security:
- API tokens في Environment Variables
- Row Level Security في Supabase
- HTTPS فقط
- CORS محكم

---

## 🎓 Learning Resources

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **OpenAI:** https://platform.openai.com/docs
- **Tailwind:** https://tailwindcss.com/docs

---

## 🆘 Common Issues

### Issue: API not found
**Solution:** تأكد من وجود مجلد `/api` ووجود `vercel.json`

### Issue: Environment variables not working
**Solution:** أعد deploy بعد إضافة المتغيرات

### Issue: Supabase connection failed
**Solution:** تحقق من المفاتيح والـ URL

---

**هذا الملف دليل كامل لفهم بنية المشروع!** 📚
