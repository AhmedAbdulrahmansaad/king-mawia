import { apiRequest } from './api';

const DEFAULT_PRODUCTS = [
  { name: 'طوفان', category: 'قات' },
  { name: 'طلب خاص', category: 'قات' },
  { name: 'حسين', category: 'قات' },
  { name: 'طلب عمنا', category: 'قات' },
  { name: 'القحطاني', category: 'قات' },
  { name: 'عبيده', category: 'قات' },
  { name: 'رقم واحد', category: 'قات' },
];

export async function initializeDefaultProducts() {
  try {
    // Check if products already exist
    const { products } = await apiRequest('/products');
    
    if (!products || products.length === 0) {
      // Create default products
      for (const product of DEFAULT_PRODUCTS) {
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(product),
        });
      }
      console.log('Default products initialized');
    }
  } catch (error) {
    console.error('Failed to initialize default products:', error);
  }
}
