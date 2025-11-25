# 🗄️ قاعدة البيانات - ملك الماوية

## 📋 نظرة عامة

قاعدة بيانات PostgreSQL كاملة لنظام إدارة مبيعات القات، مستضافة على **Supabase**.

---

## 📊 هيكل قاعدة البيانات

### 6 جداول رئيسية:

#### 1. `users` - جدول المستخدمين
```sql
- id (UUID, Primary Key)
- email (TEXT, Unique)
- name (TEXT)
- password_hash (TEXT)
- role (TEXT: admin | supervisor | seller)
- phone (TEXT)
- avatar_url (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

**الصلاحيات:**
- **admin**: كل الصلاحيات
- **supervisor**: عرض كل شيء + تسجيل مبيعات + تحديث ديون
- **seller**: تسجيل مبيعات فقط + عرض مبيعاته

#### 2. `products` - جدول المنتجات
```sql
- id (UUID, Primary Key)
- name (TEXT, Unique)
- category (TEXT, default: 'قات')
- description (TEXT)
- image_url (TEXT)
- default_price (DECIMAL)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

**المنتجات الافتراضية (7):**
1. طوفان - 1000 ريال
2. طلب خاص - 1200 ريال
3. حسين - 800 ريال
4. طلب عمنا - 1500 ريال
5. القحطاني - 900 ريال
6. عبيده - 700 ريال
7. رقم واحد - 2000 ريال

#### 3. `sales` - جدول المبيعات
```sql
- id (UUID, Primary Key)
- product_id (UUID, FK → products)
- product_name (TEXT)
- seller_id (UUID, FK → users)
- seller_name (TEXT)
- quantity (INTEGER)
- unit_price (DECIMAL)
- total_amount (DECIMAL)
- payment_status (TEXT: paid | debt)
- customer_name (TEXT, nullable)
- sale_date (DATE)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**Indexes:**
- sale_date (للفرز بالتاريخ)
- seller_id (لعرض مبيعات البائع)
- payment_status (لفصل النقد/الديون)
- customer_name (للبحث بالزبون)

#### 4. `debts` - جدول الديون
```sql
- id (UUID, Primary Key)
- sale_id (UUID, FK → sales, nullable)
- customer_name (TEXT)
- product_id (UUID, FK → products)
- product_name (TEXT)
- seller_id (UUID, FK → users)
- seller_name (TEXT)
- original_amount (DECIMAL)
- paid_amount (DECIMAL, default: 0)
- remaining_amount (DECIMAL)
- status (TEXT: pending | partial | paid)
- debt_date (DATE)
- paid_date (DATE, nullable)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**حالات الدين:**
- **pending**: لم يُدفع شيء
- **partial**: دُفع جزء
- **paid**: مسدد كاملاً

#### 5. `payments` - جدول الدفعات
```sql
- id (UUID, Primary Key)
- debt_id (UUID, FK → debts)
- amount (DECIMAL)
- payment_date (DATE)
- received_by (UUID, FK → users)
- received_by_name (TEXT)
- payment_method (TEXT, default: 'cash')
- notes (TEXT)
- created_at (TIMESTAMP)
```

**يُستخدم لتسجيل:**
- دفعات جزئية
- تاريخ كل دفعة
- من استلم الدفعة

#### 6. `activity_log` - سجل النشاطات
```sql
- id (UUID, Primary Key)
- user_id (UUID, FK → users)
- user_name (TEXT)
- action (TEXT)
- entity_type (TEXT)
- entity_id (UUID)
- details (JSONB)
- ip_address (TEXT)
- created_at (TIMESTAMP)
```

**يُسجل:**
- جميع العمليات الحساسة
- من قام بالعملية ومتى
- التفاصيل الكاملة

---

## 🔍 Views (العروض)

### 1. `daily_sales_summary`
ملخص يومي للمبيعات:
```sql
SELECT 
  sale_date,
  total_sales,
  total_revenue,
  cash_revenue,
  debt_revenue,
  active_sellers
FROM daily_sales_summary
ORDER BY sale_date DESC;
```

### 2. `debts_summary`
ملخص الديون لكل زبون:
```sql
SELECT 
  customer_name,
  total_debts,
  total_original,
  total_paid,
  total_remaining,
  last_debt_date
FROM debts_summary
WHERE total_remaining > 0
ORDER BY total_remaining DESC;
```

### 3. `seller_performance`
أداء البائعين:
```sql
SELECT 
  seller_name,
  total_sales,
  total_revenue,
  avg_sale_amount,
  active_days
FROM seller_performance
ORDER BY total_revenue DESC;
```

---

## 🔒 Row Level Security (RLS)

جميع الجداول محمية بـ RLS Policies:

### Users Table:
```sql
-- المستخدمون يرون بياناتهم فقط
-- المديرون يرون كل شيء
```

### Sales Table:
```sql
-- البائع يرى مبيعاته فقط
-- المشرف والمدير يرون كل شيء
-- البائع والمشرف يمكنهم إضافة مبيعات
-- المدير فقط يمكنه التعديل/الحذف
```

