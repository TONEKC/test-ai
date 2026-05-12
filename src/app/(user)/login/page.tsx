'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode: form.get('referenceCode'),
          password: form.get('password'),
        }),
      })
      const result = (await response.json()) as {
        success: boolean
        data?: { registrationId: string }
        error?: { message: string }
      }

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error?.message ?? 'Login failed.')
      }

      router.push(`/edit?registrationId=${result.data.registrationId}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Registrant Login
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink">
          Access your submission
        </h1>
        <label className="mt-6 block text-sm font-medium text-ink">
          Reference code
          <input
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 uppercase outline-none focus:border-blue-600"
            name="referenceCode"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink">
          Password
          <input
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
            name="password"
            type="password"
          />
        </label>
        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <button
          className="mt-6 w-full rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:bg-slate-400"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
