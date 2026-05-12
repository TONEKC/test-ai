import bcrypt from 'bcryptjs'

function normalizeCredential(value: string | undefined) {
  const trimmed = value?.trim() ?? ''

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = normalizeCredential(process.env.ADMIN_USERNAME)
  const expectedPassword = normalizeCredential(process.env.ADMIN_PASSWORD)

  return (
    username.trim().length > 0 &&
    password.length > 0 &&
    username.trim() === expectedUsername &&
    password === expectedPassword
  )
}

export function hasAdminCredentialsConfigured() {
  return (
    normalizeCredential(process.env.ADMIN_USERNAME).length > 0 &&
    normalizeCredential(process.env.ADMIN_PASSWORD).length > 0
  )
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}
