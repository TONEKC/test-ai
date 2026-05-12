'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    await fetch('/api/admin', { method: 'DELETE' })
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <button
      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-ink-muted transition hover:border-slate-400 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoggingOut}
      onClick={handleLogout}
      type="button"
    >
      {isLoggingOut ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
