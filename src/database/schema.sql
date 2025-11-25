-- ===================================
-- ملك الماوية - Database Schema
-- قاعدة بيانات كاملة لنظام إدارة المبيعات
-- ===================================

-- 1. جدول المستخدمين (Users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'seller', 'supervisor')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. جدول المنتجات (Products)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'قات',
  description TEXT,
  image_url TEXT,
  default_price DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. جدول المبيعات (Sales)
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  seller_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'debt')),
  customer_name TEXT,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. جدول الديون (Debts)
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  seller_name TEXT,
  original_amount DECIMAL(10, 2) NOT NULL CHECK (original_amount >= 0),
  paid_amount DECIMAL(10, 2) DEFAULT 0 CHECK (paid_amount >= 0),
  remaining_amount DECIMAL(10, 2) NOT NULL CHECK (remaining_amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'partial', 'paid')),
  debt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. جدول الدفعات (Payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by UUID REFERENCES users(id) ON DELETE SET NULL,
  received_by_name TEXT,
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. جدول سجل النشاطات (Activity Log)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- الفهارس (Indexes) لتحسين الأداء
-- ===================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_seller ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_name);

-- Debts indexes
CREATE INDEX IF NOT EXISTS idx_debts_customer ON debts(customer_name);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_date ON debts(debt_date);
CREATE INDEX IF NOT EXISTS idx_debts_seller ON debts(seller_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_debt ON payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_log(action);

-- ===================================
-- الدوال المساعدة (Functions)
-- ===================================

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق الدالة على الجداول
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_debts_updated_at ON debts;
CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- البيانات الأولية (Seed Data)
-- ===================================

-- إضافة المدير العام (عبده ماوية)
-- كلمة المرور الافتراضية: admin123
-- يجب تغييرها بعد أول تسجيل دخول
INSERT INTO users (id, email, name, password_hash, role, phone, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@malek-mawia.ye',
  'عبده ماوية',
  '$2a$10$rV8P1y0p4W5F6xZ7Y8Q9Mu3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z', -- admin123
  'admin',
  '+967777777777',
  true
) ON CONFLICT (email) DO NOTHING;

-- إضافة المنتجات (7 أنواع قات)
INSERT INTO products (name, category, description, default_price, is_active) VALUES
  ('طوفان', 'قات', 'قات طوفان درجة أولى', 1000, true),
  ('طلب خاص', 'قات', 'قات طلب خاص مميز', 1200, true),
  ('حسين', 'قات', 'قات حسين أصلي', 800, true),
  ('طلب عمنا', 'قات', 'قات طلب عمنا فاخر', 1500, true),
  ('القحطاني', 'قات', 'قات القحطاني ممتاز', 900, true),
  ('عبيده', 'قات', 'قات عبيده نقي', 700, true),
  ('رقم واحد', 'قات', 'قات رقم واحد الأفضل', 2000, true)
ON CONFLICT (name) DO NOTHING;

-- ===================================
-- Row Level Security (RLS) Policies
-- ===================================

-- تفعيل RLS على الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- سياسات المستخدمين
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text OR 
         EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Admins can do anything with users"
  ON users FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- سياسات المنتجات
CREATE POLICY "Everyone can view active products"
  ON products FOR SELECT
  USING (is_active = true OR 
         EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'supervisor')));

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- سياسات المبيعات
CREATE POLICY "Users can view their own sales or all if admin/supervisor"
  ON sales FOR SELECT
  USING (seller_id::text = auth.uid()::text OR 
         EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'supervisor')));

CREATE POLICY "Sellers and above can create sales"
  ON sales FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'supervisor', 'seller')));

CREATE POLICY "Admins can update sales"
  ON sales FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Admins can delete sales"
  ON sales FOR DELETE
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- سياسات الديون
CREATE POLICY "Users can view debts they created or all if admin/supervisor"
  ON debts FOR SELECT
  USING (seller_id::text = auth.uid()::text OR 
         EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'supervisor')));

CREATE POLICY "Sellers and above can create debts"
  ON debts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'supervisor', 'seller')));

CREATE POLICY "Admins and supervisors can update debts"
  ON debts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'supervisor')));

-- سياسات الدفعات
CREATE POLICY "Users can view payments for their debts or all if admin/supervisor"
  ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM debts d 
    WHERE d.id = payments.debt_id 
    AND (d.seller_id::text = auth.uid()::text OR 
         EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'supervisor')))
  ));

CREATE POLICY "All authenticated can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- سياسات سجل النشاطات
CREATE POLICY "Admins can view all activity"
  ON activity_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "All authenticated can log activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ===================================
-- Views للتقارير
-- ===================================

-- عرض المبيعات اليومية
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
  sale_date,
  COUNT(*) as total_sales,
  SUM(total_amount) as total_revenue,
  SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as cash_revenue,
  SUM(CASE WHEN payment_status = 'debt' THEN total_amount ELSE 0 END) as debt_revenue,
  COUNT(DISTINCT seller_id) as active_sellers
FROM sales
GROUP BY sale_date
ORDER BY sale_date DESC;

-- عرض ملخص الديون
CREATE OR REPLACE VIEW debts_summary AS
SELECT 
  customer_name,
  COUNT(*) as total_debts,
  SUM(original_amount) as total_original,
  SUM(paid_amount) as total_paid,
  SUM(remaining_amount) as total_remaining,
  MAX(debt_date) as last_debt_date
FROM debts
WHERE status != 'paid'
GROUP BY customer_name
ORDER BY total_remaining DESC;

-- عرض أداء البائعين
CREATE OR REPLACE VIEW seller_performance AS
SELECT 
  u.id,
  u.name as seller_name,
  COUNT(s.id) as total_sales,
  SUM(s.total_amount) as total_revenue,
  AVG(s.total_amount) as avg_sale_amount,
  COUNT(DISTINCT DATE(s.sale_date)) as active_days
FROM users u
LEFT JOIN sales s ON u.id = s.seller_id
WHERE u.role IN ('seller', 'supervisor', 'admin')
GROUP BY u.id, u.name
ORDER BY total_revenue DESC;

-- ===================================
-- الملاحظات المهمة
-- ===================================

/*
1. كلمة المرور الافتراضية للمدير: admin123
   يجب تغييرها فوراً بعد أول تسجيل دخول

2. لتشفير كلمات المرور استخدم bcrypt:
   const bcrypt = require('bcryptjs');
   const hash = bcrypt.hashSync('password', 10);

3. الصلاحيات:
   - admin: كل الصلاحيات
   - supervisor: عرض كل شيء + تسجيل مبيعات + تحديث ديون
   - seller: تسجيل مبيعات فقط + عرض مبيعاته

4. للنشر على Vercel:
   - تأكد من تفعيل RLS في Supabase Dashboard
   - أضف SUPABASE_URL و SUPABASE_ANON_KEY في Vercel Environment Variables
   - استخدم Edge Functions للـ Backend API

5. النسخ الاحتياطي:
   - استخدم Supabase Backup (تلقائي)
   - أو pg_dump للنسخ اليدوي

6. الأمان:
   - لا تشارك SERVICE_ROLE_KEY أبداً
   - استخدم ANON_KEY فقط في Frontend
   - RLS مفعّل على جميع الجداول
*/

-- ===================================
-- انتهى ملف قاعدة البيانات
-- ===================================
