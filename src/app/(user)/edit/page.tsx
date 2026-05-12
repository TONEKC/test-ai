'use client'

import { useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'

import { uploadRegistrationFiles } from '@/lib/storage'

interface RegistrationDocument {
  id: string
  fileName: string
  url: string
}

interface RegistrationRecord {
  id: string
  attendeeName: string
  attendeeEmail: string
  attendeePhone: string | null
  organization: string | null
  referenceCode: string
  documents: RegistrationDocument[]
}

export default function EditRegistrationPage() {
  const params = useSearchParams()
  const registrationId = params.get('registrationId')
  const [registration, setRegistration] = useState<RegistrationRecord | null>(
    null,
  )
  const [files, setFiles] = useState<File[]>([])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function load() {
      if (!registrationId) {
        setError('Missing registration session. Please sign in again.')
        return
      }

      const response = await fetch(`/api/register/${registrationId}`)
      const result = (await response.json()) as {
        success: boolean
        data?: { registration: RegistrationRecord }
        error?: { message: string }
      }

      if (!response.ok || !result.success || !result.data) {
        setError(result.error?.message ?? 'Unable to load registration.')
        return
      }

      setRegistration(result.data.registration)
    }

    void load()
  }, [registrationId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!registrationId) {
      return
    }

    setError('')
    setMessage('')
    setIsSaving(true)
    const form = new FormData(event.currentTarget)

    try {
      const attachmentsToAdd = await uploadRegistrationFiles(files)
      const response = await fetch(`/api/register/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          organization: form.get('organization'),
          attachmentsToAdd,
          documentIdsToRemove: removedIds,
        }),
      })
      const result = (await response.json()) as {
        success: boolean
        data?: { registration: RegistrationRecord }
        error?: { message: string }
      }

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error?.message ?? 'Update failed.')
      }

      setRegistration(result.data.registration)
      setFiles([])
      setRemovedIds([])
      setMessage('Registration updated successfully.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Update failed.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!registration) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-ink-muted">
          {error || 'Loading registration...'}
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Reference {registration.referenceCode}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink">
          Edit registration
        </h1>
      </header>

      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            Full name
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              defaultValue={registration.attendeeName}
              name="name"
              required
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Email
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              defaultValue={registration.attendeeEmail}
              name="email"
              required
              type="email"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Phone
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              defaultValue={registration.attendeePhone ?? ''}
              name="phone"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Organization
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              defaultValue={registration.organization ?? ''}
              name="organization"
            />
          </label>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-ink">Documents</h2>
          <div className="mt-3 space-y-2">
            {registration.documents.map((document) => {
              const isRemoved = removedIds.includes(document.id)

              return (
                <div
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                  key={document.id}
                >
                  <a className="font-medium text-blue-700" href={document.url}>
                    {document.fileName}
                  </a>
                  <button
                    className="text-red-700 disabled:text-slate-400"
                    disabled={isRemoved}
                    onClick={() =>
                      setRemovedIds((current) => [...current, document.id])
                    }
                    type="button"
                  >
                    {isRemoved ? 'Marked for removal' : 'Remove'}
                  </button>
                </div>
              )
            })}
          </div>
          <label className="mt-4 block rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-ink-muted">
            Add replacement or supporting files
            <input
              className="sr-only"
              multiple
              onChange={(event) =>
                setFiles(Array.from(event.currentTarget.files ?? []))
              }
              type="file"
            />
            {files.length > 0 ? (
              <span className="mt-2 block font-medium text-blue-700">
                {files.length} new file(s) selected
              </span>
            ) : null}
          </label>
        </section>

        {message ? (
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <button
          className="mt-6 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-slate-400"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </main>
  )
}
