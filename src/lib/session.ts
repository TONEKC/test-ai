import { createHmac, timingSafeEqual } from 'crypto'

const cookieName = 'ers_user_session'
const maxAgeSeconds = 60 * 60 * 24 * 7

export interface UserSessionPayload {
  registrationId: string
  referenceCode: string
}

function getSecret() {
  const secret = process.env.SESSION_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters.')
  }

  return secret
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url')
}

export function createUserSessionToken(payload: UserSessionPayload) {
  const encoded = toBase64Url(JSON.stringify(payload))
  return `${encoded}.${sign(encoded)}`
}

export function verifyUserSessionToken(token?: string) {
  if (!token) {
    return null
  }

  const [encoded, signature] = token.split('.')

  if (!encoded || !signature) {
    return null
  }

  const expected = sign(encoded)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null
  }

  try {
    return JSON.parse(fromBase64Url(encoded)) as UserSessionPayload
  } catch {
    return null
  }
}

export function userSessionCookie(token: string) {
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; ${
    process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  }`
}

export function clearUserSessionCookie() {
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export function getUserSessionCookieName() {
  return cookieName
}
