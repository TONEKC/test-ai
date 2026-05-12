'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useMemo, useState } from 'react'

type LoginState = 'idle' | 'submitting' | 'success'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [state, setState] = useState<LoginState>('idle')

  const nextPath = useMemo(() => {
    const requested = searchParams.get('next')
    return requested?.startsWith('/admin') ? requested : '/admin'
  }, [searchParams])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setState('submitting')

    const form = new FormData(event.currentTarget)
    const username = String(form.get('username') ?? '').trim()
    const password = String(form.get('password') ?? '')

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const result = (await response.json()) as {
        success: boolean
        error?: { message: string }
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? 'Admin login failed.')
      }

      setState('success')
      router.replace(nextPath)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Admin login failed.')
      setState('idle')
    }
  }

  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden border-r border-slate-200 bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">
            Event Registration System
          </p>
          <h1 className="mt-6 max-w-xl text-5xl font-bold leading-tight">
            Admin operations for registrations, files, and name tags.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">
            Access is restricted to the credentials configured in your
            deployment environment.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-slate-300">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            Review submitted registrations
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            Download PDF name tags
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            Keep admin access isolated from public user flows
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <form
          className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Admin Login
            </p>
            <h2 className="mt-3 text-3xl font-bold text-ink">
              Sign in to dashboard
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Use the `ADMIN_USERNAME` and `ADMIN_PASSWORD` values from your
              environment.
            </p>
          </div>

          <label className="block text-sm font-medium text-ink">
            Username
            <input
              autoComplete="username"
              autoFocus
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              name="username"
              required
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-ink">
            Password
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              name="password"
              required
              type="password"
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            className="mt-6 flex w-full items-center justify-center rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={state !== 'idle'}
            type="submit"
          >
            {state === 'submitting'
              ? 'Signing in...'
              : state === 'success'
                ? 'Redirecting...'
                : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
