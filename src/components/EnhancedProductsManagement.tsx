import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Package, Plus, Image as ImageIcon, Trash2, Edit, Loader2, Upload } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface Product {
  id: string;
  name: string;
  category: string;
  image?: string;
  description?: string;
  basePrice?: number;
  stock?: number;
  createdAt: string;
}

const DEFAULT_PRODUCTS = [
  { name: 'طوفان', category: 'ممتاز', description: 'قات ممتاز من الدرجة الأولى' },
  { name: 'طلب خاص', category: 'فاخر', description: 'قات فاخر للمناسبات' },
  { name: 'حسين', category: 'جيد', description: 'قات جيد للاستخدام اليومي' },
  { name: 'طلب عمنا', category: 'ممتاز', description: 'قات ممتاز بجودة عالية' },
  { name: 'القحطاني', category: 'فاخر', description: 'من أفضل أنواع القات' },
  { name: 'عبيده', category: 'جيد', description: 'قات جيد بسعر مناسب' },
  { name: 'رقم واحد', category: 'فاخر', description: 'القات الأفضل على الإطلاق' }
];

export function EnhancedProductsManagement({ user }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'ممتاز',
    description: '',
    basePrice: 0,
    stock: 0,
    image: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Initialize with default products
      const initialProducts: Product[] = DEFAULT_PRODUCTS.map((p, i) => ({
        id: `product-${i}`,
        name: p.name,
        category: p.category,
        description: p.description,
        basePrice: p.basePrice,
        stock: Math.floor(Math.random() * 100) + 50,
        createdAt: new Date().toISOString()
      }));
      setProducts(initialProducts);
    } catch (error) {
      toast.error('❌ فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('❌ يرجى اختيار ملف صورة');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('❌ يجب إدخال اسم المنتج');
      return;
    }

    try {
      if (editingProduct) {
        const updatedProduct = {
          ...editingProduct,
          ...formData,
        };
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
        toast.success('✅ تم تحديث المنتج بنجاح');
      } else {
        const newProduct: Product = {
          id: `product-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString()
        };
        setProducts(prev => [newProduct, ...prev]);
        toast.success('✅ تم إضافة المنتج بنجاح');
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('❌ فشل حفظ المنتج');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || '',
      basePrice: product.basePrice || 0,
      stock: product.stock || 0,
      image: product.image || ''
    });
    setImagePreview(product.image || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('✅ تم حذف المنتج');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'ممتاز',
      description: '',
      basePrice: 0,
      stock: 0,
      image: ''
    });
    setImagePreview('');
    setEditingProduct(null);
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
            <Package className="h-8 w-8 text-green-600" />
            إدارة المنتجات
          </h1>
          <p className="text-gray-600 mt-1">
            إدارة أنواع القات مع الصور والأسعار
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="ml-2 h-5 w-5" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات المنتج مع إمكانية رفع صورة
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>صورة المنتج</Label>
                <div className="flex flex-col items-center gap-3">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, image: '' }));
                        }}
                        className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors"
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">اضغط لرفع صورة</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG أو GIF</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: طوفان"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">الفئة *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="ممتاز">ممتاز</option>
                  <option value="فاخر">فاخر</option>
                  <option value="جيد">جيد</option>
                  <option value="عادي">عادي</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف المنتج (اختياري)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">السعر الأساسي</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">المخزون (كيلو)</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  {editingProduct ? 'تحديث' : 'إضافة'}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">إجمالي المنتجات</p>
            <p className="text-3xl font-bold text-green-600">{products.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">فاخر</p>
            <p className="text-3xl font-bold text-blue-600">
              {products.filter(p => p.category === 'فاخر').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">ممتاز</p>
            <p className="text-3xl font-bold text-purple-600">
              {products.filter(p => p.category === 'ممتاز').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">جيد</p>
            <p className="text-3xl font-bold text-orange-600">
              {products.filter(p => p.category === 'جيد').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-xl transition-all overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-200 overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-20 w-20 text-green-600 opacity-30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={
                    product.category === 'فاخر' ? 'bg-purple-600' :
                    product.category === 'ممتاز' ? 'bg-blue-600' :
                    product.category === 'جيد' ? 'bg-green-600' :
                    'bg-gray-600'
                  }>
                    {product.category}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>{product.name}</span>
                  {product.stock !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {product.stock} كيلو
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {product.description && (
                  <p className="text-sm text-gray-600">{product.description}</p>
                )}
                
                {product.basePrice !== undefined && product.basePrice > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">السعر الأساسي</span>
                    <span className="font-bold text-green-600">
                      {product.basePrice.toLocaleString('ar-YE')} ريال
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">لا توجد منتجات مسجلة بعد</p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="ml-2 h-5 w-5" />
            إضافة أول منتج
          </Button>
        </Card>
      )}
    </div>
  );
}