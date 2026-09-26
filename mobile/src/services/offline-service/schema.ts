import { z } from 'zod'

export const offlinePackageResponseSchema = z.object({
  issuerSignedCredential: z.string().min(1),
  disclosures: z.record(z.string(), z.string()),
  signedAt: z.string(),
  expiresAt: z.string(),
})

// Only EC P-256 keys can verify ES256. Anything else is dropped here rather than failing later as a
// misleading bad signature. Coordinate lengths are checked by the verifier itself.
export const issuerKeySchema = z.object({
  kid: z.string().min(1),
  kty: z.literal('EC'),
  crv: z.literal('P-256'),
  x: z.string().min(1),
  y: z.string().min(1),
  status: z.enum(['active', 'retired', 'revoked']),
})

// Keys are validated one by one, so one bad key does not throw away the good ones.
export const issuerKeysResponseSchema = z.object({
  keys: z.array(z.unknown()),
  retrievedAt: z.string(),
})

// The list itself is checked by verifyRevocationList, against the issuer keys it will be used with.
export const revocationListResponseSchema = z.object({
  revocationList: z.string().min(1),
  retrievedAt: z.string(),
})
