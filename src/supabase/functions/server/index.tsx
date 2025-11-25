import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { processAssistantRequest } from './smart-assistant.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize default admin user if not exists
async function ensureDefaultAdmin() {
  try {
    const adminEmail = 'admin@mawiya.com';
    const adminPassword = 'admin123';
    
    // Check if admin exists in KV
    const users = await kv.getByPrefix('user:');
    const adminExists = users.some((u: any) => u.email === adminEmail);
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      
      // Try to create admin
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: 'عبده ماوية', role: 'admin' },
      });

      if (!error && data.user) {
        await kv.set(`user:${data.user.id}`, {
          id: data.user.id,
          email: adminEmail,
          name: 'عبده ماوية',
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
        console.log('Default admin user created successfully!');
      }
    } else {
      console.log('Default admin user already exists.');
    }
  } catch (error) {
    console.error('Error ensuring default admin:', error);
  }
}

// Initialize on startup
ensureDefaultAdmin();

// Helper function to verify auth
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}

// ============= AUTH ROUTES =============

app.post('/make-server-06efd250/auth/signup', async (c) => {
  try {
    const { email, password, name, role = 'seller' } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (error) throw error;

    // Save user data to KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, user: data.user });
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: error.message }, 400);
  }
});

app.post('/make-server-06efd250/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return c.json({ success: true, session: data.session });
  } catch (error: any) {
    console.error('Signin error:', error);
    return c.json({ error: error.message }, 400);
  }
});

// ============= PRODUCTS ROUTES =============

