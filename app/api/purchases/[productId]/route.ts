import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
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
      { authenticated: false, hasPurchased: false },
      { headers: noStoreHeaders }
    );
  }

  const admin = createAdminClient();
  const { data: purchase, error } = await admin
    .from("order_items")
    .select(
      `
      id,
      orders!inner (
        user_id,
        status
      )
    `
    )
    .eq("product_id", productId)
    .eq("orders.user_id", user.id)
    .eq("orders.status", "completed")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Purchase lookup failed:", error);
    return NextResponse.json(
      { authenticated: true, hasPurchased: false },
      { status: 500, headers: noStoreHeaders }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      hasPurchased: !!purchase,
    },
    { headers: noStoreHeaders }
  );
}


