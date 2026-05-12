import { NextResponse } from 'next/server'

import { verifyAdminCredentials } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

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
