export function getSiteUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL;

  if (explicit) {
    const url = explicit.startsWith("http") ? explicit : `https://${explicit}`;
    return url.replace(/\/+$/, "");
  }

  // Safe production default for this project (can be overridden by env vars above).
  if (process.env.NODE_ENV === "production") {
    return "https://raylodies.com";
  }

  return "http://localhost:3000";
}

export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}


