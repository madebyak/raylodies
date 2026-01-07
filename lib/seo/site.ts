export function getSiteUrl(): string {
  // 1) Prefer explicit, stable site URL (best practice for canonical/OG URLs)
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (explicit) {
    const url = explicit.startsWith("http") ? explicit : `https://${explicit}`;
    return url.replace(/\/+$/, "");
  }

  // 2) In production, always prefer the public canonical domain.
  // Vercel sets VERCEL_URL/NEXT_PUBLIC_VERCEL_URL even in production, but it may be an internal/SSO-protected URL,
  // which breaks social crawlers trying to fetch og:image.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return "https://raylodies.com";
  }

  // 3) In preview deployments, VERCEL_URL is a good default.
  if (process.env.VERCEL_ENV === "preview") {
    const preview = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
    if (preview) {
      const url = preview.startsWith("http") ? preview : `https://${preview}`;
      return url.replace(/\/+$/, "");
    }
  }

  return "http://localhost:3000";
}

export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}


