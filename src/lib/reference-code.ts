import { customAlphabet } from 'nanoid'

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const createCode = customAlphabet(alphabet, 10)

export function generateReferenceCode() {
  return createCode().toUpperCase()
}
