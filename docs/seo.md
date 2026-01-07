## SEO setup for Raylodies (Google-friendly)

### 1) Environment variables (recommended)

- **`NEXT_PUBLIC_SITE_URL`**: `https://raylodies.com`
- **`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`**: value from Google Search Console → “HTML tag” verification

If `NEXT_PUBLIC_SITE_URL` isn’t set, the app defaults to `https://raylodies.com` in production.

### 2) Google Search Console (must-have)

- Add property: `https://raylodies.com`
- Verify using **HTML tag** (set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`)
- Submit sitemap: `https://raylodies.com/sitemap.xml`
- Monitor:
  - Indexing → Pages
  - Experience → Core Web Vitals
  - Performance → Queries/Pages

### 3) What we implemented in code

- **Sitemap**: `app/sitemap.ts` (includes published products + projects)
- **Robots**: `app/robots.ts` (blocks admin/account/auth/api)
- **Canonical + metadata base**: `app/layout.tsx`
- **DB-backed per-page metadata**:
  - `app/store/[slug]/layout.tsx` reads `meta_title`, `meta_description`, `og_image`
  - `app/work/[slug]/layout.tsx` reads `meta_title`, `meta_description`, `og_image`
- **Structured data** (JSON-LD):
  - Product + Breadcrumb on `/store/[slug]`
  - CreativeWork + Breadcrumb on `/work/[slug]`
- **Admin SEO fields**:
  - Product editor and Project editor now include `meta_title`, `meta_description`, `og_image`
