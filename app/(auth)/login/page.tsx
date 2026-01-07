"use client";

import { login, loginWithGoogle } from "@/actions/auth";
import AuthButton from "@/components/ui/AuthButton";
import GoogleButton from "@/components/ui/GoogleButton";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      formData.set("redirect", redirectTo);
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-6">
        <input type="hidden" name="redirect" value={redirectTo} />
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email address"
          required
        />
        <div className="space-y-2">
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-light text-center">
            {error}
          </div>
        )}

        <AuthButton type="submit" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign In"}
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
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-white hover:text-[var(--color-accent)] transition-colors duration-200 underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}

function LoginFormFallback() {
  return (
    <div className="space-y-6 animate-pulse">
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

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-light text-white">
            Welcome Back
          </h1>
          <p className="text-white/60 font-light">
            Sign in to access your account
          </p>
        </div>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
