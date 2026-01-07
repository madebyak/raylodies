import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

type PaddleEvent = {
  event_type?: string;
  data?: unknown;
};

type PaddleTransactionData = {
  id: string;
  status?: string;
  customer?: { email?: string | null } | null;
  items?: Array<{
    price: {
      id: string;
      unit_price: { amount: string };
    };
  }>;
  details?: {
    totals?: { total?: string | null; currency_code?: string | null } | null;
  } | null;
  custom_data?: { userId?: string; userEmail?: string | null } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asTransactionData(value: unknown): PaddleTransactionData | null {
  if (!isRecord(value)) return null;
  const id = value["id"];
  if (typeof id !== "string") return null;
  return value as unknown as PaddleTransactionData;
}

// Use service role for webhooks to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  const noStoreHeaders = { "Cache-Control": "no-store" };
  const body = await request.text();
  const signature = request.headers.get("paddle-signature");

  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    console.error("❌ Missing PADDLE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Configuration error" },
      { status: 500, headers: noStoreHeaders },
    );
  }

  // 1. Verify webhook signature
  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400, headers: noStoreHeaders },
    );
  }
  if (!verifyPaddleSignature(body, signature)) {
    console.error("❌ Invalid Paddle signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401, headers: noStoreHeaders },
    );
  }

  let event: PaddleEvent;
  try {
    const parsed = JSON.parse(body) as unknown;
    if (!isRecord(parsed)) {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400, headers: noStoreHeaders },
      );
    }
    event = parsed as PaddleEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  // 2. Handle event types
  try {
    const data = asTransactionData(event.data);
    switch (event.event_type) {
      case "transaction.completed":
        if (data) await handleTransactionCompleted(data);
        break;
      case "transaction.updated":
        // Sometimes status changes to completed in an update
        if (data?.status === "completed") {
          await handleTransactionCompleted(data);
        }
        break;
      default:
      // Ignore
    }
  } catch (error) {
    console.error("❌ Webhook handler failed:", error);
    return NextResponse.json(
      { error: "Handler failed" },
      { status: 500, headers: noStoreHeaders },
    );
  }

  return NextResponse.json({ received: true }, { headers: noStoreHeaders });
}

async function handleTransactionCompleted(data: PaddleTransactionData) {
  const { id, customer, items, details, custom_data } = data;

  // Get email from multiple possible sources
  const customerEmail = customer?.email || custom_data?.userEmail || null;

  // ✅ CRITICAL: Use userId from customData first, fallback to email matching
  let userId: string | null = null;

  // Priority 1: Use the logged-in user ID we passed to Paddle
  if (custom_data?.userId) {
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", custom_data.userId)
      .single();

    if (userError) {
      console.error("❌ Error looking up user by ID:", userError);
    }

    if (existingUser) {
      userId = existingUser.id;
    }
  }

  // Priority 2: Fallback to email matching
  if (!userId && customerEmail) {
    const { data: userByEmail, error: emailError } = await supabase
      .from("users")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (emailError) {
      console.error("❌ Error looking up user by email:", emailError);
    }

    if (userByEmail) {
      userId = userByEmail.id;
    } else {
      console.warn(
        `No user found for email ${customerEmail}. Transaction ${id} will be ignored.`,
      );
    }
  }

  if (!userId) {
    console.error("❌ Failed to identify user for transaction:", id);
    return;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .upsert(
      {
        paddle_transaction_id: id,
        user_id: userId,
        status: "completed",
        total: parseFloat(details?.totals?.total || "0") / 100,
        currency: details?.totals?.currency_code || "USD",
        customer_email: customerEmail,
      },
      { onConflict: "paddle_transaction_id" },
    )
    .select("id")
    .single();

  if (orderError) {
    console.error("❌ Failed to create order:", orderError);
    throw orderError;
  }

  // Create order items
  for (const item of items ?? []) {
    // Map Paddle price_id to our product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, title")
      .eq("paddle_price_id", item.price.id)
      .single();

    if (productError) {
      console.error("❌ Error finding product:", productError);
    }

    if (product) {
      // Idempotency: avoid duplicates on webhook retries
      const { data: existingItem, error: existingError } = await supabase
        .from("order_items")
        .select("id")
        .eq("order_id", order.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (existingError) {
        console.error("❌ Failed checking existing order item:", existingError);
      }

      if (!existingItem) {
        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: product.id,
          price: parseFloat(item.price.unit_price.amount) / 100,
        });

        if (itemError) {
          console.error("❌ Failed to create order item:", itemError);
        }
      }
    } else {
      console.warn("⚠️ Product not found for price_id:", item.price.id);
    }
  }
}

function verifyPaddleSignature(payload: string, signature: string): boolean {
  if (!signature) return false;

  const secret = process.env.PADDLE_WEBHOOK_SECRET!;
  const parts = signature.split(";");

  const tsPart = parts.find((p) => p.startsWith("ts="));
  const h1Part = parts.find((p) => p.startsWith("h1="));

  if (!tsPart || !h1Part) return false;

  const ts = tsPart.split("=")[1];
  const h1 = h1Part.split("=")[1];

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  // Basic replay protection: only accept signatures close to "now" (5 minutes).
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - tsNum) > 300) return false;

  const signedPayload = `${ts}:${payload}`;

  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  try {
    const expected = Buffer.from(expectedHash, "hex");
    const received = Buffer.from(h1, "hex");
    if (expected.length !== received.length) return false;
    return crypto.timingSafeEqual(received, expected);
  } catch {
    return false;
  }
}
