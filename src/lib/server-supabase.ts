import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SERVICES } from '../data/initial-catalog';

dotenv.config();

const supabaseUrl = 
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('placeholder')
);

let serverSupabaseClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured) {
    return null;
  }
  if (!serverSupabaseClient) {
    serverSupabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverSupabaseClient;
}

export async function testSupabaseConnection() {
  if (!isServerSupabaseConfigured) {
    return {
      connected: false,
      urlConfigured: Boolean(supabaseUrl),
      serviceKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      error: 'Supabase URL or Key not configured in environment variables.',
      tablesDetected: {
        profiles: false,
        categories: false,
        products: false,
        services: false,
        orders: false,
        order_items: false,
      }
    };
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return {
      connected: false,
      urlConfigured: true,
      serviceKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      error: 'Failed to initialize Supabase client.',
    };
  }

  try {
    // Check tables presence
    const [catRes, prodRes, srvRes, ordRes] = await Promise.allSettled([
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('services').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
    ]);

    const categoriesOk = catRes.status === 'fulfilled' && !catRes.value.error;
    const productsOk = prodRes.status === 'fulfilled' && !prodRes.value.error;
    const servicesOk = srvRes.status === 'fulfilled' && !srvRes.value.error;
    const ordersOk = ordRes.status === 'fulfilled' && !ordRes.value.error;

    return {
      connected: categoriesOk || productsOk || servicesOk || ordersOk,
      urlConfigured: true,
      serviceKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      tablesDetected: {
        profiles: true,
        categories: categoriesOk,
        products: productsOk,
        services: servicesOk,
        orders: ordersOk,
        order_items: ordersOk,
      },
      error: null,
    };
  } catch (err: any) {
    return {
      connected: false,
      urlConfigured: true,
      serviceKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      error: err.message || 'Database connection error',
    };
  }
}

// Helper to seed Supabase database with initial categories, products and services
export async function seedSupabaseDatabase() {
  const supabase = getServerSupabase();
  if (!supabase) {
    throw new Error('Supabase client is not available. Please check credentials.');
  }

  // 1. Seed Categories
  const { data: existingCats } = await supabase.from('categories').select('id, name');
  const existingCatNames = new Set((existingCats || []).map(c => c.name.toLowerCase()));

  for (const cat of INITIAL_CATEGORIES) {
    if (!existingCatNames.has(cat.name.toLowerCase())) {
      await supabase.from('categories').insert({
        name: cat.name,
        description: cat.description,
      });
    }
  }

  // Refetch categories to map by name
  const { data: currentCategories } = await supabase.from('categories').select('id, name');
  const catMap = new Map<string, string>();
  (currentCategories || []).forEach(c => {
    catMap.set(c.name.toLowerCase(), c.id);
  });

  // 2. Seed Products
  const { data: existingProds } = await supabase.from('products').select('id, name');
  const existingProdNames = new Set((existingProds || []).map(p => p.name.toLowerCase()));

  for (const prod of INITIAL_PRODUCTS) {
    if (!existingProdNames.has(prod.name.toLowerCase())) {
      // Find category id
      const originalCat = INITIAL_CATEGORIES.find(c => c.id === prod.category_id);
      const catId = originalCat ? catMap.get(originalCat.name.toLowerCase()) : null;

      await supabase.from('products').insert({
        category_id: catId,
        name: prod.name,
        description: prod.description,
        price_kes: prod.price_kes,
        image_url: prod.image_url,
        stock_quantity: prod.stock_quantity,
        is_available: prod.is_available,
        is_featured: prod.is_featured,
        dosage: prod.dosage,
        requires_prescription: prod.requires_prescription,
      });
    }
  }

  // 3. Seed Services
  const { data: existingServices } = await supabase.from('services').select('id, name');
  const existingServiceNames = new Set((existingServices || []).map(s => s.name.toLowerCase()));

  for (const srv of INITIAL_SERVICES) {
    if (!existingServiceNames.has(srv.name.toLowerCase())) {
      await supabase.from('services').insert({
        name: srv.name,
        description: srv.description,
        image_url: srv.image_url,
        is_active: srv.is_active,
        duration_minutes: srv.duration_minutes,
        price_kes: srv.price_kes,
      });
    }
  }

  return { success: true, message: 'Database seeded successfully' };
}
