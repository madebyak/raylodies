import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Admin client for generating signed URLs and bypassing RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const noStore = "no-store";

  // 1. Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": noStore } },
    );
  }

  // 2) Verify access:
  // - paid purchase: orders/order_items
  // - free entitlement: product_entitlements
  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from("order_items")
    .select(
      `
      id,
      orders!inner (
        user_id,
        status
      ),
      products!inner (
        file_url,
        title
      )
    `,
    )
    .eq("product_id", productId)
    .eq("orders.user_id", user.id)
    .eq("orders.status", "completed")
    .limit(1)
    .maybeSingle();

  if (purchaseError) {
    console.error("Download purchase lookup failed:", purchaseError);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500, headers: { "Cache-Control": noStore } },
    );
  }

  // If no purchase, fallback to entitlement.
  let fileUrl: string | null = null;
  if (purchase) {
    const productsValue = (
      purchase as unknown as {
        products?:
          | { file_url?: string | null; title?: string | null }
          | { file_url?: string | null; title?: string | null }[];
      }
    ).products;
    const product = Array.isArray(productsValue)
      ? productsValue[0]
      : productsValue;
    fileUrl = product?.file_url ?? null;
  } else {
    const { data: ent, error: entErr } = await supabaseAdmin
      .from("product_entitlements")
      .select(
        `
        id,
        products!inner (
          file_url,
          title
        )
      `,
      )
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (entErr) {
      console.error("Download entitlement lookup failed:", entErr);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500, headers: { "Cache-Control": noStore } },
      );
    }

    if (!ent) {
      return NextResponse.json(
        { error: "No access to this product" },
        { status: 403, headers: { "Cache-Control": noStore } },
      );
    }

    const productsValue = (
      ent as unknown as {
        products?:
          | { file_url?: string | null; title?: string | null }
          | { file_url?: string | null; title?: string | null }[];
      }
    ).products;
    const product = Array.isArray(productsValue)
      ? productsValue[0]
      : productsValue;
    fileUrl = product?.file_url ?? null;
  }

  if (!fileUrl) {
    return NextResponse.json(
      { error: "No file attached to this product" },
      { status: 404, headers: { "Cache-Control": noStore } },
    );
  }

  // 3. Generate signed URL (60 minute expiry)
  const { data: signedUrl, error } = await supabaseAdmin.storage
    .from("product-files")
    .createSignedUrl(fileUrl, 3600); // 3600 seconds = 1 hour

  if (error || !signedUrl) {
    console.error("Signed URL Error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500, headers: { "Cache-Control": noStore } },
    );
  }

  // 4. Redirect to signed URL (browser will download)
  const res = NextResponse.redirect(signedUrl.signedUrl);
  res.headers.set("Cache-Control", noStore);
  return res;
}
