'use client'

import Link from 'next/link'
import { type FormEvent, useState } from 'react'

import { uploadRegistrationFiles } from '@/lib/storage'

interface RegisterResponse {
  success: boolean
  data?: {
    id: string
    referenceCode: string
  }
  error?: {
    message: string
  }
}

export default function RegistrationHomePage() {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referenceCode, setReferenceCode] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)

    try {
      const attachments = await uploadRegistrationFiles(files)
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          password: form.get('password'),
          eventName: form.get('eventName') || 'Main Event',
          organization: form.get('organization'),
          attachments,
        }),
      })

      const result = (await response.json()) as RegisterResponse

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error?.message ?? 'Registration failed.')
      }

      setReferenceCode(result.data.referenceCode)
      event.currentTarget.reset()
      setFiles([])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (referenceCode) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-10">
        <section className="rounded-lg border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Registration Confirmed
          </p>
          <h1 className="mt-4 text-3xl font-bold text-ink">
            Your reference code
          </h1>
          <div className="mt-6 rounded-lg bg-slate-950 px-6 py-5 font-mono text-3xl font-bold tracking-widest text-white">
            {referenceCode}
          </div>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-ink-muted">
            Keep this code. You will use it with your password to return and
            edit your registration.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Go to login
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Event Registration
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-ink md:text-5xl">
          Submit your registration and supporting documents.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-ink-muted">
          After submission, you will receive a secure reference code for
          self-service access and later edits.
        </p>
        <div className="mt-8 flex gap-3 text-sm">
          <Link className="font-semibold text-blue-700" href="/login">
            Already registered?
          </Link>
          <Link className="font-semibold text-slate-600" href="/admin">
            Admin
          </Link>
        </div>
      </section>

      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            Full name
            <input
              required
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              name="name"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Email
            <input
              required
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              name="email"
              type="email"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Phone
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              name="phone"
              type="tel"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Password
            <input
              required
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              minLength={10}
              name="password"
              type="password"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Event
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              defaultValue="Main Event"
              name="eventName"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Organization
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              name="organization"
            />
          </label>
        </div>

        <label className="mt-5 block rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-ink-muted">
          <span className="font-semibold text-ink">Upload supporting files</span>
          <span className="mt-1 block">PDF, image, or document files.</span>
          <input
            className="sr-only"
            multiple
            onChange={(event) =>
              setFiles(Array.from(event.currentTarget.files ?? []))
            }
            type="file"
          />
          {files.length > 0 ? (
            <span className="mt-3 block font-medium text-blue-700">
              {files.length} file(s) selected
            </span>
          ) : null}
        </label>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          className="mt-6 w-full rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </main>
  )
}
