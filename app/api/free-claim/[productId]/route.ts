import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const noStoreHeaders = { "Cache-Control": "no-store" };

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: noStoreHeaders },
    );
  }

  const admin = createAdminClient();

  // Validate product is free + published.
  const { data: product, error: productError } = await admin
    .from("products")
    .select("id, is_free, is_published, file_url")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    console.error("Free-claim product lookup failed:", productError);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500, headers: noStoreHeaders },
    );
  }

  if (!product || !product.is_published) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: noStoreHeaders },
    );
  }

  if (!product.is_free) {
    return NextResponse.json(
      { error: "Not a free product" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  if (!product.file_url) {
    return NextResponse.json(
      { error: "No file attached to this product" },
      { status: 409, headers: noStoreHeaders },
    );
  }

  // Ensure a matching profile row exists (some envs may not have the auth trigger).
  if (user.email) {
    await admin.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        full_name:
          (user.user_metadata as { full_name?: string; name?: string } | null)
            ?.full_name ||
          (user.user_metadata as { name?: string } | null)?.name ||
          null,
        avatar_url:
          (
            user.user_metadata as {
              avatar_url?: string;
              picture?: string;
            } | null
          )?.avatar_url ||
          (user.user_metadata as { picture?: string } | null)?.picture ||
          null,
      },
      { onConflict: "id" },
    );
  }

  const { error: entitlementError } = await admin
    .from("product_entitlements")
    .upsert(
      {
        user_id: user.id,
        product_id: productId,
        source: "free",
      },
      { onConflict: "user_id,product_id" },
    );

  if (entitlementError) {
    console.error("Free-claim entitlement upsert failed:", entitlementError);
    return NextResponse.json(
      { error: "Failed to claim product" },
      { status: 500, headers: noStoreHeaders },
    );
  }

  return NextResponse.json({ claimed: true }, { headers: noStoreHeaders });
}
