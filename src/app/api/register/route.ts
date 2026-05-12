import { NextResponse } from 'next/server'

import { hashPassword } from '@/lib/auth'
import { generateReferenceCode } from '@/lib/reference-code'
import { registrationSchema } from '@/lib/validations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function getErrorMessage(caught: unknown) {
  if (caught instanceof Error) {
    return caught.message
  }

  return 'Unknown server error.'
}

function getPrismaErrorCode(caught: unknown) {
  if (
    caught &&
    typeof caught === 'object' &&
    'code' in caught &&
    typeof caught.code === 'string'
  ) {
    return caught.code
  }

  return null
}

async function createUniqueReferenceCode(
  prisma: Awaited<typeof import('@/lib/prisma')>['prisma'],
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referenceCode = generateReferenceCode()
    const existing = await prisma.eventRegistration.findUnique({
      where: { referenceCode },
      select: { id: true },
    })

    if (!existing) {
      return referenceCode
    }
  }

  throw new Error('Unable to allocate a unique reference code.')
}

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null)
  const parsed = registrationSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Registration payload is invalid.',
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    )
  }

  const input = parsed.data
  try {
    const { prisma } = await import('@/lib/prisma')
    const passwordHash = await hashPassword(input.password)
    const referenceCode = await createUniqueReferenceCode(prisma)

    const registration = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email: input.email },
        update: {
          name: input.name,
          phone: input.phone || null,
          passwordHash,
        },
        create: {
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          passwordHash,
        },
      })

      return tx.eventRegistration.create({
        data: {
          userId: user.id,
          referenceCode,
          eventName: input.eventName,
          attendeeName: input.name,
          attendeeEmail: input.email,
          attendeePhone: input.phone || null,
          organization: input.organization || null,
          documents: {
            create: input.attachments.map((attachment) => ({
              fileName: attachment.fileName,
              storageKey: attachment.storageKey,
              url: attachment.url,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
            })),
          },
        },
        include: {
          documents: true,
        },
      })
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: registration.id,
          referenceCode: registration.referenceCode,
          status: registration.status,
          documentCount: registration.documents.length,
        },
      },
      { status: 201 },
    )
  } catch (caught) {
    console.error(caught)
    const prismaCode = getPrismaErrorCode(caught)
    const message = getErrorMessage(caught)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: prismaCode ?? 'INTERNAL_ERROR',
          message: prismaCode
            ? `Database error ${prismaCode}: ${message}`
            : message,
        },
      },
      { status: 500 },
    )
  }
}
