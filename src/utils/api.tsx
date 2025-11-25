import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

// API Cache Management
const API_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for data
const apiCache = new Map<string, { data: any; timestamp: number }>();

// Clear old cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of apiCache.entries()) {
    if (now - value.timestamp > API_CACHE_DURATION) {
      apiCache.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

// Convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

// Convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export async function getAuthToken(): Promise<string> {
  const session = await supabase.auth.getSession();
  return session.data.session?.access_token || publicAnonKey;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  useCache: boolean = true
): Promise<T> {
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-06efd250${endpoint}`;
  const cacheKey = `${options.method || 'GET'}-${url}-${JSON.stringify(options.body || {})}`;

  // Check cache for GET requests
  if (useCache && (!options.method || options.method === 'GET')) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < API_CACHE_DURATION) {
      return cached.data;
    }
  }

  const token = await getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error [${endpoint}]:`, errorText);
    throw new Error(errorText || 'حدث خطأ في الطلب');
  }

  const rawData = await response.json();
  
  // Convert snake_case to camelCase
  const data = toCamelCase(rawData);

  // Cache successful GET requests
  if (useCache && (!options.method || options.method === 'GET')) {
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
  }

  // Invalidate related cache on mutations
  if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
    invalidateCache(endpoint);
  }

  return data;
}

// Invalidate cache for related endpoints
function invalidateCache(endpoint: string) {
  const baseEndpoint = endpoint.split('/')[1]; // Extract base resource (users, products, etc.)
  for (const key of apiCache.keys()) {
    if (key.includes(baseEndpoint)) {
      apiCache.delete(key);
    }
  }
}

// Clear all cache
export function clearApiCache() {
  apiCache.clear();
}

// Specific API functions
export const API = {
  // Users
  getUsers: () => apiRequest<{ users: any[] }>('/users'),
  createUser: (data: any) => apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  toggleUserActive: (id: string) => apiRequest(`/users/${id}/toggle-active`, { method: 'POST' }),

  // Products
  getProducts: () => apiRequest<{ products: any[] }>('/products'),
  createProduct: (data: any) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Sales
  getSales: () => apiRequest<{ sales: any[] }>('/sales'),
  createSale: (data: any) => apiRequest('/sales', { method: 'POST', body: JSON.stringify(data) }),

  // Debts
  getDebts: () => apiRequest<{ debts: any[] }>('/debts'),
  recordPayment: (id: string, amount: number) => apiRequest(`/debts/${id}/payment`, { 
    method: 'POST', 
    body: JSON.stringify({ amount }) 
  }),

  // AI Assistant
  chat: (message: string) => apiRequest('/chat', { 
    method: 'POST', 
    body: JSON.stringify({ message }),
    useCache: false 
  } as any),
  
  analyzeRecord: (imageUrl: string) => apiRequest('/analyze-record', {
    method: 'POST',
    body: JSON.stringify({ imageUrl }),
    useCache: false
  } as any),

  parseVoiceCommand: (text: string) => apiRequest('/parse-voice-command', {
    method: 'POST',
    body: JSON.stringify({ text }),
    useCache: false
  } as any),

  // Backup
  createBackup: (data: any) => apiRequest('/backup', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getBackups: () => apiRequest<{ backups: any[] }>('/backups'),

  // Health
  healthCheck: () => apiRequest('/health', {}, false),
};

// ============= AUTH API =============

export async function signUp(email: string, password: string, name: string, role: string = 'seller') {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  return apiRequest('/users/me');
}

// ============= PRODUCTS API =============

export async function getProducts() {
  return apiRequest('/products');
}

export async function createProduct(name: string, category: string) {
  return apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify({ name, category }),
  });
}

export async function deleteProduct(id: string) {
  return apiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
}

// ============= SALES API =============

export async function getSales() {
  return apiRequest('/sales');
}

export async function createSale(sale: {
  productName: string;
  quantity: number | string;
  price: number | string;
  customerName?: string;
  paymentStatus?: 'paid' | 'pending';
  notes?: string;
}) {
  // Import Arabic number parser
  const { parseArabicQuantity, parseArabicPrice, convertArabicToEnglish } = await import('./arabicNumbers');
  
  // Parse quantity: support Arabic numbers, text, and fractions
  let parsedQuantity: number;
  if (typeof sale.quantity === 'string') {
    // Try parsing as Arabic quantity first
    parsedQuantity = parseArabicQuantity(sale.quantity);
    // If zero, try converting and parsing as float
    if (parsedQuantity === 0) {
      const converted = convertArabicToEnglish(sale.quantity);
      parsedQuantity = parseFloat(converted) || 0;
    }
  } else {
    parsedQuantity = sale.quantity;
  }

  // Parse price: support Arabic numbers and text
  let parsedPrice: number;
  if (typeof sale.price === 'string') {
    // Try parsing as Arabic price first
    parsedPrice = parseArabicPrice(sale.price);
    // If zero, try converting and parsing as float
    if (parsedPrice === 0) {
      const converted = convertArabicToEnglish(sale.price);
      parsedPrice = parseFloat(converted) || 0;
    }
  } else {
    parsedPrice = sale.price;
  }

  return apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify({
      ...sale,
      quantity: parsedQuantity,
      price: parsedPrice,
    }),
  });
}

export async function updateSale(id: string, updates: any) {
  return apiRequest(`/sales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteSale(id: string) {
  return apiRequest(`/sales/${id}`, {
    method: 'DELETE',
  });
}

// ============= DEBTS API =============

export async function getDebts() {
  return apiRequest('/debts');
}

export async function recordPayment(debtId: string, amount: number) {
  if (!debtId || amount <= 0) {
    throw new Error('بيانات غير صحيحة لتسجيل الدفعة');
  }
  
  return apiRequest(`/debts/${debtId}/payment`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function createDebt(debt: {
  customerName: string;
  amount: number;
  notes?: string;
  dueDate?: string;
}) {
  return apiRequest('/debts', {
    method: 'POST',
    body: JSON.stringify(debt),
  });
}

export async function updateDebt(id: string, updates: any) {
  return apiRequest(`/debts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteDebt(id: string) {
  return apiRequest(`/debts/${id}`, {
    method: 'DELETE',
  });
}

// ============= USERS API =============

export async function getUsers() {
  return apiRequest('/users');
}

// ============= STATS API =============

export async function getStats() {
  return apiRequest('/stats');
}

// ============= CUSTOMERS API =============

export async function getCustomers() {
  return apiRequest('/customers');
}

export async function getCustomerStatement(customerName: string) {
  return apiRequest(`/customers/${encodeURIComponent(customerName)}/statement`);
}

// ============= UPLOAD API =============

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = await getAuthToken();
  
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-06efd250/upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('فشل رفع الصورة');
  }

  return response.json();
}