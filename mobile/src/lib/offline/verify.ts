import { p256 } from '@noble/curves/nist.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { base64urlnopad } from '@scure/base'

export type VerificationFailureCode =
  | 'MALFORMED'
  | 'UNSUPPORTED_ALG'
  | 'UNKNOWN_KEY'
  | 'REVOKED_KEY'
  | 'BAD_ISSUER_SIGNATURE'
  | 'EXPIRED'
  | 'CREDENTIAL_REVOKED'
  | 'DISCLOSURE_NOT_IN_SD'
  | 'DUPLICATE_DISCLOSURE'
  | 'MISSING_MANDATORY_CLAIM'
  | 'MISSING_KEY_BINDING'
  | 'BAD_KEY_BINDING_SIGNATURE'
  | 'SD_HASH_MISMATCH'
  | 'STALE_PRESENTATION'
  | 'STALE_TRUST_DATA'

export type PublicJwk = {
  kty: string
  crv: string
  x: string
  y: string
}

export type IssuerKey = PublicJwk & {
  kid: string
  status: 'active' | 'retired' | 'revoked'
}

export type TrustData = {
  keys: readonly IssuerKey[]
  /** Unix seconds when the key set and revocation list were last fetched. */
  retrievedAt: number
  revokedIndexes: readonly number[]
}

export type VerifyOptions = {
  /** Unix seconds. Injected so tests and the cross-stack fixture can pin the clock. */
  now: number
  /** Phase 4 turns this on; until then a presentation without key binding is accepted. */
  requireKeyBinding?: boolean
}

export type VerificationResult =
  | {
      ok: true
      vct: string
      revocationIndex: number
      claims: Readonly<Record<string, string>>
      warnings: readonly string[]
    }
  | { ok: false; code: VerificationFailureCode; warnings: readonly string[] }

const ISSUER = 'urn:flashid:issuer'
const CREDENTIAL_TYP = 'dc+sd-jwt'
const KEY_BINDING_TYP = 'kb+jwt'
const ALGORITHM = 'ES256'
const DIGEST_ALGORITHM = 'sha-256'

const KEY_BINDING_MAX_AGE_SECONDS = 30
const CLOCK_SKEW_SECONDS = 60
const TRUST_WARNING_SECONDS = 24 * 60 * 60
const TRUST_EXPIRY_SECONDS = 7 * 24 * 60 * 60

// Mirrors SdJwtClaimNames on the backend. The cross-stack fixture test is what stops these drifting.
export const MANDATORY_CLAIMS: Readonly<Record<string, readonly string[]>> = {
  'urn:flashid:identity-document:1': ['date_of_birth', 'portrait'],
  'urn:flashid:drivers-license:1': ['portrait', 'expiry_date', 'date_of_birth'],
}

const ALLOWED_CLAIMS: Readonly<Record<string, readonly string[]>> = {
  'urn:flashid:identity-document:1': [
    'date_of_birth',
    'portrait',
    'identity_number',
    'surname',
    'forenames',
    'citizenship_status',
    'gender',
    'country_of_birth',
    'card_issue_date_and_number',
  ],
  'urn:flashid:drivers-license:1': [
    'portrait',
    'expiry_date',
    'date_of_birth',
    'full_name',
    'identity_number',
    'license_number',
    'license_code',
    'country_of_issue',
    'vehicle_restrictions',
    'issue_date',
  ],
}

const fail = (
  code: VerificationFailureCode,
  warnings: string[] = []
): VerificationResult => ({ ok: false, code, warnings })

const utf8 = (value: string) => new TextEncoder().encode(value)

const decodeJson = (segment: string): unknown =>
  JSON.parse(new TextDecoder().decode(base64urlnopad.decode(segment)))

/** b64u(SHA-256(ASCII(text))), the digest form used for both _sd entries and sd_hash. */
const digestOf = (text: string) => base64urlnopad.encode(sha256(utf8(text)))

