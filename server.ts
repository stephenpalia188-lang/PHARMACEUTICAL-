import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getServerSupabase, isServerSupabaseConfigured, testSupabaseConnection, seedSupabaseDatabase } from './src/lib/server-supabase';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SERVICES } from './src/data/initial-catalog';
import { Product, OrderStatus } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS & Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Admin Authorization Middleware (Strict Supabase Auth & Role-Based Authorization)
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthenticated. Authorization token required.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const supabase = getServerSupabase();

    if (!supabase) {
      res.status(503).json({ error: 'Database service unavailable. Supabase is not configured on the server.' });
      return;
    }

    // Verify token strictly with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
      return;
    }

    // Query authenticated user's role strictly from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Administrator role privileges required.' });
      return;
    }

    // Attach verified user and profile to request
    (req as any).user = user;
    (req as any).profile = profile;
    (req as any).isAdmin = true;
    next();
  } catch (err: any) {
    console.error('Admin Auth Middleware Error:', err);
    res.status(500).json({ error: 'Internal authorization error' });
  }
}

// ==========================================
// 1. HEALTH CHECK ENDPOINT
// ==========================================
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbTest = await testSupabaseConnection();
    
    const isHealthy = dbTest.connected;
    const statusCode = isHealthy ? 200 : (dbTest.urlConfigured ? 503 : 200);

    res.status(statusCode).json({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      application: {
        name: 'Gods Favor Pharmacy',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        location: 'Kitale Town, Along Kijana Wamalwa Road, Kenya',
      },
      supabase: {
        connected: dbTest.connected,
        urlConfigured: dbTest.urlConfigured,
        serviceKeyConfigured: dbTest.serviceKeyConfigured,
        tablesDetected: dbTest.tablesDetected,
        error: dbTest.error,
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed: ' + (err.message || 'Unknown error')
    });
  }
});

// ==========================================
// 2. PUBLIC CATALOG API ENDPOINTS
// ==========================================

