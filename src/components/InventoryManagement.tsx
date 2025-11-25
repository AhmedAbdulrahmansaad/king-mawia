import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { 
  Package, Plus, Edit, AlertTriangle, TrendingDown, RefreshCw, 
  Search, Download, Printer, CheckCircle, XCircle 
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getProducts, getSales, createProduct } from '../utils/api';
import { Skeleton } from './ui/skeleton';

interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastRestocked?: string;
  totalSold?: number;
}

interface InventoryManagementProps {
  user: any;
}

export function InventoryManagement({ user }: InventoryManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'فاخر',
    currentStock: 0,
    minStock: 10,
    maxStock: 100,
    unit: 'حبة',
  });

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    setLoading(true);
    try {
      const [productsData, salesData] = await Promise.all([
        getProducts(),
        getSales(),
      ]);

      // Calculate sold quantities
      const soldQuantities: Record<string, number> = {};
      (salesData.sales || []).forEach((sale: any) => {
        const product = sale.productName || '';
        soldQuantities[product] = (soldQuantities[product] || 0) + (sale.quantity || 0);
      });

      // Simulate inventory data (in real app, this would come from database)
      const inventoryProducts: Product[] = [
        { id: '1', name: 'طوفان', category: 'فاخر', currentStock: 45, minStock: 20, maxStock: 100, unit: 'حبة' },
        { id: '2', name: 'طلب خاص', category: 'فاخر', currentStock: 12, minStock: 15, maxStock: 80, unit: 'حبة' },
        { id: '3', name: 'حسين', category: 'ممتاز', currentStock: 67, minStock: 25, maxStock: 120, unit: 'حبة' },
        { id: '4', name: 'طلب عمنا', category: 'ممتاز', currentStock: 89, minStock: 30, maxStock: 150, unit: 'حبة' },
        { id: '5', name: 'القحطاني', category: 'جيد', currentStock: 23, minStock: 20, maxStock: 100, unit: 'حبة' },
        { id: '6', name: 'عبيده', category: 'جيد', currentStock: 5, minStock: 15, maxStock: 80, unit: 'حبة' },
        { id: '7', name: 'رقم واحد', category: 'فاخر', currentStock: 34, minStock: 20, maxStock: 100, unit: 'حبة' },
      ].map(p => ({
        ...p,
        totalSold: soldQuantities[p.name] || 0,
        lastRestocked: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      setProducts(inventoryProducts);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('فشل تحميل المخزون');
    } finally {
      setLoading(false);
    }
  }

  function getStockStatus(product: Product) {
    if (product.currentStock === 0) {
      return { status: 'نفذ', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> };
    } else if (product.currentStock < product.minStock) {
      return { status: 'منخفض', color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle className="h-4 w-4" /> };
    } else if (product.currentStock >= product.maxStock) {
      return { status: 'ممتلئ', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="h-4 w-4" /> };
    } else {
      return { status: 'طبيعي', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-4 w-4" /> };
    }
  }

  function getStockPercentage(product: Product) {
    return Math.min(100, (product.currentStock / product.maxStock) * 100);
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.includes(searchQuery) ||
      product.category.includes(searchQuery)
  );

  const lowStockProducts = products.filter(p => p.currentStock < p.minStock);
  const outOfStockProducts = products.filter(p => p.currentStock === 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8 text-green-600" />
          إدارة المخزون
        </h1>
        <Button onClick={loadInventory} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold text-green-600">{products.length}</p>
                </div>
                <Package className="h-12 w-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مخزون منخفض</p>
                  <p className="text-3xl font-bold text-yellow-600">{lowStockProducts.length}</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">نفذ من المخزون</p>
                  <p className="text-3xl font-bold text-red-600">{outOfStockProducts.length}</p>
                </div>
                <XCircle className="h-12 w-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="ابحث عن منتج..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>المنتجات في المخزون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="mobile-responsive-table">
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>المخزون الحالي</TableHead>
                  <TableHead>الحد الأدنى</TableHead>
                  <TableHead>الحد الأقصى</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>المبيع</TableHead>
                  <TableHead>آخر تموين</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const percentage = getStockPercentage(product);

                  return (
                    <TableRow key={product.id}>
                      <TableCell data-label="المنتج" className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell data-label="الفئة">
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell data-label="المخزون الحالي">
                        <div className="space-y-1">
                          <div className="font-bold">{product.currentStock} {product.unit}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage < 30 ? 'bg-red-500' :
                                percentage < 60 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-label="الحد الأدنى">
                        {product.minStock} {product.unit}
                      </TableCell>
                      <TableCell data-label="الحد الأقصى">
                        {product.maxStock} {product.unit}
                      </TableCell>
                      <TableCell data-label="الحالة">
                        <Badge className={stockStatus.color}>
                          {stockStatus.icon}
                          <span className="mr-1">{stockStatus.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell data-label="المبيع">
                        {product.totalSold || 0} {product.unit}
                      </TableCell>
                      <TableCell data-label="آخر تموين" className="text-xs text-gray-500">
                        {product.lastRestocked
                          ? new Date(product.lastRestocked).toLocaleDateString('ar-YE')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات المخزون المنخفض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      المخزون الحالي: {product.currentStock} {product.unit} 
                      {' '}(الحد الأدنى: {product.minStock})
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    طلب تموين
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
