## Raylodies SEO / Google Stack Setup (Owner Checklist)

This doc lists **everything you need to do on your side** to make `raylodies.com` fully set up for Google Search + analytics.

**Domain**: `https://raylodies.com`

---

### 0) Prerequisites (you need access to)

- **Domain DNS** (wherever you manage `raylodies.com` records)
- **Google account** you’ll use as the “owner” (recommended: a business Google account)
- **Deployment environment variables** (wherever you host Next.js)

---

### 1) Set production env vars (required)

Set these in production (Vercel/host):

- **`NEXT_PUBLIC_SITE_URL`**: `https://raylodies.com`
- **`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`**: (from Search Console HTML tag verification)

Notes:

- If you don’t set `NEXT_PUBLIC_SITE_URL`, the code defaults to `https://raylodies.com` in production.

---

### 2) Google Search Console (GSC) — REQUIRED

#### 2.1 Add property (best practice: Domain property)

1. Go to Google Search Console
2. Click **Add property**
3. Choose **Domain** and enter: `raylodies.com`
4. Verify via DNS:
   - GSC will give you a **TXT record** to add to your DNS.
   - Add it and wait for DNS propagation (can be minutes to hours).
5. Click **Verify**

Why Domain property:

- Covers **all protocols and subdomains** (http/https, www/non-www).

#### 2.2 Submit sitemap

1. In GSC → **Sitemaps**
2. Add sitemap URL:
   - `https://raylodies.com/sitemap.xml`
3. Submit

#### 2.3 Confirm robots + indexing behavior

1. In GSC → **URL Inspection**
2. Test:
   - `https://raylodies.com/`
   - `https://raylodies.com/store`
   - `https://raylodies.com/work`
   - A product page: `https://raylodies.com/store/<slug>`
   - A project page: `https://raylodies.com/work/<slug>`
3. If not indexed: click **Request indexing**

#### 2.4 Enable alerts and monitor the right reports

- **Indexing → Pages**: watch for “Crawled - currently not indexed”, “Duplicate”, “Alternate page with proper canonical”.
- **Experience → Core Web Vitals**: real user data.
- **Security & Manual actions**: make sure there are none.
- **Performance → Search results**: queries/pages/CTR, compare last 28 days vs previous.

#### 2.5 (Recommended) Connect GSC to GA4

Do this after GA4 is set up (section 3).

---

### 3) Google Analytics 4 (GA4) — REQUIRED (for measurement + SEO feedback)

#### 3.1 Create GA4 property

1. Go to Google Analytics → Admin
2. Create **Property**: “Raylodies”
3. Create **Web data stream**
4. Enter website URL: `https://raylodies.com`
5. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`)

#### 3.2 Configure GA4 settings (recommended)

- Enable **Enhanced measurement** for the web stream.
- Set data retention (Admin → Data settings → Data retention) to what you prefer (e.g. 14 months).
- Filter internal traffic if needed (optional).

#### 3.3 Connect GA4 ↔ GSC (recommended)

1. GA → Admin → Product Links → **Search Console Links**
2. Link the GSC property you created in section 2

#### 3.4 What to send back to the developer (me)

- Your **GA4 Measurement ID** (`G-...`)
- Whether you want GA4 via **GTM only** (recommended) or direct GA snippet (not recommended if using GTM)

---

### 4) Google Tag Manager (GTM) — STRONGLY RECOMMENDED

GTM makes analytics/conversion tracking manageable without redeploys.

#### 4.1 Create GTM container

1. Go to Google Tag Manager
2. Create account/container:
   - Container name: “Raylodies”
   - Target platform: **Web**
3. Copy the **Container ID** (looks like `GTM-XXXXXXX`)

#### 4.2 Add GA4 via GTM (recommended path)

1. In GTM → Tags → New → **Google tag**
2. Enter your **GA4 Measurement ID** (`G-...`)
3. Trigger: **All Pages**
4. Publish

#### 4.3 Add core conversion events (recommended)

These events matter for SEO/business feedback loops:

- **`generate_lead`**: when the “Start a Project” form is successfully submitted
- **`sign_up`**: after signup completes
- **`login`**: after login completes (optional)
- **`begin_checkout`**: when Paddle checkout opens (optional)
- **`purchase`**: when purchase is confirmed (best tracked server-side from Paddle webhook if you later add Ads/analytics attribution)

Implementation note:

- Some of these need small code hooks (dataLayer pushes or events). Tell me which conversions you care about most and I’ll wire them.

#### 4.4 Consent Mode (recommended if you market in EU/UK)

If you need cookie consent:

- Use a CMP (Cookiebot, OneTrust, etc.)
- Configure **Google Consent Mode v2** in GTM

#### 4.5 What to send back to the developer (me)

- Your **GTM Container ID** (`GTM-...`)
- Whether you want a cookie banner / consent mode

---

### 5) Google Business Profile (optional but high impact for branded search)

If you have any physical presence or service area:

1. Create/claim Google Business Profile
2. Add:
   - Correct name, category, description
   - Website: `https://raylodies.com`
   - Social links
3. Keep it consistent with the site’s About/Contact info

---

### 6) Google Merchant Center (optional, for Store visibility)

If you want products eligible for free listings / shopping surfaces:

1. Create Merchant Center account
2. Verify + claim website (`raylodies.com`)
3. Add product feed (you can start manual, but best is automated)

Implementation note:

- If you want this, tell me and I’ll implement an **automated product feed endpoint** from Supabase (published products only) in the required format.

---

### 7) Google Ads (optional)

Only if you’ll run paid campaigns:

1. Create Google Ads account
2. Link Google Ads ↔ GA4
3. Import conversions from GA4 (or define in GTM)

---

### 8) Validation tools you should use (free)

- **Rich Results Test**: check Product/Breadcrumb structured data
- **Schema Markup Validator**: verify JSON‑LD structure
- **PageSpeed Insights**: check Core Web Vitals (lab + field)

---

### 9) What I need from you to finish the setup fully

Reply with:

- **GSC verified?** (yes/no)
- **GA4 Measurement ID** (G-…)
- **GTM Container ID** (GTM-…)
- Do you want **cookie consent / Consent Mode**? (yes/no)
- Do you want **Merchant Center**? (yes/no)