app.get('/make-server-06efd250/products', async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products: products || [] });
  } catch (error: any) {
    console.error('Get products error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-06efd250/products', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { name, category } = await c.req.json();
    const id = `product:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const product = {
      id,
      name,
      category,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    await kv.set(id, product);

    return c.json({ success: true, product });
  } catch (error: any) {
    console.error('Create product error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-06efd250/products/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    await kv.del(id);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= SALES ROUTES =============

app.get('/make-server-06efd250/sales', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const sales = await kv.getByPrefix('sale:');
    
    // Transform data to match frontend expectations
    const transformedSales = (sales || []).map((sale: any) => ({
      id: sale.id,
      productName: sale.product_name || sale.productName || '',
      quantity: sale.quantity || 0,
      price: sale.price || 0,
      total: sale.total_amount || sale.total || 0,
      customerName: sale.customer_name || sale.customerName || '',
      paymentStatus: sale.payment_status || sale.paymentStatus || 'paid',
      notes: sale.notes || '',
      saleDate: sale.sale_date || sale.saleDate || '',
      createdAt: sale.createdAt || '',
      createdBy: sale.createdBy || '',
      createdByName: sale.seller_name || sale.createdByName || '',
    }));
    
    // Sort by date descending
    const sortedSales = transformedSales.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ sales: sortedSales });
  } catch (error: any) {
    console.error('Get sales error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-06efd250/sales', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { productName, quantity, price, customerName, paymentStatus, notes } = await c.req.json();
    const id = `sale:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const total = Number(quantity) * Number(price);

    const sale = {
      id,
      product_name: productName,
      quantity: Number(quantity),
      price: Number(price),
      total_amount: total,
      customer_name: customerName || '',
      payment_status: paymentStatus || 'paid',
      notes: notes || '',
      sale_date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      seller_name: user.user_metadata?.name || user.email,
    };

    await kv.set(id, sale);

    // If payment status is pending (debt), create a debt record
    if (paymentStatus === 'pending' && customerName) {
      const debtId = `debt:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const debt = {
        id: debtId,
        sale_id: id,
        customer_name: customerName,
        product_name: productName,
        quantity: Number(quantity),
        amount: total,
        paid_amount: 0,
        remaining_amount: total,
        status: 'pending',
        sale_date: new Date().toISOString().split('T')[0],
        notes: notes || '',
        createdAt: new Date().toISOString(),
        createdBy: user.id,
        seller_name: user.user_metadata?.name || user.email,
      };
      
      await kv.set(debtId, debt);
    }

    return c.json({ success: true, sale });
  } catch (error: any) {
    console.error('Create sale error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-06efd250/sales/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    let id = c.req.param('id');
    // Ensure ID has the correct prefix
    if (!id.startsWith('sale:')) {
      id = `sale:${id}`;
    }
    
    const updates = await c.req.json();

    // Get existing sale
    const existingSale = await kv.get(id);
    if (!existingSale) {
      console.error('Sale not found:', id);
      return c.json({ error: 'Sale not found' }, 404);
    }

    // Calculate new total if price or quantity changed
    const newQuantity = updates.quantity !== undefined ? Number(updates.quantity) : existingSale.quantity;
    const newPrice = updates.price !== undefined ? Number(updates.price) : existingSale.price;
    const newTotal = newQuantity * newPrice;

    const updatedSale = {
      ...existingSale,
      product_name: updates.productName || existingSale.product_name,
      quantity: newQuantity,
      price: newPrice,
      total_amount: newTotal,
      customer_name: updates.customerName !== undefined ? updates.customerName : existingSale.customer_name,
      payment_status: updates.paymentStatus || existingSale.payment_status,
      notes: updates.notes !== undefined ? updates.notes : existingSale.notes,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };

    await kv.set(id, updatedSale);

    // Update or create debt record if payment status changed to pending
    if (updates.paymentStatus === 'pending' && updates.customerName) {
      const debts = await kv.getByPrefix('debt:');
      const existingDebt = debts.find((d: any) => d.sale_id === id);
      
      if (existingDebt) {
        // Update existing debt
        const updatedDebt = {
          ...existingDebt,
          customer_name: updates.customerName,
          amount: newTotal,
          remaining_amount: newTotal - (existingDebt.paid_amount || 0),
          status: 'pending',
          updatedAt: new Date().toISOString(),
        };
        await kv.set(existingDebt.id, updatedDebt);
      } else {
        // Create new debt
        const debtId = `debt:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const debt = {
          id: debtId,
          sale_id: id,
          customer_name: updates.customerName,
          product_name: updates.productName || existingSale.product_name,
          quantity: newQuantity,
          amount: newTotal,
          paid_amount: 0,
          remaining_amount: newTotal,
          status: 'pending',
          sale_date: existingSale.sale_date || new Date().toISOString().split('T')[0],
          notes: updates.notes || '',
          createdAt: new Date().toISOString(),
          createdBy: user.id,
          seller_name: user.user_metadata?.name || user.email,
        };
        await kv.set(debtId, debt);
      }
    } else if (updates.paymentStatus === 'paid') {
      // If changed to paid, update related debt
      const debts = await kv.getByPrefix('debt:');
      const existingDebt = debts.find((d: any) => d.sale_id === id);
      if (existingDebt) {
        const updatedDebt = {
          ...existingDebt,
          status: 'paid',
          paid_amount: existingDebt.amount,
          remaining_amount: 0,
          updatedAt: new Date().toISOString(),
        };
        await kv.set(existingDebt.id, updatedDebt);
      }
    }

    return c.json({ success: true, sale: updatedSale });
  } catch (error: any) {
    console.error('Update sale error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================
// DELETE ROUTES (ADMIN ONLY)
// ============================================================

// Delete sale by ID (Admin only)
app.delete('/make-server-06efd250/sales/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied. Admin only.' }, 403);
    }

    const saleId = c.req.param('id');
    const sale = await kv.get(saleId);
    
    if (!sale) {
      return c.json({ error: 'Sale not found' }, 404);
    }

    // Delete the sale
    await kv.del(saleId);
    
    // Delete related debt if exists
    const allDebts = await kv.getByPrefix('debt:');
    const relatedDebt = allDebts.find((d: any) => d.sale_id === saleId);
    if (relatedDebt) {
      await kv.del(relatedDebt.id);
    }

    return c.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error: any) {
    console.error('Delete sale error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete all sales for a customer (Admin only)
app.delete('/make-server-06efd250/customers/:customerName/sales', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied. Admin only.' }, 403);
    }

    const customerName = decodeURIComponent(c.req.param('customerName'));
    
    // Delete all sales for this customer
    const allSales = await kv.getByPrefix('sale:');
    let deletedCount = 0;
    
    for (const sale of allSales) {
      if (sale.customer_name === customerName || sale.customerName === customerName) {
        await kv.del(sale.id);
        deletedCount++;
      }
    }
    
    // Delete all debts for this customer
    const allDebts = await kv.getByPrefix('debt:');
    for (const debt of allDebts) {
      if (debt.customer_name === customerName || debt.customerName === customerName) {
        await kv.del(debt.id);
      }
    }

    return c.json({ success: true, deletedCount, message: 'Customer data deleted successfully' });
  } catch (error: any) {
    console.error('Delete customer sales error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= DEBTS ROUTES =============

app.get('/make-server-06efd250/debts', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const debts = await kv.getByPrefix('debt:');
    
    // Transform data to match frontend expectations
    const transformedDebts = (debts || []).map((debt: any) => ({
      id: debt.id,
      saleId: debt.sale_id || debt.saleId || '',
      customerName: debt.customer_name || debt.customerName || '',
      productName: debt.product_name || debt.productName || '',
      quantity: debt.quantity || 0,
      amount: debt.amount || 0,
      paidAmount: debt.paid_amount || debt.paidAmount || 0,
      remainingAmount: debt.remaining_amount || debt.remainingAmount || 0,
      status: debt.status || 'pending',
      notes: debt.notes || '',
      dueDate: debt.due_date || debt.dueDate || '',
      saleDate: debt.sale_date || debt.saleDate || '',
      lastPaymentDate: debt.lastPaymentDate || '',
      createdAt: debt.createdAt || '',
      createdBy: debt.createdBy || '',
      createdByName: debt.seller_name || debt.createdByName || '',
    }));
    
    // Sort by date descending
    const sortedDebts = transformedDebts.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ debts: sortedDebts });
  } catch (error: any) {
    console.error('Get debts error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create debt
app.post('/make-server-06efd250/debts', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { customerName, amount, notes, dueDate } = await c.req.json();
    const debtId = `debt:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const debt = {
      id: debtId,
      customer_name: customerName,
      amount: Number(amount),
      paid_amount: 0,
      remaining_amount: Number(amount),
      status: 'pending',
      notes: notes || '',
      due_date: dueDate || '',
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      seller_name: user.user_metadata?.name || user.email,
    };

    await kv.set(debtId, debt);

    return c.json({ success: true, debt });
  } catch (error: any) {
    console.error('Create debt error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update debt
app.put('/make-server-06efd250/debts/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    let debtId = c.req.param('id');
    const updates = await c.req.json();

    // Ensure debtId has the correct prefix
    if (!debtId.startsWith('debt:')) {
      debtId = `debt:${debtId}`;
    }

    const existingDebt = await kv.get(debtId);
    if (!existingDebt) {
      console.error(`Debt not found with ID: ${debtId}`);
      return c.json({ error: 'Debt not found' }, 404);
    }

    const updatedDebt = {
      ...existingDebt,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };

    await kv.set(debtId, updatedDebt);

    return c.json({ success: true, debt: updatedDebt });
  } catch (error: any) {
    console.error('Update debt error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete debt by ID (Admin only)
app.delete('/make-server-06efd250/debts/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied. Admin only.' }, 403);
    }

    const debtId = c.req.param('id');
    const debt = await kv.get(debtId);
    
    if (!debt) {
      return c.json({ error: 'Debt not found' }, 404);
    }

    // Delete the debt
    await kv.del(debtId);

    return c.json({ success: true, message: 'Debt deleted successfully' });
  } catch (error: any) {
    console.error('Delete debt error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-06efd250/debts/:id/payment', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    let debtId = c.req.param('id');
    const { amount } = await c.req.json();

    // Ensure debtId has the correct prefix
    if (!debtId.startsWith('debt:')) {
      debtId = `debt:${debtId}`;
    }

    const debt = await kv.get(debtId);
    if (!debt) {
      console.error(`Debt not found with ID: ${debtId}`);
      return c.json({ error: 'Debt not found' }, 404);
    }

    const paymentAmount = Number(amount);
    const newPaidAmount = (debt.paid_amount || 0) + paymentAmount;
    const newRemainingAmount = debt.amount - newPaidAmount;

    let newStatus = 'pending';
    if (newRemainingAmount <= 0) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }

    const updatedDebt = {
      ...debt,
      paid_amount: newPaidAmount,
      remaining_amount: Math.max(0, newRemainingAmount),
      status: newStatus,
      lastPaymentDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };

    await kv.set(debtId, updatedDebt);

    // Update related sale if exists
    if (debt.sale_id) {
      const sale = await kv.get(debt.sale_id);
      if (sale) {
        const updatedSale = {
          ...sale,
          payment_status: newStatus === 'paid' ? 'paid' : 'pending',
          updatedAt: new Date().toISOString(),
        };
        await kv.set(debt.sale_id, updatedSale);
      }
    }

    return c.json({ success: true, debt: updatedDebt });
  } catch (error: any) {
    console.error('Record payment error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete product sales report (Admin only)
app.delete('/make-server-06efd250/products/:productName/sales', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied. Admin only.' }, 403);
    }

    const productName = decodeURIComponent(c.req.param('productName'));
    
    // Delete all sales for this product
    const allSales = await kv.getByPrefix('sale:');
    let deletedCount = 0;
    
    for (const sale of allSales) {
      if (sale.product_name === productName || sale.type === productName) {
        await kv.del(sale.id);
        deletedCount++;
        
        // Delete related debt if exists
        const allDebts = await kv.getByPrefix('debt:');
        const relatedDebt = allDebts.find((d: any) => d.sale_id === sale.id);
        if (relatedDebt) {
          await kv.del(relatedDebt.id);
        }
      }
    }

    return c.json({ success: true, deletedCount, message: 'Product sales deleted successfully' });
  } catch (error: any) {
    console.error('Delete product sales error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= USERS MANAGEMENT ROUTES =============

app.get('/make-server-06efd250/users', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied. Admin only.' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    
    // Sort by date descending
    const sortedUsers = (users || []).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ users: sortedUsers });
  } catch (error: any) {
    console.error('Get users error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-06efd250/users', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied. Admin only.' }, 403);
    }

    const { name, email, password, role } = await c.req.json();

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (error) throw error;

    // Save user data to KV store
    const newUser = {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`user:${data.user.id}`, newUser);

    return c.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('Create user error:', error);
    return c.json({ error: error.message }, 400);
  }
});

app.put('/make-server-06efd250/users/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied. Admin only.' }, 403);
    }

    const userId = c.req.param('id');
    const { name, email, password, role } = await c.req.json();

    const existingUser = await kv.get(`user:${userId}`);
    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update user in Supabase Auth
    const updateData: any = {
      email,
      user_metadata: { name, role },
    };

    if (password) {
      updateData.password = password;
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, updateData);

    if (error) throw error;

    // Update user data in KV store
    const updatedUser = {
      ...existingUser,
      email,
      name,
      role,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`user:${userId}`, updatedUser);

    return c.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Update user error:', error);
    return c.json({ error: error.message }, 400);
  }
});

app.delete('/make-server-06efd250/users/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    // Check if user is admin
    const userData = await kv.get(`user:${user.id}`);
    if (!userData || userData.role !== 'admin') {
      return c.json({ error: 'Access denied. Admin only.' }, 403);
    }

    const userId = c.req.param('id');

    // Don't allow deleting yourself
    if (userId === user.id) {
      return c.json({ error: 'Cannot delete your own account' }, 400);
    }

    // Delete user from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    // Delete user data from KV store
    await kv.del(`user:${userId}`);

    // Delete user's sales
    const sales = await kv.getByPrefix('sale:');
    for (const sale of sales) {
      if (sale.createdBy === userId) {
        await kv.del(sale.id);
      }
    }

    // Delete user's debts
    const debts = await kv.getByPrefix('debt:');
    for (const debt of debts) {
      if (debt.createdBy === userId) {
        await kv.del(debt.id);
      }
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return c.json({ error: error.message }, 400);
  }
});

// ============= STATS ROUTES =============

app.get('/make-server-06efd250/stats', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const [sales, debts, users, products] = await Promise.all([
      kv.getByPrefix('sale:'),
      kv.getByPrefix('debt:'),
      kv.getByPrefix('user:'),
      kv.getByPrefix('product:'),
    ]);

    const totalSales = (sales || []).reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.total || 0), 0);
    const totalDebts = (debts || []).reduce((sum: number, debt: any) => sum + (debt.remaining_amount || debt.remaining || 0), 0);
    const paidSales = (sales || []).filter((sale: any) => sale.payment_status === 'paid').length;
    const pendingSales = (sales || []).filter((sale: any) => sale.payment_status === 'pending').length;

    // Today's sales
    const today = new Date().toISOString().split('T')[0];
    const todaySales = (sales || []).filter((sale: any) => 
      sale.createdAt?.startsWith(today)
    );
    const todayTotal = todaySales.reduce((sum: number, sale: any) => sum + (sale.total_amount || sale.total || 0), 0);

    return c.json({
      stats: {
        totalSales,
        totalDebts,
        paidSales,
        pendingSales,
        todayTotal,
        todayCount: todaySales.length,
        totalUsers: (users || []).length,
        totalProducts: (products || []).length,
      }
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= CUSTOMER STATEMENT ROUTES =============

app.get('/make-server-06efd250/customers/:customerName/statement', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const customerName = decodeURIComponent(c.req.param('customerName'));
    
    // Get all sales for this customer
    const allSales = await kv.getByPrefix('sale:');
    const customerSales = (allSales || []).filter((sale: any) => 
      sale.customer_name === customerName || sale.customerName === customerName
    );
    
    // Get all debts for this customer
    const allDebts = await kv.getByPrefix('debt:');
    const customerDebts = (allDebts || []).filter((debt: any) => 
      debt.customer_name === customerName || debt.customerName === customerName
    );
    
    // Transform sales data
    const transformedSales = customerSales.map((sale: any) => ({
      id: sale.id,
      productName: sale.product_name || sale.productName || '',
      quantity: sale.quantity || 0,
      price: sale.price || 0,
      total: sale.total_amount || sale.total || 0,
      paymentStatus: sale.payment_status || sale.paymentStatus || 'paid',
      notes: sale.notes || '',
      saleDate: sale.sale_date || sale.saleDate || '',
      createdAt: sale.createdAt || '',
      createdBy: sale.createdBy || '',
      createdByName: sale.seller_name || sale.createdByName || '',
    }));
    
    // Transform debts data
    const transformedDebts = customerDebts.map((debt: any) => ({
      id: debt.id,
      saleId: debt.sale_id || debt.saleId || '',
      productName: debt.product_name || debt.productName || '',
      quantity: debt.quantity || 0,
      amount: debt.amount || 0,
      paidAmount: debt.paid_amount || debt.paidAmount || 0,
      remainingAmount: debt.remaining_amount || debt.remainingAmount || 0,
      status: debt.status || 'pending',
      notes: debt.notes || '',
      dueDate: debt.due_date || debt.dueDate || '',
      saleDate: debt.sale_date || debt.saleDate || '',
      lastPaymentDate: debt.lastPaymentDate || '',
      createdAt: debt.createdAt || '',
    }));
    
    // Calculate totals
    const totalPurchases = transformedSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalPaid = transformedSales
      .filter(sale => sale.paymentStatus === 'paid')
      .reduce((sum, sale) => sum + sale.total, 0);
    const totalDebts = transformedDebts
      .filter(debt => debt.status !== 'paid')
      .reduce((sum, debt) => sum + debt.remainingAmount, 0);
    
    // Sort by date descending
    const sortedSales = transformedSales.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const sortedDebts = transformedDebts.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({
      customerName,
      sales: sortedSales,
      debts: sortedDebts,
      summary: {
        totalPurchases,
        totalPaid,
        totalDebts,
        transactionCount: sortedSales.length,
      }
    });
  } catch (error: any) {
    console.error('Get customer statement error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get list of all customers
app.get('/make-server-06efd250/customers', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const [allSales, allDebts] = await Promise.all([
      kv.getByPrefix('sale:'),
      kv.getByPrefix('debt:'),
    ]);
    
    // Extract unique customer names
    const customerNames = new Set<string>();
    
    (allSales || []).forEach((sale: any) => {
      const name = sale.customer_name || sale.customerName;
      if (name && name.trim()) {
        customerNames.add(name.trim());
      }
    });
    
    (allDebts || []).forEach((debt: any) => {
      const name = debt.customer_name || debt.customerName;
      if (name && name.trim()) {
        customerNames.add(name.trim());
      }
    });
    
    // Calculate stats for each customer
    const customers = Array.from(customerNames).map(name => {
      const customerSales = (allSales || []).filter((sale: any) => 
        (sale.customer_name === name || sale.customerName === name)
      );
      
      const customerDebts = (allDebts || []).filter((debt: any) => 
        (debt.customer_name === name || debt.customerName === name) && 
        debt.status !== 'paid'
      );
      
      const totalPurchases = customerSales.reduce((sum, sale) => 
        sum + (sale.total_amount || sale.total || 0), 0
      );
      
      const totalDebts = customerDebts.reduce((sum, debt) => 
        sum + (debt.remaining_amount || debt.remainingAmount || 0), 0
      );
      
      return {
        name,
        totalPurchases,
        totalDebts,
        transactionCount: customerSales.length,
        hasDebts: totalDebts > 0,
      };
    });
    
    // Sort by total purchases descending
    const sortedCustomers = customers.sort((a, b) => b.totalPurchases - a.totalPurchases);

    return c.json({ customers: sortedCustomers });
  } catch (error: any) {
    console.error('Get customers error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= HEALTH CHECK =============

app.get('/make-server-06efd250/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============= SMART ASSISTANT ROUTES =============

app.post('/make-server-06efd250/assistant', async (c) => {
  try {
    console.log('🎯 [ASSISTANT] تلقي طلب جديد');
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('❌ [ASSISTANT] غير مصرح');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('✅ [ASSISTANT] مصرح:', user.id);
    const body = await c.req.json();
    console.log('📥 [ASSISTANT] البيانات المستلمة:', JSON.stringify(body).substring(0, 200));
    
    const result = await processAssistantRequest({ ...body, userId: user.id });
    console.log('✅ [ASSISTANT] النتيجة:', result.success ? 'نجح' : 'فشل');
    
    if (result.data) {
      console.log('💾 [ASSISTANT] البيانات المحفوظة:', result.data.id);
    }

    return c.json(result);
  } catch (error: any) {
    console.error('❌ [ASSISTANT] خطأ:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'حدث خطأ في المساعد الذكي'
    }, 500);
  }
});

Deno.serve(app.fetch);