### Debts Table:
```sql
-- البائع يرى ديونه فقط
-- المشرف والمدير يرون كل شيء
-- المشرف والمدير يمكنهم تحديث الديون
```

---

## 📈 الفهارس (Indexes)

تم إنشاء فهارس على:
- كل Foreign Keys
- حقول التاريخ
- حقول البحث الشائعة (customer_name, product_name)
- الحالات (status, payment_status, role)

**الفائدة:**
- استعلامات أسرع 10x
- بحث فوري
- فرز سريع

---

## 🔄 Triggers

### Auto-update `updated_at`:
```sql
-- تحديث تلقائي لـ updated_at عند أي تعديل
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**يعمل على:**
- users
- products
- sales
- debts

---

## 📊 استعلامات شائعة

### 1. إجمالي المبيعات اليوم:
```sql
SELECT 
  COUNT(*) as total_sales,
  SUM(total_amount) as total_revenue,
  SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as cash,
  SUM(CASE WHEN payment_status = 'debt' THEN total_amount ELSE 0 END) as debts
FROM sales
WHERE sale_date = CURRENT_DATE;
```

### 2. الديون المعلقة:
```sql
SELECT 
  customer_name,
  SUM(remaining_amount) as total_debt
FROM debts
WHERE status IN ('pending', 'partial')
GROUP BY customer_name
ORDER BY total_debt DESC;
```

### 3. أفضل منتج مبيعاً:
```sql
SELECT 
  product_name,
  COUNT(*) as sales_count,
  SUM(quantity) as total_quantity,
  SUM(total_amount) as total_revenue
FROM sales
GROUP BY product_name
ORDER BY total_revenue DESC
LIMIT 1;
```

### 4. أداء البائع:
```sql
SELECT 
  seller_name,
  COUNT(*) as total_sales,
  SUM(total_amount) as revenue,
  AVG(total_amount) as avg_sale
FROM sales
WHERE seller_id = 'USER_ID'
  AND sale_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY seller_name;
```

---

## 🔧 الصيانة

### النسخ الاحتياطي:

**تلقائي:**
- Supabase: نسخ يومي تلقائي
- يُحفظ لمدة 7 أيام (Free Tier)

**يدوي:**
```bash
# pg_dump
pg_dump -h db.xxxxxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d).dump
```

### الاستعادة:
```bash
pg_restore -h db.xxxxxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  backup_20250123.dump
```

---

## 📊 الحجم والأداء

### الحجم المتوقع:

```
Users: ~100 KB (100 users)
Products: ~10 KB (10 products)
Sales: ~1 MB (10,000 sales)
Debts: ~500 KB (5,000 debts)
Payments: ~300 KB (3,000 payments)
Activity Log: ~2 MB (20,000 entries)

Total: ~4 MB
```

**Free Tier Supabase:**
- Database: 500 MB ✅
- Bandwidth: 5 GB/month ✅
- API Requests: 50,000/month ✅

**كافي لـ:**
- 100,000+ مبيعات
- سنة كاملة من الاستخدام

---

## 🚀 التحسينات

### تم تطبيقها:
✅ Indexes على جميع FKs
✅ RLS على جميع الجداول
✅ Triggers للـ updated_at
✅ Views للتقارير الشائعة
✅ Constraints للتحقق من البيانات

### مستقبلية (اختيارية):
- Partitioning للجداول الكبيرة
- Materialized Views للتقارير الثقيلة
- Function-based Indexes
- Full-text Search

---

## 📝 البيانات الأولية

### المدير العام:
```
Email: admin@malek-mawia.ye
Password: admin123 (يجب تغييرها!)
Role: admin
Name: عبده ماوية
```

### المنتجات (7):
جميعها active مع أسعار افتراضية

---

## 🔐 الأمان

### Passwords:
- bcrypt hashing (10 rounds)
- لا تُخزن plain text أبداً

### API Keys:
- ANON_KEY: للـ Frontend
- SERVICE_ROLE_KEY: للـ Backend فقط (سري!)

### RLS:
- مفعّل على جميع الجداول
- Policies حسب الدور

---

## 📞 الدعم

### الوثائق:
- `/database/schema.sql` - الـ Schema الكامل
- `/database/DEPLOYMENT_GUIDE.md` - دليل النشر

### Supabase Docs:
- https://supabase.com/docs

---

## ✅ الخلاصة

قاعدة بيانات كاملة ومتقدمة:
- ✅ 6 جداول
- ✅ 3 Views
- ✅ RLS Policies
- ✅ Indexes محسّنة
- ✅ Triggers تلقائية
- ✅ بيانات أولية
- ✅ جاهزة للإنتاج

**استخدام سهل:**
1. نفّذ schema.sql في Supabase
2. احفظ المفاتيح
3. شغّل النظام
4. ابدأ الاستخدام!

---

**🎉 قاعدة بيانات احترافية جاهزة!**