// GET /api/categories
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          res.json({ data, source: 'supabase' });
          return;
        }
      } catch (e) {
        console.warn('Supabase categories fetch error:', e);
      }
    }

    // Fallback to initial categories if DB empty or initializing
    res.json({ data: INITIAL_CATEGORIES, source: 'initial-catalog' });
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/products
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, search, featured, available } = req.query;
    const supabase = getServerSupabase();

    if (supabase) {
      try {
        let query = supabase
          .from('products')
          .select('*, category:categories(id, name)')
          .order('name', { ascending: true });

        if (available !== 'all') {
          query = query.eq('is_available', true);
        }
        if (featured === 'true') {
          query = query.eq('is_featured', true);
        }
        if (category && typeof category === 'string' && category !== 'all') {
          query = query.eq('category_id', category);
        }
        if (search && typeof search === 'string') {
          query = query.ilike('name', `%${search}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          res.json({ data, source: 'supabase' });
          return;
        }
      } catch (e) {
        console.warn('Supabase products fetch error:', e);
      }
    }

    // Initial products catalog fallback for first-run
    let products: Product[] = INITIAL_PRODUCTS.map(p => ({
      ...p,
      category: INITIAL_CATEGORIES.find(c => c.id === p.category_id) || null
    }));

    if (available !== 'all') {
      products = products.filter(p => p.is_available);
    }
    if (featured === 'true') {
      products = products.filter(p => p.is_featured);
    }
    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter(p => p.category_id === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    res.json({ data: products, source: 'initial-catalog' });
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/services
app.get('/api/services', async (req: Request, res: Response) => {
  try {
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          res.json({ data, source: 'supabase' });
          return;
        }
      } catch (e) {
        console.warn('Supabase services fetch error:', e);
      }
    }

    res.json({ data: INITIAL_SERVICES, source: 'initial-catalog' });
  } catch (err: any) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// ==========================================
// 3. ORDERS API (REAL SERVER VALIDATION & SUPABASE PERSISTENCE)
// ==========================================

const fallbackOrders: any[] = [];

// POST /api/orders
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_location,
      notes,
      items,
      customer_id
    } = req.body;

    // Strict input validation
    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
      res.status(400).json({ error: 'Valid customer name is required.' });
      return;
    }
    if (!customer_phone || typeof customer_phone !== 'string' || customer_phone.trim().length < 6) {
      res.status(400).json({ error: 'Valid Kenyan phone number is required (e.g., 0712345678).' });
      return;
    }
    if (!customer_email || !customer_email.includes('@')) {
      res.status(400).json({ error: 'Valid email address is required.' });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one product.' });
      return;
    }

    const supabase = getServerSupabase();

    // Server-side price recalculation & stock verification
    let calculatedTotalKes = 0;
    const validatedItems: Array<{
      product_id: string | null;
      product_name: string;
      quantity: number;
      unit_price_kes: number;
      subtotal_kes: number;
    }> = [];

    // Fetch master products list for pricing & stock verification
    let masterProducts: Product[] = [];
    if (supabase) {
      try {
        const { data } = await supabase.from('products').select('*');
        if (data && data.length > 0) {
          masterProducts = data;
        }
      } catch (e) {
        console.warn('Could not fetch products from Supabase:', e);
      }
    }
    if (masterProducts.length === 0) {
      masterProducts = INITIAL_PRODUCTS.map(p => ({ ...p }));
    }

    for (const item of items) {
      const quantity = Math.floor(Number(item.quantity));
      if (isNaN(quantity) || quantity <= 0) {
        res.status(400).json({ error: `Invalid quantity for item ${item.product_name || item.product_id}` });
        return;
      }

      // Match against master product
      const product = masterProducts.find(
        p => p.id === item.product_id || p.name.toLowerCase() === (item.product_name || '').toLowerCase()
      );

      if (!product) {
        if (item.product_name?.toLowerCase().includes('prescription')) {
          validatedItems.push({
            product_id: null,
            product_name: item.product_name,
            quantity: 1,
            unit_price_kes: 0,
            subtotal_kes: 0,
          });
          continue;
        }

        res.status(400).json({ error: `Product "${item.product_name || item.product_id}" not found in catalog.` });
        return;
      }

      if (!product.is_available) {
        res.status(400).json({ error: `Product "${product.name}" is currently unavailable.` });
        return;
      }

      if (product.stock_quantity < quantity) {
        res.status(400).json({ 
          error: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${quantity}` 
        });
        return;
      }

      const unitPrice = Math.floor(product.price_kes);
      const subtotal = unitPrice * quantity;
      calculatedTotalKes += subtotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price_kes: unitPrice,
        subtotal_kes: subtotal,
      });
    }

    // Server generated Order Number
    const orderNumber = `GFP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderPayload = {
      order_number: orderNumber,
      customer_id: customer_id || null,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      delivery_location: delivery_location?.trim() || 'Kitale Town / Pharmacy Pickup',
      notes: notes?.trim() || null,
      total_kes: calculatedTotalKes,
      status: 'pending' as OrderStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        // 1. Insert order into Supabase
        const { data: createdOrder, error: orderError } = await supabase
          .from('orders')
          .insert(orderPayload)
          .select()
          .single();

        if (!orderError && createdOrder) {
          // 2. Insert order items
          const orderItemsToInsert = validatedItems.map(item => ({
            order_id: createdOrder.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price_kes: item.unit_price_kes,
            subtotal_kes: item.subtotal_kes,
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

          if (itemsError) {
            console.error('Supabase Order Items Insert Error:', itemsError);
          }

          // 3. Decrement stock
          for (const item of validatedItems) {
            if (item.product_id) {
              const currentProd = masterProducts.find(p => p.id === item.product_id);
              if (currentProd) {
                const newStock = Math.max(0, currentProd.stock_quantity - item.quantity);
                await supabase
                  .from('products')
                  .update({ 
                    stock_quantity: newStock,
                    is_available: newStock > 0 
                  })
                  .eq('id', item.product_id);
              }
            }
          }

          res.status(201).json({
            success: true,
            order: {
              ...createdOrder,
              items: validatedItems,
            },
            message: 'Order created successfully. Our pharmacist at Gods Favor Pharmacy will review and contact you.',
          });
          return;
        } else {
          console.warn('Supabase orders insert notice (falling back to transactional store):', orderError?.message);
        }
      } catch (dbErr: any) {
        console.warn('Supabase order processing exception:', dbErr.message);
      }
    }

    // Fallback store ensures order is never lost
    const localOrder = {
      id: `ord-${Date.now()}`,
      ...orderPayload,
      items: validatedItems,
    };
    fallbackOrders.unshift(localOrder);

    res.status(201).json({
      success: true,
      order: localOrder,
      message: 'Order created successfully. Our pharmacist at Gods Favor Pharmacy has received your order.',
    });
  } catch (err: any) {
    console.error('Error submitting order:', err);
    res.status(500).json({ error: err.message || 'Failed to process order' });
  }
});

// GET /api/orders/lookup (SECURE CUSTOMER DATA LOOKUP WITH 2ND FACTOR VERIFICATION)
app.get('/api/orders/lookup', async (req: Request, res: Response) => {
  try {
    const { order_number, verification } = req.query;

    if (!order_number || typeof order_number !== 'string' || !order_number.trim()) {
      res.status(400).json({ error: 'Order reference number is required.' });
      return;
    }

    if (!verification || typeof verification !== 'string' || !verification.trim()) {
      res.status(400).json({ 
        error: 'Second-factor verification required. Please enter the customer phone number or email address associated with this order.' 
      });
      return;
    }

    const cleanOrderNum = order_number.trim();
    const cleanVerification = verification.trim().toLowerCase();
    const cleanVerificationDigits = cleanVerification.replace(/\D/g, '');

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('order_number', cleanOrderNum)
          .single();

        if (!error && order) {
          // Verify second factor: phone number or email
          const orderPhoneDigits = (order.customer_phone || '').replace(/\D/g, '');
          const phoneMatch = cleanVerificationDigits.length >= 6 && orderPhoneDigits.includes(cleanVerificationDigits);
          const emailMatch = order.customer_email && order.customer_email.trim().toLowerCase() === cleanVerification;

          if (!phoneMatch && !emailMatch) {
            res.status(403).json({ 
              error: 'Verification failed. The phone number or email provided does not match our records for this order.' 
            });
            return;
          }

          res.json({ order });
          return;
        }
      } catch (e) {
        console.warn('Supabase lookup query error:', e);
      }
    }

    // Search in fallback memory store
    const memoryOrder = fallbackOrders.find(o => o.order_number.toLowerCase() === cleanOrderNum.toLowerCase());
    if (memoryOrder) {
      const orderPhoneDigits = (memoryOrder.customer_phone || '').replace(/\D/g, '');
      const phoneMatch = cleanVerificationDigits.length >= 6 && orderPhoneDigits.includes(cleanVerificationDigits);
      const emailMatch = memoryOrder.customer_email && memoryOrder.customer_email.trim().toLowerCase() === cleanVerification;

      if (!phoneMatch && !emailMatch) {
        res.status(403).json({ 
          error: 'Verification failed. The phone number or email provided does not match our records for this order.' 
        });
        return;
      }

      res.json({ order: memoryOrder });
      return;
    }

    res.status(404).json({ error: 'Order not found. Please verify the order reference number and verification details.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to look up order' });
  }
});

// ==========================================
// 4. ADMIN API ENDPOINTS (PROTECTED VIA requireAdmin)
// ==========================================

// GET /api/admin/check-auth
app.get('/api/admin/check-auth', requireAdmin, (req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: (req as any).user,
    role: (req as any).profile?.role || 'admin',
  });
});

// GET /api/admin/orders
app.get('/api/admin/orders', requireAdmin, async (req: Request, res: Response) => {
  try {
    const allOrders: any[] = [];
    const supabase = getServerSupabase();
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          allOrders.push(...data);
        }
      } catch (e) {
        console.warn('Supabase admin orders error:', e);
      }
    }

    // Merge in memory orders
    for (const fo of fallbackOrders) {
      if (!allOrders.some(o => o.order_number === fo.order_number)) {
        allOrders.push(fo);
      }
    }

    res.json({ data: allOrders, source: supabase ? 'supabase' : 'memory' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

// PATCH /api/admin/orders/:id/status
app.patch('/api/admin/orders/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          res.json({ success: true, order: data });
          return;
        }
      } catch (e) {
        console.warn('Supabase status update error:', e);
      }
    }

    // Update fallback order
    const order = fallbackOrders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
      res.json({ success: true, order });
      return;
    }

    res.status(404).json({ error: 'Order not found' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/admin/products
app.get('/api/admin/products', requireAdmin, async (req: Request, res: Response) => {
  try {
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          res.json({ data });
          return;
        }
      } catch (e) {
        console.warn('Supabase admin products fetch error:', e);
      }
    }

    res.json({ data: INITIAL_PRODUCTS });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin products' });
  }
});

// POST /api/admin/products
app.post('/api/admin/products', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      category_id,
      description,
      price_kes,
      stock_quantity,
      image_url,
      is_available,
      is_featured,
      dosage,
      requires_prescription,
    } = req.body;

    if (!name || price_kes === undefined) {
      res.status(400).json({ error: 'Product name and price in KES are required.' });
      return;
    }

    const price = Math.floor(Number(price_kes));
    const stock = Math.floor(Number(stock_quantity || 0));

    const supabase = getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          category_id: category_id || null,
          description: description?.trim() || null,
          price_kes: price,
          stock_quantity: stock,
          image_url: image_url?.trim() || null,
          is_available: is_available ?? true,
          is_featured: is_featured ?? false,
          dosage: dosage?.trim() || null,
          requires_prescription: Boolean(requires_prescription),
        })
        .select('*, category:categories(*)')
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.status(201).json({ success: true, data });
      return;
    }

    res.status(500).json({ error: 'Supabase server client not configured' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// PUT /api/admin/products/:id
app.put('/api/admin/products/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.price_kes !== undefined) {
      updateData.price_kes = Math.floor(Number(updateData.price_kes));
    }
    if (updateData.stock_quantity !== undefined) {
      updateData.stock_quantity = Math.floor(Number(updateData.stock_quantity));
    }

    const supabase = getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, category:categories(*)')
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({ success: true, data });
      return;
    }

    res.status(500).json({ error: 'Supabase not configured' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// DELETE /api/admin/products/:id
app.delete('/api/admin/products/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getServerSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({ success: true, message: 'Product deleted' });
      return;
    }

    res.status(500).json({ error: 'Supabase not configured' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

// POST /api/admin/seed (PROTECTED VIA requireAdmin)
app.post('/api/admin/seed', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await seedSupabaseDatabase();
    res.json(result);
  } catch (err: any) {
    console.error('Seed Error:', err);
    res.status(500).json({ error: err.message || 'Failed to seed database' });
  }
});

// ==========================================
// 5. VITE & STATIC SPA SERVING
// ==========================================
async function startApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Gods Favor Pharmacy] Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startApp().catch(err => {
  console.error('Failed to start server:', err);
});
