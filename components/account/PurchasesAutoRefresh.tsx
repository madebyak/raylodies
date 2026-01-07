"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PurchasesAutoRefresh({
  enabled,
  orderCount,
}: {
  enabled: boolean;
  orderCount: number;
}) {
  const router = useRouter();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    if (!notifiedRef.current) {
      notifiedRef.current = true;
      toast.message("Payment received", {
        description:
          "We’re confirming your purchase. This page will refresh automatically.",
      });
    }

    // If we already have at least one order, stop refreshing and clean URL.
    if (orderCount > 0) {
      router.replace("/account/purchases");
      toast.success("Purchase updated", {
        description:
          "If you don’t see your new item yet, it may take a few seconds to appear.",
      });
      return;
    }

    let attempts = 0;
    const maxAttempts = 20; // ~60s @ 3s interval
    const interval = setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        toast.message("Still processing", {
          description:
            "If this takes longer, refresh in a minute or check Downloads later.",
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [enabled, orderCount, router]);

  if (!enabled) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-sm text-white/60">
      <div className="font-light">
        Processing your purchase…{" "}
        <span className="text-white/40">
          This page will auto-refresh for about a minute.
        </span>
      </div>
    </div>
  );
}
