'use client'

import { signup, loginWithGoogle } from '@/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'
import { useState, useTransition } from 'react'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.message!)
      }
    })
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-light text-white">Create Account</h1>
          <p className="text-white/40 font-light">Join Raylodies today</p>
        </div>

        {success ? (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-light text-center space-y-4">
            <p>{success}</p>
            <p className="text-white/60">Please check your email to verify your account.</p>
            <Link href="/login">
              <Button variant="secondary" className="mt-4 w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <form action={handleSubmit} className="space-y-6">
              <Input
                name="full_name"
                type="text"
                label="Full Name"
                placeholder="John Doe"
                required
              />
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                required
              />
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                required
                minLength={6}
              />

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-light text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0a0a0a] text-white/40 font-light">Or continue with</span>
              </div>
            </div>

            <form action={loginWithGoogle}>
              <Button
                variant="secondary"
                className="w-full"
                type="submit"
              >
                Google
              </Button>
            </form>

            <p className="text-center text-sm text-white/40 font-light">
              Already have an account?{' '}
              <Link href="/login" className="text-white hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
