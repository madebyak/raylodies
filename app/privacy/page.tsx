import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Raylodies",
  description:
    "Privacy Policy describing how Raylodies collects and uses personal information.",
};

export default function PrivacyPage() {
  const toc = [
    { href: "#info", label: "Information We Collect" },
    { href: "#use", label: "How We Use Information" },
    { href: "#payments", label: "Payments" },
    { href: "#cookies", label: "Cookies & Analytics" },
    { href: "#sharing", label: "Sharing" },
    { href: "#retention", label: "Data Retention" },
    { href: "#security", label: "Security" },
    { href: "#rights", label: "Your Rights" },
    { href: "#transfers", label: "International Transfers" },
    { href: "#changes", label: "Changes" },
  ];

  return (
    <LegalPageLayout
      title="Privacy Policy"
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
        <p>
          This Privacy Policy describes how personal information is collected,
          used, and shared when you visit or purchase from our website. Raylodies
          is operated by Moonwhale LLC, which is the legal entity responsible for
          this website.
        </p>

        <h2 id="info">1. Information We Collect</h2>
        <ul>
          <li>
            <strong>Device Information</strong>: browser type, IP address, time
            zone, cookies, and usage data.
          </li>
          <li>
            <strong>Order Information</strong>: name, billing details, email,
            and phone number (if provided).
          </li>
          <li>
            <strong>Support Communications</strong>: information you provide
            when contacting us.
          </li>
        </ul>

        <h2 id="use">2. How We Use Information</h2>
        <p>We use information to:</p>
        <ul>
          <li>deliver products and provide access,</li>
          <li>communicate about orders and support,</li>
          <li>detect and prevent fraud/abuse,</li>
          <li>improve site performance and offerings,</li>
          <li>comply with legal/accounting obligations.</li>
        </ul>

        <h2 id="payments">3. Payments</h2>
        <p>
          Purchases are processed by Paddle as Merchant of Record. Paddle
          processes payment and billing data under its own privacy practices. We
          do not store full payment card details.
        </p>

        <h2 id="cookies">4. Cookies &amp; Analytics</h2>
        <p>
          We may use cookies and similar technologies for functionality and
          analytics. You can manage cookies through your browser settings.
        </p>

        <h2 id="sharing">5. Sharing</h2>
        <p>We share information only as needed with:</p>
        <ul>
          <li>Paddle (payments/tax/invoicing),</li>
          <li>
            service providers supporting hosting, analytics, or email delivery,
          </li>
          <li>
            authorities where required by law, or to protect rights and prevent
            fraud.
          </li>
        </ul>
        <p>We do not sell your personal information.</p>

        <h2 id="retention">6. Data Retention</h2>
        <p>
          We retain order and support records as required for business,
          accounting, and legal compliance, then delete or anonymise when no
          longer needed.
        </p>

        <h2 id="security">7. Security</h2>
        <p>
          We use reasonable technical and organisational safeguards, but no
          system is 100% secure.
        </p>

        <h2 id="rights">8. Your Rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, or
          delete your personal information. Contact us at{" "}
          <a href="mailto:hello@raylodies.com">hello@raylodies.com</a>.
        </p>

        <h2 id="transfers">9. International Transfers</h2>
        <p>
          Your information may be processed outside your country depending on
          Paddle and our service providers. We take steps intended to ensure
          appropriate safeguards where required.
        </p>

        <h2 id="changes">10. Changes</h2>
        <p>
          We may update this policy and will post changes with a new Effective
          Date.
        </p>

        <hr />
        <p className="text-white/60">
          Also see: <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/refund">Refund Policy</Link>.
        </p>
      </div>
    </LegalPageLayout>
  );
}
