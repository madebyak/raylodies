"use client";

import { signup, loginWithGoogle } from "@/actions/auth";
import AuthButton from "@/components/ui/AuthButton";
import GoogleButton from "@/components/ui/GoogleButton";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";

function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      formData.set("redirect", redirectTo);
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message!);
      }
    });
  }

  if (success) {
    return (
      <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-green-400 text-sm font-light">{success}</p>
        <p className="text-white/60 text-sm font-light">
          Please check your email to verify your account.
        </p>
        <Link
          href={`/login${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
        >
          <AuthButton className="mt-4">Go to Login</AuthButton>
        </Link>
      </div>
    );
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-6">
        <input type="hidden" name="redirect" value={redirectTo} />
        <Input
          name="full_name"
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          required
        />
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email address"
          required
        />
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="Create a secure password"
          required
          minLength={6}
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-light text-center">
            {error}
          </div>
        )}

        <AuthButton type="submit" disabled={isPending}>
          {isPending ? "Creating Account..." : "Create Account"}
        </AuthButton>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#050505] text-white/50 font-light">or</span>
        </div>
      </div>

      <form action={loginWithGoogle}>
        <input type="hidden" name="redirect" value={redirectTo} />
        <GoogleButton type="submit" />
      </form>

      <p className="text-center text-sm text-white/60 font-light">
        Already have an account?{" "}
        <Link
          href={`/login${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-white hover:text-[var(--color-accent)] transition-colors duration-200 underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}

function SignupFormFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-16 bg-white/10 rounded" />
        <div className="h-14 bg-white/5 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-12 bg-white/10 rounded" />
        <div className="h-14 bg-white/5 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-16 bg-white/10 rounded" />
        <div className="h-14 bg-white/5 rounded-lg" />
      </div>
      <div className="h-14 bg-white/20 rounded-lg" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-light text-white">
            Create Account
          </h1>
          <p className="text-white/60 font-light">Join Raylodies today</p>
        </div>

        <Suspense fallback={<SignupFormFallback />}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
