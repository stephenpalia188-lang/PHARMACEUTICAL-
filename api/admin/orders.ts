import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Admin orders API: required Supabase environment variables are missing.');
      return res.status(503).json({ error: 'Admin order service is not configured on the server.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired administrator session.' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Admin role lookup failed:', profileError.message);
      return res.status(503).json({ error: 'Unable to verify administrator authorization.' });
    }

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator privileges are required.' });
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Admin orders lookup failed:', ordersError.message);
      return res.status(503).json({ error: 'Unable to load orders right now.' });
    }

    return res.status(200).json({ data: orders || [] });
  } catch (error: any) {
    console.error('Admin orders API error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to load orders.' });
  }
}
