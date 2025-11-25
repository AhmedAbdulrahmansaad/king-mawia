import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Package, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const DEFAULT_PRODUCTS = [
  { name: 'طوفان', emoji: '🌊', color: 'from-blue-500 to-cyan-500' },
  { name: 'طلب خاص', emoji: '⭐', color: 'from-yellow-500 to-orange-500' },
  { name: 'حسين', emoji: '👑', color: 'from-purple-500 to-pink-500' },
  { name: 'طلب عمنا', emoji: '🎯', color: 'from-red-500 to-rose-500' },
  { name: 'القحطاني', emoji: '💎', color: 'from-indigo-500 to-blue-500' },
  { name: 'عبيده', emoji: '🏆', color: 'from-green-500 to-emerald-500' },
  { name: 'رقم واحد', emoji: '🥇', color: 'from-amber-500 to-yellow-500' },
];

export function ProductsPage({ user }: any) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8 text-purple-600" />
          منتجات القات
        </h1>
        <p className="text-gray-600 mt-1">
          {DEFAULT_PRODUCTS.length} منتج متاح
        </p>
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {DEFAULT_PRODUCTS.map((product, index) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {product.emoji}
                </div>
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-600">جاهز للبيع</span>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-purple-900 mb-2">💡 معلومة</h3>
            <p className="text-purple-800 text-sm">
              هذه المنتجات متاحة لتسجيل المبيعات. يمكنك إضافة منتجات جديدة من خلال المساعد الذكي أو مباشرة عند تسجيل البيع.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
