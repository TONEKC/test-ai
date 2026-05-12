import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import {
  getUserSessionCookieName,
  verifyUserSessionToken,
} from '@/lib/session'
import { updateRegistrationSchema } from '@/lib/validations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RouteContext {
  params: {
    id: string
  }
}

function getAuthorizedSession(registrationId: string) {
  const token = cookies().get(getUserSessionCookieName())?.value
  const session = verifyUserSessionToken(token)

  if (!session || session.registrationId !== registrationId) {
    return null
  }

  return session
}

export async function GET(_request: Request, context: RouteContext) {
  if (!getAuthorizedSession(context.params.id)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Please sign in with your reference code and password.',
        },
      },
      { status: 401 },
    )
  }

  const { prisma } = await import('@/lib/prisma')

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: context.params.id },
    include: {
      documents: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!registration) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Registration was not found.',
        },
      },
      { status: 404 },
    )
  }

  return NextResponse.json({
    success: true,
    data: { registration },
  })
}

export async function PUT(request: Request, context: RouteContext) {
  if (!getAuthorizedSession(context.params.id)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Please sign in with your reference code and password.',
        },
      },
      { status: 401 },
    )
  }

  const payload: unknown = await request.json().catch(() => null)
  const parsed = updateRegistrationSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Update payload is invalid.',
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    )
  }

  const input = parsed.data
  const { prisma } = await import('@/lib/prisma')

  const registration = await prisma.$transaction(async (tx) => {
    await tx.registrationDocument.updateMany({
      where: {
        id: { in: input.documentIdsToRemove },
        registrationId: context.params.id,
        status: 'ACTIVE',
      },
      data: { status: 'DELETED' },
    })

    return tx.eventRegistration.update({
      where: { id: context.params.id },
      data: {
        attendeeName: input.name,
        attendeeEmail: input.email,
        attendeePhone: input.phone || null,
        organization: input.organization || null,
        user: {
          update: {
            name: input.name,
            email: input.email,
            phone: input.phone || null,
          },
        },
        documents: {
          create: input.attachmentsToAdd.map((attachment) => ({
            fileName: attachment.fileName,
            storageKey: attachment.storageKey,
            url: attachment.url,
            mimeType: attachment.mimeType,
            sizeBytes: attachment.sizeBytes,
          })),
        },
      },
      include: {
        documents: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  })

  return NextResponse.json({
    success: true,
    data: { registration },
  })
}
