import { NextResponse } from 'next/server'

import { verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createUserSessionToken, userSessionCookie } from '@/lib/session'
import { userLoginSchema } from '@/lib/validations'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null)
  const parsed = userLoginSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Reference code and password are required.',
        },
      },
      { status: 400 },
    )
  }

  try {
    const registration = await prisma.eventRegistration.findUnique({
      where: { referenceCode: parsed.data.referenceCode.toUpperCase() },
      include: { user: true },
    })

    if (
      !registration ||
      !(await verifyPassword(
        parsed.data.password,
        registration.user.passwordHash,
      ))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid reference code or password.',
          },
        },
        { status: 401 },
      )
    }

    const token = createUserSessionToken({
      registrationId: registration.id,
      referenceCode: registration.referenceCode,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          registrationId: registration.id,
        },
      },
      {
        headers: {
          'Set-Cookie': userSessionCookie(token),
        },
      },
    )
  } catch (caught) {
    console.error(caught)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Login is temporarily unavailable.',
        },
      },
      { status: 500 },
    )
  }
}
