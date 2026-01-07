"use client";

import { forgotPassword } from "@/actions/auth";
import AuthButton from "@/components/ui/AuthButton";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message!);
      }
    });
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-light text-white">
            Reset Password
          </h1>
          <p className="text-white/60 font-light">
            Enter your email and we&apos;ll send you a link to reset your
            password
          </p>
        </div>

        {success ? (
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-green-400 text-sm font-light">{success}</p>
            <p className="text-white/60 text-sm font-light">
              Didn&apos;t receive the email? Check your spam folder or try
              again.
            </p>
            <Link href="/login">
              <AuthButton className="mt-4">Back to Login</AuthButton>
            </Link>
          </div>
        ) : (
          <>
            <form action={handleSubmit} className="space-y-6">
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="Enter your email address"
                required
              />

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-light text-center">
                  {error}
                </div>
              )}

              <AuthButton type="submit" disabled={isPending}>
                {isPending ? "Sending..." : "Send Reset Link"}
              </AuthButton>
            </form>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
