import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Users, Plus, Search, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getUsers, signUp } from '../utils/api';
import { Skeleton } from './ui/skeleton';

export function UsersPage({ user }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data.users);
    } catch (error: any) {
      toast.error('❌ فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await signUp(formData.email, formData.password, formData.name, formData.role);
      toast.success('✅ تم إنشاء المستخدم بنجاح');
      await loadUsers();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('❌ ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'seller',
    });
  };

  const filteredUsers = users.filter(u =>
    u.name?.includes(searchQuery) ||
    u.email?.includes(searchQuery) ||
    u.role?.includes(searchQuery)
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير عام';
      case 'seller':
        return 'بائع';
      case 'supervisor':
        return 'مشرف';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'seller':
        return 'bg-green-100 text-green-700';
      case 'supervisor':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">غير مصرح</h2>
        <p className="text-gray-600">هذه الصفحة متاحة للمدير العام فقط</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            إدارة المستخدمين
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} مستخدم
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="ml-2 h-5 w-5" />
              إضافة مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>أدخل معلومات المستخدم الجديدة.</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>الاسم الكامل *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم المستخدم"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>البريد الإلكتروني *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>كلمة المرور *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label>الدور الوظيفي *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير عام</SelectItem>
                    <SelectItem value="seller">بائع</SelectItem>
                    <SelectItem value="supervisor">مشرف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'إضافة'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="ابحث عن مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا توجد مستخدمين</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="mobile-responsive-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell data-label="الاسم" className="font-medium">{u.name}</TableCell>
                      <TableCell data-label="البريد الإلكتروني">{u.email}</TableCell>
                      <TableCell data-label="الدور">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${getRoleColor(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </TableCell>
                      <TableCell data-label="تاريخ التسجيل" className="text-sm text-gray-600">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('ar-YE')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}