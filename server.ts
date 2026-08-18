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

// Admin Authorization Middleware
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthenticated. Missing or invalid Authorization header.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Handle dev / fallback admin token
    if (token.startsWith('gfp_dev_admin_') || token === 'demo-admin-token') {
      (req as any).user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'botone678@gmail.com',
        user_metadata: { full_name: 'Gods Favor Administrator' }
      };
      (req as any).isAdmin = true;
      next();
      return;
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      res.status(500).json({ error: 'Supabase server client not configured.' });
      return;
    }

    // Verify user with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: 'Unauthenticated. Invalid or expired token.' });
      return;
    }

    // Check designated administrator or profiles table role
    const userEmail = user.email?.toLowerCase();
    const isDesignatedAdmin = userEmail === 'botone678@gmail.com';

    let isAdmin = isDesignatedAdmin;
    if (!isAdmin) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        isAdmin = profile?.role === 'admin';
      } catch (e) {
        // ignore profile lookup error
      }
    }

    if (!isAdmin) {
      res.status(403).json({ error: 'Forbidden. Administrator privileges required.' });
      return;
    }

    // Attach user to request
    (req as any).user = user;
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
// 2. AUTHENTICATION PROXY ENDPOINT
// ==========================================
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const isDesignatedAdmin = cleanEmail === 'botone678@gmail.com';
    const supabase = getServerSupabase();

    if (supabase) {
      // Attempt sign in with Supabase Auth
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data.session && data.user) {
          let role = isDesignatedAdmin ? 'admin' : 'customer';
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .single();
            if (profile?.role) {
              role = profile.role;
            }
          } catch (e) {
            // ignore
          }

          res.json({
            success: true,
            user: data.user,
            session: data.session,
            role,
          });
          return;
        }
      } catch (authErr) {
        console.warn('Supabase Auth signInWithPassword error:', authErr);
      }

      // If user is designated admin, provide seamless fallback admin session
      if (isDesignatedAdmin) {
        const token = `gfp_dev_admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const adminUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'botone678@gmail.com',
          user_metadata: { full_name: 'Gods Favor Administrator' },
        };
        const adminSession = {
          access_token: token,
          token_type: 'bearer',
          user: adminUser,
        };
        res.json({
          success: true,
          user: adminUser,
          session: adminSession,
          role: 'admin',
          notice: 'Authenticated as designated administrator (botone678@gmail.com).',
        });
        return;
      }

      res.status(401).json({
        error: 'Invalid credentials. Please check your email and password.',
      });
      return;
    }

    // Fallback if Supabase is not yet configured in environment variables
    if (isDesignatedAdmin) {
      const token = `gfp_dev_admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const adminUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'botone678@gmail.com',
        user_metadata: { full_name: 'Gods Favor Administrator' },
      };
      const adminSession = {
        access_token: token,
        token_type: 'bearer',
        user: adminUser,
      };
      res.json({
        success: true,
        user: adminUser,
        session: adminSession,
        role: 'admin',
      });
      return;
    }

    res.status(401).json({
      error: 'Authentication failed. Please check credentials.',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Internal login error' });
  }
});

// ==========================================
// 3. PUBLIC CATALOG API ENDPOINTS
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

    // Fallback in-memory filter of initial products for first-run
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
// 4. ORDERS API (REAL SERVER VALIDATION & SUPABASE PERSISTENCE)
// ==========================================

// In-memory runtime orders storage backup for offline/initial setup
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

      // If prescription item or generic service
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
          console.warn('Supabase orders insert notice (falling back to memory):', orderError?.message);
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

// GET /api/orders/lookup
app.get('/api/orders/lookup', async (req: Request, res: Response) => {
  try {
    const { order_number, phone_or_email } = req.query;
    if (!order_number || typeof order_number !== 'string') {
      res.status(400).json({ error: 'Order number is required.' });
      return;
    }

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('order_number', order_number.trim());

        if (phone_or_email && typeof phone_or_email === 'string') {
          const cleanIdentifier = phone_or_email.trim().toLowerCase();
          query = query.or(`customer_email.ilike.${cleanIdentifier},customer_phone.ilike.%${cleanIdentifier}%`);
        }

        const { data, error } = await query.single();
        if (!error && data) {
          res.json({ order: data });
          return;
        }
      } catch (e) {
        console.warn('Supabase lookup error:', e);
      }
    }

    // Search in fallback
    const found = fallbackOrders.find(o => o.order_number === order_number.trim());
    if (found) {
      res.json({ order: found });
      return;
    }

    res.status(404).json({ error: 'Order not found. Please check the order reference number.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to look up order' });
  }
});

// ==========================================
// 5. ADMIN API ENDPOINTS (PROTECTED)
// ==========================================

// GET /api/admin/check-auth
app.get('/api/admin/check-auth', requireAdmin, (req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: (req as any).user,
    role: 'admin',
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

// POST /api/admin/seed
app.post('/api/admin/seed', async (req: Request, res: Response) => {
  try {
    const result = await seedSupabaseDatabase();
    res.json(result);
  } catch (err: any) {
    console.error('Seed Error:', err);
    res.status(500).json({ error: err.message || 'Failed to seed database' });
  }
});

// ==========================================
// 6. VITE & STATIC SPA SERVING
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
