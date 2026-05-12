import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const registrations = await prisma.eventRegistration.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      documents: {
        where: { status: 'ACTIVE' },
      },
    },
  })

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Admin Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink">
            Event registrations
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {registrations.length} registration(s) submitted.
          </p>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Attendee</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Docs</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrations.map((registration) => (
              <tr key={registration.id}>
                <td className="px-4 py-3 font-mono font-semibold">
                  {registration.referenceCode}
                </td>
                <td className="px-4 py-3 font-medium">
                  {registration.attendeeName}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {registration.attendeeEmail}
                </td>
                <td className="px-4 py-3">{registration.status}</td>
                <td className="px-4 py-3">{registration.documents.length}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {registration.submittedAt.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <a
                    className="rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                    href={`/api/admin/pdf/${registration.id}`}
                  >
                    Download Tag
                  </a>
                </td>
              </tr>
            ))}
            {registrations.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-ink-muted"
                  colSpan={7}
                >
                  No registrations yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  )
}
