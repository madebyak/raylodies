'use client'

import { login, loginWithGoogle } from '@/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/account'

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      formData.set('redirect', redirectTo)
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-light text-white">Welcome Back</h1>
          <p className="text-white/40 font-light">Sign in to access your account</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="redirect" value={redirectTo} />
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
            {isPending ? 'Signing in...' : 'Sign In'}
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
          <input type="hidden" name="redirect" value={redirectTo} />
          <Button
            variant="secondary"
            className="w-full"
            type="submit"
          >
            Google
          </Button>
        </form>

        <p className="text-center text-sm text-white/40 font-light">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-white hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}


