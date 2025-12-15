import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use service role for webhooks to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('🔔 Paddle webhook received');
  
  const body = await request.text();
  const signature = request.headers.get('paddle-signature');
  
  console.log('📝 Signature present:', !!signature);
  console.log('📝 Body length:', body.length);
  
  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    console.error('❌ Missing PADDLE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  // 1. Verify webhook signature
  if (!verifyPaddleSignature(body, signature!)) {
    console.error('❌ Invalid Paddle signature');
    console.error('Expected secret starts with:', process.env.PADDLE_WEBHOOK_SECRET?.substring(0, 10));
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  console.log('✅ Signature verified');
  
  const event = JSON.parse(body);
  console.log('📦 Event type:', event.event_type);
  console.log('📦 Transaction ID:', event.data?.id);
  
  // 2. Handle event types
  try {
    switch (event.event_type) {
      case 'transaction.completed':
        console.log('🎯 Processing transaction.completed');
        await handleTransactionCompleted(event.data);
        break;
      case 'transaction.updated': 
        console.log('🎯 Processing transaction.updated, status:', event.data.status);
        // Sometimes status changes to completed in an update
        if (event.data.status === 'completed') {
            await handleTransactionCompleted(event.data);
        }
        break;
      default:
        console.log('⏭️ Ignoring event type:', event.event_type);
    }
  } catch (error) {
    console.error('❌ Webhook handler failed:', error);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
  
  console.log('✅ Webhook processed successfully');
  return NextResponse.json({ received: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleTransactionCompleted(data: Record<string, any>) {
  const { id, customer, items, details, custom_data } = data;
  
  // Get email from multiple possible sources
  const customerEmail = customer?.email || custom_data?.userEmail || null;
  
  console.log('👤 Processing transaction:', id);
  console.log('👤 Custom data:', JSON.stringify(custom_data));
  console.log('👤 Customer object:', JSON.stringify(customer));
  console.log('👤 Customer email (resolved):', customerEmail);
  
  // ✅ CRITICAL: Use userId from customData first, fallback to email matching
  let userId: string | null = null;
  
  // Priority 1: Use the logged-in user ID we passed to Paddle
  if (custom_data?.userId) {
    console.log('🔍 Looking up user by ID:', custom_data.userId);
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', custom_data.userId)
      .single();
    
    if (userError) {
      console.error('❌ Error looking up user by ID:', userError);
    }
    
    if (existingUser) {
      console.log('✅ Found user by ID:', existingUser.id);
      userId = existingUser.id;
    } else {
      console.log('⚠️ User not found by ID');
    }
  }
  
  // Priority 2: Fallback to email matching
  if (!userId && customerEmail) {
    console.log('🔍 Looking up user by email:', customerEmail);
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('id')
      .eq('email', customerEmail)
      .single();
    
    if (emailError) {
      console.error('❌ Error looking up user by email:', emailError);
    }
    
    if (userByEmail) {
      console.log('✅ Found user by email:', userByEmail.id);
      userId = userByEmail.id;
    } else {
        console.warn(`⚠️ No user found for email ${customerEmail}. Order will be orphaned.`);
    }
  }
  
  if (!userId) {
    console.error('❌ Failed to identify user for transaction:', id);
    return;
  }
  
  console.log('✅ User identified:', userId);
  
  // Create order
  console.log('💰 Creating order with total:', details?.totals?.total);
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .upsert({
      paddle_transaction_id: id,
      user_id: userId,
      status: 'completed',
      total: parseFloat(details?.totals?.total || '0') / 100,
      currency: details?.totals?.currency_code || 'USD',
      customer_email: customerEmail,
    }, { onConflict: 'paddle_transaction_id' })
    .select('id')
    .single();

  if (orderError) {
      console.error('❌ Failed to create order:', orderError);
      throw orderError;
  }
  
  console.log('✅ Order created:', order.id);
  
  // Create order items
  for (const item of items) {
    console.log('🛒 Processing item with price_id:', item.price.id);
    
    // Map Paddle price_id to our product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, title')
      .eq('paddle_price_id', item.price.id)
      .single();
    
    if (productError) {
      console.error('❌ Error finding product:', productError);
    }
      
    if (product) {
      console.log('✅ Found product:', product.title);
      
      const { error: itemError } = await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        price: parseFloat(item.price.unit_price.amount) / 100,
      });
      
      if (itemError) {
        console.error('❌ Failed to create order item:', itemError);
      } else {
        console.log('✅ Order item created');
      }
    } else {
      console.warn('⚠️ Product not found for price_id:', item.price.id);
    }
  }
  
  console.log('🎉 Transaction processing complete');
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
