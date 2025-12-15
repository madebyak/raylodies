import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Admin client for generating signed URLs and bypassing RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  
  console.log('📥 Download request for product:', productId);
  
  // 1. Get authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ User not authenticated');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  console.log('👤 User:', user.id);
  
  // 2. Verify user purchased this product using admin client (bypasses RLS for reliable query)
  // First, check if user has a completed order with this product
  const { data: orderItems, error: queryError } = await supabaseAdmin
    .from('order_items')
    .select(`
      id,
      order_id,
      product_id
    `)
    .eq('product_id', productId);
  
  if (queryError) {
    console.error('❌ Error querying order_items:', queryError);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
  
  console.log('📦 Found order items:', orderItems?.length || 0);
  
  // Check if any of these order_items belong to a completed order for this user
  let hasValidPurchase = false;
  
  if (orderItems && orderItems.length > 0) {
    for (const item of orderItems) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('user_id, status')
        .eq('id', item.order_id)
        .single();
      
      if (order && order.user_id === user.id && order.status === 'completed') {
        hasValidPurchase = true;
        console.log('✅ Valid purchase found, order:', item.order_id);
        break;
      }
    }
  }
  
  if (!hasValidPurchase) {
    console.log('❌ No valid purchase found');
    return NextResponse.json(
      { error: 'Product not purchased or order not completed' }, 
      { status: 403 }
    );
  }
  
  // 3. Get product file URL
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('file_url, title')
    .eq('id', productId)
    .single();
  
  const fileUrl = product?.file_url;
  console.log('📁 File URL:', fileUrl);
  
  if (!fileUrl) {
    return NextResponse.json(
      { error: 'No file attached to this product' }, 
      { status: 404 }
    );
  }
  
  // 3. Generate signed URL (60 minute expiry)
  const { data: signedUrl, error } = await supabaseAdmin
    .storage
    .from('product-files')
    .createSignedUrl(fileUrl, 3600); // 3600 seconds = 1 hour
  
  if (error || !signedUrl) {
    console.error('Signed URL Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download link' }, 
      { status: 500 }
    );
  }
  
  // 4. Redirect to signed URL (browser will download)
  return NextResponse.redirect(signedUrl.signedUrl);
}
