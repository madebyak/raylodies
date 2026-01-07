"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Download, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import { BuyButton } from "@/components/store/BuyButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  productId: string;
  productSlug: string;
  paddlePriceId: string | null;
  isFree: boolean;
  hasFile: boolean;
};

export default function ProductPurchasePanel({
  productId,
  productSlug,
  paddlePriceId,
  isFree,
  hasFile,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

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

  async function claimFree() {
    if (!hasFile) {
      toast.error("This product doesn't have a downloadable file yet.");
      return;
    }
    setIsClaiming(true);
    try {
      const res = await fetch(`/api/free-claim/${productId}`, {
        method: "POST",
        cache: "no-store",
      });

      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(`/store/${productSlug}`)}`);
        return;
      }

      if (!res.ok) {
        const msg = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(msg?.error || "Failed to claim free product.");
        return;
      }

      setHasPurchased(true);
      toast.success("Added to your downloads.");
      router.push("/account/downloads");
    } finally {
      setIsClaiming(false);
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
      {isFree ? (
        <>
          <Button
            type="button"
            className="w-full flex items-center justify-center gap-2"
            onClick={claimFree}
            disabled={isClaiming || !hasFile}
          >
            <Download size={18} />
            {hasFile ? (isClaiming ? "Claiming…" : "Get Free Download") : "No file attached"}
          </Button>
          <p className="text-center text-xs text-white/30">
            Free download • Login required
          </p>
        </>
      ) : paddlePriceId ? (
        <>
          <BuyButton priceId={paddlePriceId} productId={productId} productSlug={productSlug} />
          <p className="text-center text-[11px] text-white/40 leading-relaxed">
            By purchasing, you agree to our{" "}
            <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/refund" className="text-white/70 hover:text-white transition-colors">
              Refund Policy
            </Link>
            .
          </p>
        </>
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
        {isFree ? "Instant access after login" : "Secure payment via Paddle • Instant download"}
      </p>
    </div>
  );
}


