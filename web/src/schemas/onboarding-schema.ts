import { z } from 'zod'

export const retrivalSchema = z.object({
  saId: z
    .string()
    .trim()
    .regex(/^\d{13}$/, 'Enter a valid 13 digit South African ID number.'),
})
