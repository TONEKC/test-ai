export default function StatusPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-10">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Self-Service Portal
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink">
          Check Registration Status
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          This page will authenticate registrants with their reference code and
          password before showing submission details and document management
          actions.
        </p>
      </section>
    </main>
  )
}
