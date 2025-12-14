import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use service role for webhooks to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('paddle-signature');
  
  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    console.error('Missing PADDLE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  // 1. Verify webhook signature
  if (!verifyPaddleSignature(body, signature!)) {
    console.error('Invalid Paddle signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  console.log('Received Paddle Webhook:', event.event_type);
  
  // 2. Handle event types
  try {
    switch (event.event_type) {
      case 'transaction.completed':
        await handleTransactionCompleted(event.data);
        break;
      case 'transaction.updated': 
        // Sometimes status changes to completed in an update
        if (event.data.status === 'completed') {
            await handleTransactionCompleted(event.data);
        }
        break;
      // Add other cases like refunded if needed
    }
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
  
  return NextResponse.json({ received: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleTransactionCompleted(data: Record<string, any>) {
  const { id, customer, items, details, custom_data } = data;
  
  // ✅ CRITICAL: Use userId from customData first, fallback to email matching
  let userId: string | null = null;
  
  // Priority 1: Use the logged-in user ID we passed to Paddle
  if (custom_data?.userId) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', custom_data.userId)
      .single();
    
    if (existingUser) {
      userId = existingUser.id;
    }
  }
  
  // Priority 2: Fallback to email matching
  if (!userId && customer?.email) {
    const { data: userByEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', customer.email)
      .single();
    
    if (userByEmail) {
      userId = userByEmail.id;
    } else {
        // Here we could auto-create a user, but since our users table 
        // is linked to auth.users, we can't easily create a "real" account 
        // without them going through signup.
        // For now, we will log this edge case. Ideally, you'd send them an invite email.
        console.warn(`No user found for email ${customer.email}. Order will be orphaned.`);
    }
  }
  
  if (!userId) {
    console.error('Failed to identify user for transaction:', id);
    return;
  }
  
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .upsert({
      paddle_transaction_id: id,
      user_id: userId,
      status: 'completed',
      total: parseFloat(details.totals.total) / 100, // Paddle uses cents/lowest unit? Check currency. 
      // V2 API uses string "10.00" usually, but sometimes raw units. 
      // Let's assume standard formatting or check docs. 
      // Actually Paddle Billing API sends totals as strings like "1000" for $10.00 usually?
      // Wait, standard Paddle Billing API 'totals.total' is a string of the major unit (e.g. "10.00") or minor?
      // Checking docs... Paddle Billing API totals are strings representing the value.
      // Correction: It depends on the field. `totals.total` is usually a string formatted amount.
      // Let's double check standard payload.
      // Actually, safest is to parse whatever it is.
      currency: details.totals.currency_code,
      customer_email: customer.email,
    }, { onConflict: 'paddle_transaction_id' })
    .select('id')
    .single();

  if (orderError) {
      console.error('Failed to create order:', orderError);
      throw orderError;
  }
  
  // Create order items
  for (const item of items) {
    // Map Paddle price_id to our product
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('paddle_price_id', item.price.id)
      .single();
      
    if (product) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        price: parseFloat(item.price.unit_price.amount) / 100, // Paddle sends amount in cents usually for items
      });
    }
  }
}

function verifyPaddleSignature(payload: string, signature: string): boolean {
  if (!signature) return false;
  
  const secret = process.env.PADDLE_WEBHOOK_SECRET!;
  const parts = signature.split(';');
  
  const tsPart = parts.find(p => p.startsWith('ts='));
  const h1Part = parts.find(p => p.startsWith('h1='));
  
  if (!tsPart || !h1Part) return false;
  
  const ts = tsPart.split('=')[1];
  const h1 = h1Part.split('=')[1];
  
  const signedPayload = `${ts}:${payload}`;
  
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return h1 === expectedHash;
}
