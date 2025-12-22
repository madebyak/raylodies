"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Download, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import { BuyButton } from "@/components/store/BuyButton";

type Props = {
  productId: string;
  productSlug: string;
  paddlePriceId: string | null;
};

export default function ProductPurchasePanel({
  productId,
  productSlug,
  paddlePriceId,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        const res = await fetch(`/api/purchases/${productId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = (await res.json()) as { hasPurchased?: boolean };
        if (!mounted) return;
        setHasPurchased(!!json.hasPurchased);
      } catch {
        // If unauthenticated or endpoint errors, default to "not purchased"
        if (!mounted) return;
        setHasPurchased(false);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [productId]);

  async function refresh() {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/purchases/${productId}`, { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { hasPurchased?: boolean };
      setHasPurchased(!!json.hasPurchased);
    } finally {
      setIsRefreshing(false);
    }
  }

  // When the tab is refocused after checkout, re-check purchase status.
  useEffect(() => {
    if (hasPurchased) return;
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPurchased, productId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-11 w-full rounded-lg bg-white/5 animate-pulse" />
        <div className="h-3 w-2/3 mx-auto rounded bg-white/5 animate-pulse" />
      </div>
    );
  }

  return hasPurchased ? (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-4 rounded-lg">
        <Check size={20} />
        <span>You own this product</span>
      </div>
      <Link href="/account/downloads">
        <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
          <Download size={18} />
          Go to Downloads
        </Button>
      </Link>
    </div>
  ) : (
    <div className="space-y-4">
      {paddlePriceId ? (
        <BuyButton priceId={paddlePriceId} productId={productId} productSlug={productSlug} />
      ) : (
        <Button disabled className="w-full opacity-50 cursor-not-allowed">
          Not Available for Purchase
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        className="w-full flex items-center justify-center gap-2"
        onClick={refresh}
        disabled={isRefreshing}
      >
        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        {isRefreshing ? "Refreshing…" : "Refresh purchase status"}
      </Button>
      <p className="text-center text-xs text-white/30">
        Secure payment via Paddle • Instant download
      </p>
    </div>
  );
}


