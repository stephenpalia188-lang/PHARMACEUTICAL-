import { createClient } from '@supabase/supabase-js';

const ALLOWED_STATUSES = new Set([
  'pending',
  'confirmed',
  'processing',
  'ready',
  'completed',
  'cancelled',
]);

export default async function handler(req: any, res: any) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const orderId = req.query?.id;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    const supabaseUrl =
      process.env.VITE_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Admin order status API: required Supabase environment variables are missing.');
      return res.status(503).json({ error: 'Order status service is not configured on the server.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

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

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Request body must be valid JSON.' });
      }
    }

    const status = body?.status;
    if (typeof status !== 'string' || !ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Admin order status update failed:', updateError.message);
      return res.status(503).json({ error: 'Unable to update order status right now.' });
    }

    return res.status(200).json({ data: order });
  } catch (error: any) {
    console.error('Admin order status API error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
}