/** JWK x and y to an uncompressed P-256 point, which is what noble expects. */
const publicKeyBytes = (key: PublicJwk) =>
  new Uint8Array([
    4,
    ...base64urlnopad.decode(key.x),
    ...base64urlnopad.decode(key.y),
  ])

const verifyJws = (
  signingInput: string,
  signature: string,
  publicKey: Uint8Array
) =>
  p256.verify(base64urlnopad.decode(signature), utf8(signingInput), publicKey, {
    // D-014: .NET and Key Vault do not normalise S, and noble v2 rejects high-S by default. Around
    // half of real signatures are high-S, so leaving this out fails roughly every second credential.
    lowS: false,
    // v2 hashes the message itself; handing it a digest silently fails to verify.
    prehash: true,
  })

export const verifyPresentation = (
  presentation: string,
  trust: TrustData,
  options: VerifyOptions
): VerificationResult => {
  const warnings: string[] = []

  // Step 12 first for the warning, but the failure is only reported once the rest has been checked,
  // so a verifier never blames stale trust data for a credential that was invalid anyway.
  const trustAge = options.now - trust.retrievedAt
  if (trustAge > TRUST_WARNING_SECONDS) {
    warnings.push('Verification data is over 24 hours old.')
  }

  // Step 1: structure.
  if (!presentation.startsWith('eyJ') || !presentation.includes('~')) {
    return fail('MALFORMED', warnings)
  }

  const parts = presentation.split('~')
  const issuerJwt = parts[0]
  const keyBindingJwt = parts[parts.length - 1]
  const disclosures = parts.slice(1, -1)
  const sdJwt = `${[issuerJwt, ...disclosures].join('~')}~`

  const segments = issuerJwt.split('.')
  if (segments.length !== 3) {
    return fail('MALFORMED', warnings)
  }

  let header: Record<string, unknown>
  let payload: Record<string, unknown>

  try {
    header = decodeJson(segments[0]) as Record<string, unknown>
    payload = decodeJson(segments[1]) as Record<string, unknown>
  } catch {
    return fail('MALFORMED', warnings)
  }

  if (
    header.typ !== CREDENTIAL_TYP ||
    payload.iss !== ISSUER ||
    payload._sd_alg !== DIGEST_ALGORITHM
  ) {
    return fail('MALFORMED', warnings)
  }

  // Step 2: the algorithm is fixed here, never read from the header, so a forged header cannot
  // talk the verifier into a weaker algorithm or into "none".
  if (header.alg !== ALGORITHM) {
    return fail('UNSUPPORTED_ALG', warnings)
  }

  // Step 3.
  const key = trust.keys.find((candidate) => candidate.kid === header.kid)
  if (!key) {
    return fail('UNKNOWN_KEY', warnings)
  }
  if (key.status === 'revoked') {
    return fail('REVOKED_KEY', warnings)
  }

  // Step 4.
  let issuerSignatureValid: boolean
  try {
    issuerSignatureValid = verifyJws(
      `${segments[0]}.${segments[1]}`,
      segments[2],
      publicKeyBytes(key)
    )
  } catch {
    return fail('BAD_ISSUER_SIGNATURE', warnings)
  }
  if (!issuerSignatureValid) {
    return fail('BAD_ISSUER_SIGNATURE', warnings)
  }

  // Everything below is trusted content, so failures here may be reported to the citizen.

  // Step 5.
  if (typeof payload.exp !== 'number' || payload.exp <= options.now) {
    return fail('EXPIRED', warnings)
  }

  // Step 6.
  const revocationIndex = payload.ri
  if (typeof revocationIndex !== 'number') {
    return fail('MALFORMED', warnings)
  }
  if (trust.revokedIndexes.includes(revocationIndex)) {
    return fail('CREDENTIAL_REVOKED', warnings)
  }

  // Step 7.
  const sdDigests = new Set(
    Array.isArray(payload._sd) ? (payload._sd as string[]) : []
  )
  const claims: Record<string, string> = {}
  const seenDigests = new Set<string>()
  const vct = String(payload.vct)
  const allowedClaims = ALLOWED_CLAIMS[vct]

  if (!allowedClaims) {
    return fail('MALFORMED', warnings)
  }

  for (const disclosure of disclosures) {
    const digest = digestOf(disclosure)

    if (!sdDigests.has(digest)) {
      return fail('DISCLOSURE_NOT_IN_SD', warnings)
    }
    if (seenDigests.has(digest)) {
      return fail('DUPLICATE_DISCLOSURE', warnings)
    }
    seenDigests.add(digest)

    let parsed: unknown
    try {
      parsed = decodeJson(disclosure)
    } catch {
      return fail('MALFORMED', warnings)
    }

    if (!Array.isArray(parsed) || parsed.length !== 3) {
      return fail('MALFORMED', warnings)
    }

    const [, claimName, claimValue] = parsed as [string, string, string]

    // A claim the backend never issues for this vct means the payload was built by something else.
    if (!allowedClaims.includes(claimName)) {
      return fail('MALFORMED', warnings)
    }
    if (claimName in claims) {
      return fail('DUPLICATE_DISCLOSURE', warnings)
    }

    claims[claimName] = claimValue
  }

  // Step 8.
  const mandatory = MANDATORY_CLAIMS[vct] ?? []
  if (mandatory.some((claimName) => !(claimName in claims))) {
    return fail('MISSING_MANDATORY_CLAIM', warnings)
  }

  // Steps 9 to 11. Until Phase 4 a presentation without key binding is accepted.
  const confirmation = payload.cnf as { jwk?: PublicJwk } | undefined

  if (keyBindingJwt.length > 0) {
    const keyBindingResult = verifyKeyBinding(
      keyBindingJwt,
      sdJwt,
      confirmation?.jwk,
      options.now
    )
    if (keyBindingResult) {
      return fail(keyBindingResult, warnings)
    }
  } else if (options.requireKeyBinding) {
    return fail('MISSING_KEY_BINDING', warnings)
  }

  // Step 12: reported last, so it never masks a genuinely invalid credential.
  if (trustAge > TRUST_EXPIRY_SECONDS) {
    return fail('STALE_TRUST_DATA', warnings)
  }

  return { ok: true, vct, revocationIndex, claims, warnings }
}

