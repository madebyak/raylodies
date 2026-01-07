import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";

function safeNextPath(input: string | null, fallback: string = "/"): string {
  if (!input) return fallback;
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  return trimmed;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Get all possible auth parameters
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), "/account");

  const supabase = await createClient();

  // Determine redirect URL based on environment
  const getRedirectUrl = (path: string) => {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return `${origin}${path}`;
    } else if (forwardedHost) {
      return `https://${forwardedHost}${path}`;
    } else {
      return `${origin}${path}`;
    }
  };

  // Handle PKCE flow (OAuth, magic links with code)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(getRedirectUrl(next));
    }
    // Code exchange failed
    return NextResponse.redirect(getRedirectUrl("/auth/auth-code-error"));
  }

  // Handle token hash flow (email verification, password reset)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Redirect based on the type of verification
      if (type === "recovery") {
        // Password reset - redirect to reset password page
        return NextResponse.redirect(getRedirectUrl("/reset-password"));
      } else if (type === "signup" || type === "email") {
        // Email verification - redirect to account or next
        return NextResponse.redirect(getRedirectUrl(next));
      } else {
        // Other types (magiclink, invite, etc.)
        return NextResponse.redirect(getRedirectUrl(next));
      }
    }

    // Token verification failed
    return NextResponse.redirect(getRedirectUrl("/auth/auth-code-error"));
  }

  // No valid auth parameters found
  return NextResponse.redirect(getRedirectUrl("/auth/auth-code-error"));
}
