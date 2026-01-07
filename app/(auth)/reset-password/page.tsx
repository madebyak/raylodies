"use client";

import { updatePassword } from "@/actions/auth";
import AuthButton from "@/components/ui/AuthButton";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useState, useTransition } from "react";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(formData);
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
            Set New Password
          </h1>
          <p className="text-white/60 font-light">
            Enter your new password below
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-400 text-sm font-light">{success}</p>
            <p className="text-white/60 text-sm font-light">
              You can now sign in with your new password.
            </p>
            <Link href="/login">
              <AuthButton className="mt-4">Sign In</AuthButton>
            </Link>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-6">
            <Input
              name="password"
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              required
              minLength={6}
            />
            <Input
              name="confirm_password"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your new password"
              required
              minLength={6}
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-light text-center">
                {error}
              </div>
            )}

            <AuthButton type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Password"}
            </AuthButton>
          </form>
        )}
      </div>
    </div>
  );
}
