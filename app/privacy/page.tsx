import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Raylodies",
  description: "Privacy Policy describing how Raylodies collects and uses personal information.",
};

export default function PrivacyPage() {
  return (
    <section className="px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[900px] mx-auto">
        <header className="mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl font-light text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-white/50 text-sm font-light">
            Effective Date: <span className="text-white/70">22 December 2025</span>
            <span className="mx-2 text-white/20">•</span>
            Contact:{" "}
            <a
              href="mailto:hello@raylodies.com"
              className="text-white/70 hover:text-white transition-colors"
            >
              hello@raylodies.com
            </a>
          </p>
        </header>

        <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:font-light prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white">
          <p>
            This Privacy Policy describes how we collect, use, and share personal information when
            you visit or purchase from our website.
          </p>

          <h2>1. Information We Collect</h2>
          <ul>
            <li>
              <strong>Device Information</strong>: browser type, IP address, time zone, cookies, and
              usage data.
            </li>
            <li>
              <strong>Order Information</strong>: name, billing details, email, and phone number (if
              provided).
            </li>
            <li>
              <strong>Support Communications</strong>: information you provide when contacting us.
            </li>
          </ul>

          <h2>2. How We Use Information</h2>
          <p>We use information to:</p>
          <ul>
            <li>deliver products and provide access,</li>
            <li>communicate about orders and support,</li>
            <li>detect and prevent fraud/abuse,</li>
            <li>improve site performance and offerings,</li>
            <li>comply with legal/accounting obligations.</li>
          </ul>

          <h2>3. Payments</h2>
          <p>
            Purchases are processed by Paddle as Merchant of Record. Paddle processes payment and
            billing data under its own privacy policy. We do not store full payment card details.
          </p>

          <h2>4. Cookies &amp; Analytics</h2>
          <p>
            We may use cookies and similar technologies for functionality and analytics. You can
            manage cookies through your browser settings.
          </p>

          <h2>5. Sharing</h2>
          <p>We share information only as needed with:</p>
          <ul>
            <li>Paddle (payments/tax/invoicing),</li>
            <li>service providers supporting hosting, analytics, or email delivery,</li>
            <li>authorities where required by law, or to protect rights and prevent fraud.</li>
          </ul>
          <p>We do not sell your personal information.</p>

          <h2>6. Data Retention</h2>
          <p>
            We retain order and support records as required for business, accounting, and legal
            compliance, then delete or anonymise when no longer needed.
          </p>

          <h2>7. Security</h2>
          <p>
            We use reasonable technical and organisational safeguards, but no system is 100% secure.
          </p>

          <h2>8. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, or delete your
            personal information. Contact us at <a href="mailto:hello@raylodies.com">hello@raylodies.com</a>.
          </p>

          <h2>9. International Transfers</h2>
          <p>
            Your information may be processed outside your country depending on Paddle and our
            service providers. We take steps intended to ensure appropriate safeguards where
            required.
          </p>

          <h2>10. Changes</h2>
          <p>
            We may update this policy and will post changes with a new Effective Date.
          </p>

          <hr />
          <p className="text-white/60">
            Also see: <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/refund">Refund Policy</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}


