import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Event Registration System',
  description: 'Registration, self-service, and admin workflows for event operations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-surface font-sans text-ink antialiased">{children}</body>
    </html>
  )
}
