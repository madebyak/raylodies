"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

function safeRedirectPath(
  input: unknown,
  fallback: string = "/account",
): string {
  if (typeof input !== "string") return fallback;
  const trimmed = input.trim();
  // Only allow internal paths to avoid open redirects.
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  return trimmed;
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = safeRedirectPath(formData.get("redirect"), "/account");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.app_metadata?.role === "super_admin") {
    redirect("/admin");
  }

  redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const origin = (await headers()).get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const redirectTo = safeRedirectPath(formData.get("redirect"), "/account");

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is enabled, we should tell the user to check their email
  return {
    success: true,
    message: "Check your email to confirm your account.",
  };
}

export async function loginWithGoogle(formData?: FormData): Promise<void> {
  const origin = (await headers()).get("origin");
  const redirectTo = safeRedirectPath(formData?.get("redirect"), "/account");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    // Redirect to login with error message as query param
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  // Fallback redirect if no URL (shouldn't happen)
  redirect("/login?error=Failed to initiate Google login");
}

export async function forgotPassword(formData: FormData) {
  const origin = (await headers()).get("origin");
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Check your email for a password reset link.",
  };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Password updated successfully." };
}
