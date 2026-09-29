import { z } from 'zod'

export const SA_ID_ERROR = 'Enter a valid 13 digit South African ID number.'

// Mirrors the backend SaIdValidator so both sides agree
export const isValidSaId = (value: string): boolean => {
  if (!/^\d{13}$/.test(value)) return false

  const yy = Number(value.slice(0, 2))
  const mm = Number(value.slice(2, 4))
  const dd = Number(value.slice(4, 6))
  // JS rolls invalid dates over (31 Feb becomes 3 Mar), so compare back
  const date = new Date(Date.UTC(2000 + yy, mm - 1, dd))
  if (date.getUTCMonth() !== mm - 1 || date.getUTCDate() !== dd) return false

  // 0 = SA citizen, 1 = permanent resident
  if (value[10] !== '0' && value[10] !== '1') return false

  // Luhn check digit
  const sum = [...value].reduce((total, char, index) => {
    let digit = Number(char)
    if (index % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    return total + digit
  }, 0)
  return sum % 10 === 0
}

export const saIdSchema = z
  .string()
  .trim()
  .refine(isValidSaId, { error: SA_ID_ERROR })
