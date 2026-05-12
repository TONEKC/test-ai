import { NextResponse } from 'next/server'

import { verifyAdminCredentials } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    username?: string
    password?: string
  } | null

  const isValid = verifyAdminCredentials(
    payload?.username ?? '',
    payload?.password ?? '',
  )

  if (!isValid) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid admin credentials.',
        },
      },
      { status: 401 },
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      role: 'ADMIN',
      message: 'Admin credentials accepted.',
    },
  })
}

export async function GET() {
  const { prisma } = await import('@/lib/prisma')

  const registrations = await prisma.eventRegistration.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      documents: {
        where: { status: 'ACTIVE' },
      },
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      registrations,
    },
  })
}