/** Returns a failure code, or undefined when the key binding is acceptable. */
const verifyKeyBinding = (
  keyBindingJwt: string,
  sdJwt: string,
  deviceKey: PublicJwk | undefined,
  now: number
): VerificationFailureCode | undefined => {
  if (!deviceKey) {
    return 'MISSING_KEY_BINDING'
  }

  const segments = keyBindingJwt.split('.')
  if (segments.length !== 3) {
    return 'MALFORMED'
  }

  let header: Record<string, unknown>
  let payload: Record<string, unknown>

  try {
    header = decodeJson(segments[0]) as Record<string, unknown>
    payload = decodeJson(segments[1]) as Record<string, unknown>
  } catch {
    return 'MALFORMED'
  }

  if (header.typ !== KEY_BINDING_TYP || header.alg !== ALGORITHM) {
    return 'MALFORMED'
  }

  try {
    if (
      !verifyJws(
        `${segments[0]}.${segments[1]}`,
        segments[2],
        publicKeyBytes(deviceKey)
      )
    ) {
      return 'BAD_KEY_BINDING_SIGNATURE'
    }
  } catch {
    return 'BAD_KEY_BINDING_SIGNATURE'
  }

  // sd_hash covers the SD-JWT including its trailing tilde, so disclosures cannot be added or
  // removed after the holder signed.
  if (payload.sd_hash !== digestOf(sdJwt)) {
    return 'SD_HASH_MISMATCH'
  }

  if (typeof payload.iat !== 'number') {
    return 'MALFORMED'
  }

  const age = now - payload.iat
  if (age > KEY_BINDING_MAX_AGE_SECONDS || age < -CLOCK_SKEW_SECONDS) {
    return 'STALE_PRESENTATION'
  }

  return undefined
}
