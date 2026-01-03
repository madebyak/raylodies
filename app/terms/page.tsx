import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service | Raylodies",
  description: "Terms of Service for using Raylodies and purchasing digital products.",
};

export default function TermsPage() {
  const toc = [
    { href: "#general", label: "General Conditions" },
    { href: "#payments", label: "Payments (Paddle)" },
    { href: "#delivery", label: "Delivery & Access" },
    { href: "#product-info", label: "Product Information" },
    { href: "#changes", label: "Changes to Products & Prices" },
    { href: "#licensing", label: "Licensing" },
    { href: "#ip", label: "Intellectual Property" },
    { href: "#conduct", label: "User Conduct" },
    { href: "#liability", label: "Limitation of Liability" },
    { href: "#indemnification", label: "Indemnification" },
    { href: "#law", label: "Governing Law" },
    { href: "#updates", label: "Changes to Terms" },
    { href: "#agreement", label: "Entire Agreement" },
  ];

  return (
    <LegalPageLayout
      title="Terms of Service"
      meta={
        <>
          Effective Date: <span className="text-white/70">22 December 2025</span>
          <span className="mx-2 text-white/20">•</span>
          Support:{" "}
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
      <div className="prose prose-invert prose-sm md:prose-base max-w-none
        prose-headings:font-light prose-headings:text-white prose-headings:scroll-mt-28
        prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-white/10
        prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-white/70 prose-p:leading-7 prose-p:my-4
        prose-li:text-white/70 prose-li:my-1
        prose-a:text-white/80 hover:prose-a:text-white prose-a:underline prose-a:decoration-white/20 hover:prose-a:decoration-white/60
        prose-strong:text-white prose-strong:font-medium
        prose-hr:my-12 prose-hr:border-white/10">
          <p>
            These Terms of Service (“Terms”) govern your access to and use of the Raylodies website
            and any purchase or use of our digital products, downloads, and related services
            (collectively, the “Service”). The Service is operated by Raylodies (“Raylodies”, “we”,
            “us”, “our”).
          </p>
          <p>
            By accessing the site and/or purchasing any product, you agree to these Terms. If you
            do not agree, do not use the Service.
          </p>

          <h2 id="general">1. General Conditions</h2>
          <h3>1.1 Eligibility</h3>
          <p>
            You must be able to form a legally binding contract in your jurisdiction to use the
            Service. If you use the Service on behalf of an organisation, you confirm you have
            authority to bind that organisation.
          </p>
          <h3>1.2 Right to Refuse Service</h3>
          <p>
            To the extent permitted by law, we may refuse service, restrict access, or cancel
            orders in cases of suspected fraud, misuse, policy violations, or abuse.
          </p>
          <h3>1.3 Changes</h3>
          <p>
            We may update products, pricing, and site content at any time. Continued use of the
            Service means you accept any posted updates.
          </p>

          <h2 id="payments">2. Merchant of Record &amp; Payments</h2>
          <h3>2.1 Merchant of Record</h3>
          <p>
            Checkout is handled by Paddle.com (“Paddle”), which acts as the Merchant of Record for
            purchases made through this website. Paddle processes payments and handles applicable
            tax collection where required.
          </p>
          <h3>2.2 Paddle Terms</h3>
          <p>
            By purchasing, you acknowledge you are purchasing from Paddle and agree to Paddle’s
            applicable buyer terms and policies, in addition to these Terms.
          </p>
          <h3>2.3 Billing Support</h3>
          <p>
            Payment, invoice, tax, and charge dispute support may be handled by Paddle. For product
            usage or access issues, contact{" "}
            <a href="mailto:hello@raylodies.com">hello@raylodies.com</a>.
          </p>

          <h2 id="delivery">3. Digital Products, Delivery &amp; Access</h2>
          <h3>3.1 Digital Products</h3>
          <p>
            Our products are digital goods (e.g., prompts, digital prints, mockups, blueprints,
            templates, and similar downloadable assets) unless explicitly stated otherwise.
          </p>
          <h3>3.2 Delivery</h3>
          <p>
            Products are typically delivered via download link or access instructions immediately
            after successful payment, or shortly thereafter.
          </p>
          <h3>3.3 Your Responsibility</h3>
          <p>
            You are responsible for ensuring your email address is correct and that your device/
            software can open the files. We are not responsible for issues caused by unsupported
            software, outdated versions, or user error.
          </p>

          <h2 id="product-info">4. Product Information &amp; Availability</h2>
          <p>
            We aim to display products accurately. However, previews are illustrative and may vary
            by device, software, or AI model behaviour (where relevant). We do not guarantee that
            product descriptions, previews, or any site content are error-free.
          </p>

          <h2 id="changes">5. Modifications to Products &amp; Prices</h2>
          <p>
            Prices and product contents may change at any time. We may modify or discontinue
            products without notice. Where required by law, changes will not affect orders already
            completed.
          </p>

          <h2 id="licensing">6. Licensing Terms</h2>
          <p>
            These licensing terms explain what you may and may not do with what you purchase.
          </p>

          <h3>6.1 Definitions</h3>
          <ul>
            <li>
              <strong>Digital Products</strong>: any digital item sold on the site, including
              prompts, prompt packs, digital prints, mockups, blueprints, templates, design assets,
              files, guides, or downloads.
            </li>
            <li>
              <strong>Licensed Content</strong>: the Digital Products you purchase (including any
              included files, text, layouts, and documentation).
            </li>
            <li>
              <strong>End Product</strong>: a finished outcome you create using the Licensed
              Content (e.g., brand design, marketing creative, social post, video, website mock,
              rendered image, client presentation, or generated AI output).
            </li>
          </ul>

          <h3>6.2 Licence Grant</h3>
          <p>
            Subject to your compliance with these Terms and full payment, Raylodies grants you a
            limited, non-exclusive, non-transferable, non-sublicensable licence to access and use
            the Licensed Content in accordance with these Terms.
          </p>
          <p>
            Unless your product page states otherwise, your purchase includes a Standard Licence
            (Sections 6.3–6.11).
          </p>

          <h3>6.3 Standard Licence — Allowed Uses</h3>
          <p>Under the Standard Licence, you may:</p>
          <ul>
            <li>Use the Licensed Content for personal use and commercial projects.</li>
            <li>
              Modify or adapt Licensed Content to create End Products, as long as you do not
              distribute the Licensed Content itself as a standalone file.
            </li>
            <li>
              Use Licensed Content in client work, provided the client receives only the End
              Product (exported visuals, flattened files, rendered outputs) and not the original
              files or packs, unless the client purchases their own licence.
            </li>
          </ul>

          <h3>6.4 Prompts &amp; Prompt Packs — Special Rules</h3>
          <p>If you purchase prompts or prompt packs, you may:</p>
          <ul>
            <li>Use prompts to generate outputs for personal or commercial use.</li>
            <li>Edit prompts for your own workflow.</li>
          </ul>
          <p>You may not:</p>
          <ul>
            <li>
              Share, publish, resell, redistribute, or leak the prompts (or any substantial
              portion), including in public posts, groups, courses, or marketplaces, unless you
              have written permission from Raylodies.
            </li>
            <li>Sell prompts as standalone prompt products or bundles that compete with the Licensed Content.</li>
          </ul>
          <p>
            <strong>AI Output Note:</strong> AI-generated outputs can vary depending on model
            updates, settings, seed, and platform rules. We do not guarantee specific results.
          </p>

          <h3>6.5 Digital Prints — Special Rules</h3>
          <p>Unless the product page states otherwise, you may:</p>
          <ul>
            <li>Download and use digital prints for personal display and personal printing.</li>
            <li>
              Use them inside End Products (as part of a composition) where the print is not being
              redistributed as a standalone file.
            </li>
          </ul>
          <p>You may not under the Standard Licence:</p>
          <ul>
            <li>Sell, license, or distribute the digital print as a standalone artwork file.</li>
            <li>
              Sell the print on merchandise, print-on-demand, marketplaces, or physical print sales
              as the main product (unless you have an Extended/Resale Licence if offered).
            </li>
          </ul>

          <h3>6.6 Mockups, Templates &amp; Assets — Special Rules</h3>
          <p>
            You may use mockups/templates/assets to present or market your work or your client’s
            work, but you may not:
          </p>
          <ul>
            <li>
              Resell or redistribute mockups/templates/assets as standalone items (original or
              modified), including packs/bundles/libraries.
            </li>
            <li>
              Give away source files to clients, teams, or third parties unless they have their own
              licence.
            </li>
          </ul>

          <h3>6.7 Blueprints / Guides / Concept Files — Disclaimer + Limits</h3>
          <p>
            Blueprints or guides may be creative, conceptual, or educational. They are not
            professional engineering, architectural, medical, or legal advice. You are responsible
            for ensuring compliance with safety standards, regulations, and real-world suitability
            before using any blueprint in practical implementation.
          </p>

          <h3>6.8 Prohibited Uses (All Products)</h3>
          <p>You may not:</p>
          <ul>
            <li>
              Resell, redistribute, share, gift, upload, or make available the Licensed Content
              (original or modified) as standalone files, including via file-sharing or “free
              downloads”.
            </li>
            <li>Create or sell competing packs/libraries where the primary value is the Licensed Content.</li>
            <li>Remove or obscure proprietary notices (if present).</li>
            <li>
              Claim ownership of the Licensed Content itself, register it as a trademark/copyright,
              or misrepresent authorship.
            </li>
            <li>Use the Licensed Content in unlawful, infringing, or misleading ways.</li>
          </ul>

          <h3>6.9 Seat / Team Use</h3>
          <p>
            Unless the product page states otherwise, purchases are for single-user use. If a
            team/studio/organisation will access the files, you must purchase a multi-seat option
            (if available) or obtain written permission.
          </p>

          <h3>6.10 AI / Model Training Restriction</h3>
          <p>
            Unless explicitly permitted in writing by Raylodies, you may not use the Licensed
            Content to train, fine-tune, or improve any AI/ML model or to build datasets for
            training (including scraping, dataset packaging, or bulk ingestion).
          </p>

          <h3>6.11 Ownership &amp; Reservation of Rights</h3>
          <p>
            Raylodies (and/or its licensors) retains all rights, title, and interest in the Licensed
            Content. You receive a licence to use it — not ownership.
          </p>

          <h3>6.12 Product-Specific Terms</h3>
          <p>
            If a product page or included file specifies additional licence terms, those terms apply
            to that product. If there is a conflict, the product-specific terms control.
          </p>

          <h2 id="ip">7. Intellectual Property</h2>
          <p>
            All site content and Licensed Content are owned by Raylodies or its licensors and
            protected by applicable intellectual property laws. Except for the licence granted
            above, no rights are granted.
          </p>

          <h2 id="conduct">8. User Conduct</h2>
          <p>You agree not to misuse the Service, including attempting to:</p>
          <ul>
            <li>bypass payment mechanisms,</li>
            <li>access systems without authorisation,</li>
            <li>upload malware,</li>
            <li>use the Service for fraud or abusive behaviour,</li>
            <li>violate third-party rights or applicable laws.</li>
          </ul>

          <h2 id="liability">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Raylodies (including its employees, contractors,
            affiliates, licensors, and service providers) will not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or loss of profits, revenue,
            data, or goodwill arising from your use of the Service or Digital Products.
          </p>
          <p>
            Where liability cannot be excluded, it is limited to the amount you paid for the
            specific product giving rise to the claim (or the minimum required by law, if higher).
          </p>

          <h2 id="indemnification">10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Raylodies and its affiliates, officers,
            directors, employees, and agents from claims, liabilities, damages, and expenses
            (including reasonable legal fees) arising from your breach of these Terms or misuse of
            the Service.
          </p>

          <h2 id="law">11. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the United States of America, without regard to
            conflict of law principles, except that payment disputes may be handled through
            Paddle’s processes as Merchant of Record.
          </p>

          <h2 id="updates">12. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Updates will be posted with a new
            Effective Date. Continued use after changes means you accept the updated Terms.
          </p>

          <h2 id="agreement">13. Severability &amp; Entire Agreement</h2>
          <p>
            If any part of these Terms is found unenforceable, the remainder remains in effect.
            These Terms and the policies referenced form the entire agreement regarding the
            Service.
          </p>

          <hr />
          <p className="text-white/60">
            Also see: <Link href="/privacy">Privacy Policy</Link> and{" "}
            <Link href="/refund">Refund Policy</Link>.
          </p>
        </div>
    </LegalPageLayout>
  );
}


