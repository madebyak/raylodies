import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Refund Policy | Raylodies",
  description: "Refund Policy for Raylodies digital products.",
};

export default function RefundPage() {
  const toc = [
    { href: "#final", label: "All Sales Final" },
    { href: "#withdrawal", label: "Immediate Delivery" },
    { href: "#issues", label: "Delivery/Defect Issues" },
    { href: "#no-refunds", label: "No Refunds Cases" },
    { href: "#disputes", label: "Chargebacks & Disputes" },
    { href: "#payments", label: "Payments" },
  ];

  return (
    <LegalPageLayout
      title="Refund Policy"
      meta={
        <>
          Effective Date:{" "}
          <span className="text-white/70">22 December 2025</span>
          <span className="mx-2 text-white/20">•</span>
          Contact:{" "}
          <a
            href="mailto:hello@raylodies.com"
            className="text-white/70 hover:text-white transition-colors"
          >
            hello@raylodies.com
          </a>
        </>
      }
      toc={toc}
    >
      <div
        className="prose prose-invert prose-base md:prose-lg max-w-none
        prose-headings:font-light prose-headings:text-white prose-headings:scroll-mt-28
        prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-white/10
        prose-p:text-white/70 prose-p:leading-8 prose-p:my-5
        prose-li:text-white/70 prose-li:leading-7 prose-li:my-2
        prose-a:text-white/80 hover:prose-a:text-white prose-a:underline prose-a:decoration-white/20 hover:prose-a:decoration-white/60
        prose-strong:text-white prose-strong:font-medium
        prose-hr:my-12 prose-hr:border-white/10"
      >
        <h2 id="final">1. Digital Goods — All Sales Final</h2>
        <p>
          All products are digital goods delivered electronically. Once access
          or delivery is provided, the product cannot be returned like a
          physical item. Accordingly, all sales are final, except where required
          by applicable law.
        </p>

        <h2 id="withdrawal">
          2. Immediate Delivery &amp; Withdrawal Rights (Where Applicable)
        </h2>
        <p>
          By completing a purchase, you acknowledge that digital content may be
          supplied immediately. Where applicable, you consent to immediate
          delivery and understand that statutory cancellation/withdrawal rights
          for digital content may not apply once delivery begins.
        </p>

        <h2 id="issues">3. Access / Delivery / Defect Issues</h2>
        <p>If you experience any of the following:</p>
        <ul>
          <li>no delivery received,</li>
          <li>download link failure that persists,</li>
          <li>corrupted or materially defective file,</li>
        </ul>
        <p>
          contact us with your order details. We (and/or Paddle) will provide a
          replacement file, restore access, or another reasonable remedy. If we
          cannot resolve the issue, we may consider a refund where required by
          law or at our discretion.
        </p>

        <h2 id="no-refunds">
          4. No Refunds for Change of Mind or Compatibility
        </h2>
        <p>Refunds are not provided for:</p>
        <ul>
          <li>change of mind,</li>
          <li>purchasing the wrong product,</li>
          <li>lack of required software/skills,</li>
          <li>
            preference or dissatisfaction where previews accurately represent
            the product.
          </li>
        </ul>

        <h2 id="disputes">5. Chargebacks &amp; Disputes</h2>
        <p>
          If you believe a charge is incorrect or unauthorised, contact Paddle
          and/or us first. We reserve the right to dispute chargebacks where
          there is evidence of legitimate purchase and digital delivery, and to
          restrict future purchases in cases of abuse or fraud.
        </p>

        <h2 id="payments">6. Payments</h2>
        <p>
          Payments are processed by Paddle as Merchant of Record. Paddle’s
          dispute/refund processes may also apply.
        </p>

        <hr />
        <p className="text-white/60">
          Also see: <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </LegalPageLayout>
  );
}
