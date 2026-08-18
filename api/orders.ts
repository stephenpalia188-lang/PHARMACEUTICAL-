import { getServerSupabase } from '../src/lib/server-supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_location,
      notes,
      items,
      customer_id,
    } = req.body || {};

    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid customer name is required.' });
    }
    if (!customer_phone || typeof customer_phone !== 'string' || customer_phone.trim().length < 6) {
      return res.status(400).json({ error: 'Valid Kenyan phone number is required.' });
    }
    if (!customer_email || !customer_email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one product.' });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return res.status(503).json({ error: 'Order service is not configured.' });
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.error('Order product lookup failed:', productsError);
      return res.status(503).json({ error: 'Unable to verify medicine stock right now.' });
    }

    let total_kes = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ error: `Invalid quantity for ${item.product_name || 'item'}.` });
      }

      const product = (products || []).find(
        (p: any) => p.id === item.product_id ||
          String(p.name).toLowerCase() === String(item.product_name || '').toLowerCase()
      );

      if (!product) {
        if (String(item.product_name || '').toLowerCase().includes('prescription')) {
          validatedItems.push({
            product_id: null,
            product_name: item.product_name,
            quantity: 1,
            unit_price_kes: 0,
            subtotal_kes: 0,
          });
          continue;
        }
        return res.status(400).json({ error: `Product "${item.product_name || item.product_id}" not found in catalog.` });
      }

      if (!product.is_available) {
        return res.status(400).json({ error: `Product "${product.name}" is currently unavailable.` });
      }

      if (Number(product.stock_quantity) < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${quantity}`,
        });
      }

      const unit_price_kes = Math.floor(Number(product.price_kes));
      const subtotal_kes = unit_price_kes * quantity;
      total_kes += subtotal_kes;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price_kes,
        subtotal_kes,
      });
    }

    const now = new Date().toISOString();
    const orderPayload = {
      order_number: `GFP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      customer_id: customer_id || null,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      delivery_location: delivery_location?.trim() || 'Kitale Town / Pharmacy Pickup',
      notes: notes?.trim() || null,
      total_kes,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order insert failed:', orderError);
      return res.status(500).json({ error: 'Unable to create the order. Please try again.' });
    }

    const orderItems = validatedItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price_kes: item.unit_price_kes,
      subtotal_kes: item.subtotal_kes,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      console.error('Order items insert failed:', itemsError);
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ error: 'Unable to save the order items. Please try again.' });
    }

    for (const item of validatedItems) {
      if (!item.product_id) continue;
      const product = (products || []).find((p: any) => p.id === item.product_id);
      if (!product) continue;
      const newStock = Math.max(0, Number(product.stock_quantity) - item.quantity);
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock, is_available: newStock > 0 })
        .eq('id', item.product_id);
      if (stockError) console.error('Stock update failed:', stockError);
    }

    return res.status(201).json({
      success: true,
      order: { ...order, items: validatedItems },
      message: 'Order created successfully.',
    });
  } catch (error: any) {
    console.error('Vercel orders API error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to process order.' });
  }
}
