import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Building2, Plus, MapPin, Phone, User, Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function BranchesManagement({ user }: any) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockBranches: Branch[] = [
        {
          id: 'branch-1',
          name: 'الفرع الرئيسي',
          location: 'صنعاء - شارع الزبيري',
          manager: 'عبده ماوية',
          phone: '777777777',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'branch-2',
          name: 'فرع التحرير',
          location: 'صنعاء - ميدان التحرير',
          manager: 'أحمد محمد',
          phone: '733333333',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      setBranches(mockBranches);
    } catch (error) {
      toast.error('❌ فشل تحميل الفروع');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBranch) {
        // Update existing branch
        const updatedBranch = {
          ...editingBranch,
          ...formData,
        };
        setBranches(prev => prev.map(b => b.id === editingBranch.id ? updatedBranch : b));
        toast.success('✅ تم تحديث الفرع بنجاح');
      } else {
        // Create new branch
        const newBranch: Branch = {
          id: `branch-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString()
        };
        setBranches(prev => [newBranch, ...prev]);
        toast.success('✅ تم إضافة الفرع بنجاح');
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('❌ فشل حفظ البيانات');
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      location: branch.location,
      manager: branch.manager,
      phone: branch.phone,
      status: branch.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      setBranches(prev => prev.filter(b => b.id !== id));
      toast.success('✅ تم حذف الفرع');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      manager: '',
      phone: '',
      status: 'active'
    });
    setEditingBranch(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            إدارة الفروع
          </h1>
          <p className="text-gray-600 mt-1">
            إدارة وتتبع جميع فروع ملك الماوية
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="ml-2 h-5 w-5" />
              إضافة فرع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات الفرع بالتفصيل
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الفرع *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: فرع التحرير"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">الموقع *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="مثال: صنعاء - ميدان التحرير"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">المدير المسؤول *</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                  placeholder="مثال: أحمد محمد"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="7xxxxxxxx"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  {editingBranch ? 'تحديث' : 'إضافة'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الفروع</p>
                <p className="text-3xl font-bold text-blue-600">{branches.length}</p>
              </div>
              <Building2 className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الفروع النشطة</p>
                <p className="text-3xl font-bold text-green-600">
                  {branches.filter(b => b.status === 'active').length}
                </p>
              </div>
              <Building2 className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الفروع غير النشطة</p>
                <p className="text-3xl font-bold text-red-600">
                  {branches.filter(b => b.status === 'inactive').length}
                </p>
              </div>
              <Building2 className="h-12 w-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch, index) => (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {branch.name}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant={branch.status === 'active' ? 'default' : 'secondary'}
                    className={branch.status === 'active' ? 'bg-green-600' : 'bg-gray-500'}
                  >
                    {branch.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{branch.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{branch.manager}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm" dir="ltr">{branch.phone}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(branch)}
                    className="flex-1"
                  >
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(branch.id)}
                    className="flex-1"
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {branches.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">لا توجد فروع مسجلة بعد</p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="ml-2 h-5 w-5" />
            إضافة أول فرع
          </Button>
        </Card>
      )}
    </div>
  );
}
