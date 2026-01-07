import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication Error",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-light text-white">
            Authentication Failed
          </h1>
          <p className="text-white/60 font-light leading-relaxed">
            We couldn&apos;t complete your authentication request. This can
            happen if the link has expired or was already used.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6 text-left space-y-4">
          <p className="text-white/80 text-sm font-light">
            Here are some things you can try:
          </p>
          <ul className="space-y-2 text-white/60 text-sm font-light">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] mt-1">•</span>
              <span>Request a new password reset link</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] mt-1">•</span>
              <span>Try signing in with Google instead</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] mt-1">•</span>
              <span>Create a new account if you don&apos;t have one</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center px-6 py-3.5 bg-white text-black text-base font-normal rounded-lg hover:bg-white/90 transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/forgot-password"
            className="flex-1 inline-flex items-center justify-center px-6 py-3.5 border border-white/20 text-white text-base font-normal rounded-lg hover:border-white/40 hover:bg-white/[0.03] transition-colors duration-200"
          >
            Reset Password
          </Link>
        </div>

        {/* Support Link */}
        <p className="text-sm text-white/40 font-light">
          Need help?{" "}
          <Link
            href="/start-a-project"
            className="text-white/60 hover:text-white underline underline-offset-4 transition-colors duration-200"
          >
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
