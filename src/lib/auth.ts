import bcrypt from 'bcryptjs'

export function verifyAdminCredentials(username: string, password: string) {
  return (
    username.length > 0 &&
    password.length > 0 &&
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  )
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}
