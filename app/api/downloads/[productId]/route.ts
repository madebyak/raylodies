import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Admin client for generating signed URLs (bypasses RLS)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  
  // 1. Get authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Verify user purchased this product
  // We query order_items -> orders to check if there is a completed order for this user & product
  const { data: purchase } = await supabase
    .from('order_items')
    .select(`
      id,
      order:orders!inner(user_id, status),
      product:products!inner(file_url, title)
    `)
    .eq('product_id', productId)
    .eq('order.user_id', user.id)
    .eq('order.status', 'completed')
    .maybeSingle() as { data: {
      id: string;
      order: { user_id: string; status: string };
      product: { file_url: string | null; title: string };
    } | null };
  
  if (!purchase) {
    return NextResponse.json(
      { error: 'Product not purchased or order not completed' }, 
      { status: 403 }
    );
  }
  
  const fileUrl = purchase.product?.file_url;
  
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
