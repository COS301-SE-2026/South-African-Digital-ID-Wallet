import { p256 } from '@noble/curves/nist.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { base64urlnopad } from '@scure/base'
import { CLAIM_LABELS } from './claim-labels'

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
  /** Unix seconds when the issuer key set was last fetched. */
  retrievedAt: number
  revokedIndexes: readonly number[]
  /** Unix seconds when the revocation list was last fetched, or null until one has been (checklist 5.1). */
  revocationRetrievedAt: number | null
}

export type VerifyOptions = {
  /** Unix seconds. Injected so tests and the cross-stack fixture can pin the clock. */
  now: number
  /** Require key binding even without cnf. A credential that has cnf always requires it. */
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
const COORDINATE_BYTES = 32

const KEY_BINDING_MAX_AGE_SECONDS = 30
const CLOCK_SKEW_SECONDS = 60
const TRUST_WARNING_SECONDS = 24 * 60 * 60
const TRUST_EXPIRY_SECONDS = 7 * 24 * 60 * 60

export const REVOCATION_NOT_CHECKED_WARNING =
  'Revocation status was not checked: this phone has no revocation list yet.'

// Mirrors SdJwtClaimNames on the backend. The cross-stack fixture test is what stops these drifting.
export const MANDATORY_CLAIMS: Readonly<Record<string, readonly string[]>> = {
  'urn:flashid:identity-document:1': ['date_of_birth', 'portrait'],
  'urn:flashid:drivers-license:1': ['portrait', 'expiry_date', 'date_of_birth'],
}

// Derived from the shared label table, so any claim the phone can show is exactly a claim it accepts.
const ALLOWED_CLAIMS: Readonly<Record<string, readonly string[]>> =
  Object.fromEntries(
    Object.entries(CLAIM_LABELS).map(([vct, labels]) => [
      vct,
      Object.keys(labels),
    ])
  )

type JsonObject = Record<string, unknown>
type Failure = { failure: VerificationFailureCode }
type ParsedJwt = {
  segments: readonly string[]
  header: JsonObject
  payload: JsonObject
}
type ParsedPresentation = ParsedJwt & {
  disclosures: readonly string[]
  keyBindingJwt: string
  sdJwt: string
}
type DisclosedClaim = { name: string; value: string }

const failure = (code: VerificationFailureCode): Failure => ({ failure: code })

const isFailure = <T extends object>(value: T | Failure): value is Failure =>
  'failure' in value

const utf8 = (value: string) => new TextEncoder().encode(value)

const decodeJson = (segment: string): unknown =>
  JSON.parse(new TextDecoder().decode(base64urlnopad.decode(segment)))

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// Salt, name and value are always strings on the wire (wire-format section 3).
const isStringTriple = (value: unknown): value is [string, string, string] =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every((element) => typeof element === 'string')

/** b64u(SHA-256(ASCII(text))), the digest form used for both _sd entries and sd_hash. */
const digestOf = (text: string) => base64urlnopad.encode(sha256(utf8(text)))

/** JWK to an uncompressed P-256 point, or null when the coordinates are not 32 bytes each. */
const publicKeyBytes = (key: PublicJwk): Uint8Array | null => {
  try {
    const x = base64urlnopad.decode(key.x)
    const y = base64urlnopad.decode(key.y)

    return x.length === COORDINATE_BYTES && y.length === COORDINATE_BYTES
      ? new Uint8Array([4, ...x, ...y])
      : null
  } catch {
    return null
  }
}

const verifyJws = (
  segments: readonly string[],
  publicKey: Uint8Array
): boolean => {
  try {
    return p256.verify(
      base64urlnopad.decode(segments[2]),
      utf8(`${segments[0]}.${segments[1]}`),
      publicKey,
      {
        // D-014: .NET and Key Vault do not normalise S, and noble v2 rejects high-S by default.
        lowS: false,
        // v2 hashes the message itself; handing it a digest silently fails to verify.
        prehash: true,
      }
    )
  } catch {
    return false
  }
}

const parseJwt = (jwt: string): ParsedJwt | null => {
  const segments = jwt.split('.')
  if (segments.length !== 3) {
    return null
  }

  try {
    const header = decodeJson(segments[0])
    const payload = decodeJson(segments[1])

    return isJsonObject(header) && isJsonObject(payload)
      ? { segments, header, payload }
      : null
  } catch {
    return null
  }
}

// Steps 1 and 2.
const parsePresentation = (
  presentation: string
): ParsedPresentation | Failure => {
  const parts = presentation.split('~')
  const keyBindingJwt = parts.at(-1) ?? ''

  // An SD-JWT always ends with ~. Without it, the last disclosure would be read as a key binding
  // JWT; a key binding JWT always has three segments and a disclosure never does.
  if (
    parts.length < 2 ||
    (keyBindingJwt !== '' && keyBindingJwt.split('.').length !== 3)
  ) {
    return failure('MALFORMED')
  }

  const issuer = parseJwt(parts[0])
  if (
    !issuer ||
    issuer.header.typ !== CREDENTIAL_TYP ||
    issuer.payload.iss !== ISSUER ||
    issuer.payload._sd_alg !== DIGEST_ALGORITHM
  ) {
    return failure('MALFORMED')
  }

  // The algorithm is a constant, never read from the header, so a forged header cannot talk the
  // verifier into a weaker algorithm or into "none".
  if (issuer.header.alg !== ALGORITHM) {
    return failure('UNSUPPORTED_ALG')
  }

  const disclosures = parts.slice(1, -1)

  return {
    ...issuer,
    disclosures,
    keyBindingJwt,
    sdJwt: `${[parts[0], ...disclosures].join('~')}~`,
  }
}

// Steps 3 and 4.
const checkIssuerSignature = (
  parsed: ParsedPresentation,
  trust: TrustData
): VerificationFailureCode | undefined => {
  const key = trust.keys.find(
    (candidate) => candidate.kid === parsed.header.kid
  )

  // Retired keys still verify on purpose: credentials signed before a rotation stay valid until
  // their own expiry (D-008). Only a revoked key is refused.
  if (key?.status === 'revoked') {
    return 'REVOKED_KEY'
  }

  // A malformed key in the trust store is a trust data problem, not a forged credential.
  const publicKey = key ? publicKeyBytes(key) : null
  if (!publicKey) {
    return 'UNKNOWN_KEY'
  }

  return verifyJws(parsed.segments, publicKey)
    ? undefined
    : 'BAD_ISSUER_SIGNATURE'
}

// Steps 5 and 6. Everything from here on is signed content.
const checkStatus = (
  payload: JsonObject,
  trust: TrustData,
  now: number
): VerificationFailureCode | undefined => {
  if (typeof payload.exp !== 'number' || payload.exp <= now) {
    return 'EXPIRED'
  }

  // A credential issued in the future means a badly wrong clock. Wire-format section 10 has no code
  // for it, so it is refused as malformed rather than silently accepted.
  if (
    typeof payload.iat !== 'number' ||
    payload.iat > now + CLOCK_SKEW_SECONDS ||
    typeof payload.ri !== 'number'
  ) {
    return 'MALFORMED'
  }

  return trust.revokedIndexes.includes(payload.ri)
    ? 'CREDENTIAL_REVOKED'
    : undefined
}

const readDisclosure = (
  disclosure: string,
  sdDigests: ReadonlySet<unknown>,
  seenDigests: Set<string>,
  allowedClaims: readonly string[]
): DisclosedClaim | Failure => {
  const digest = digestOf(disclosure)

  if (!sdDigests.has(digest)) {
    return failure('DISCLOSURE_NOT_IN_SD')
  }
  if (seenDigests.has(digest)) {
    return failure('DUPLICATE_DISCLOSURE')
  }
  seenDigests.add(digest)

  let parsed: unknown
  try {
    parsed = decodeJson(disclosure)
  } catch {
    return failure('MALFORMED')
  }

  // A non-string element, or a claim the backend never issues for this vct, was not built by our issuer.
  if (!isStringTriple(parsed) || !allowedClaims.includes(parsed[1])) {
    return failure('MALFORMED')
  }

  return { name: parsed[1], value: parsed[2] }
}

// Step 7.
const collectDisclosures = (
  parsed: ParsedPresentation
): { vct: string; claims: Record<string, string> } | Failure => {
  const vct = parsed.payload.vct
  const allowedClaims =
    typeof vct === 'string' ? ALLOWED_CLAIMS[vct] : undefined

  if (typeof vct !== 'string' || !allowedClaims) {
    return failure('MALFORMED')
  }

  const sdDigests = new Set(
    Array.isArray(parsed.payload._sd) ? parsed.payload._sd : []
  )
  const seenDigests = new Set<string>()
  const claims: Record<string, string> = {}

  for (const disclosure of parsed.disclosures) {
    const claim = readDisclosure(
      disclosure,
      sdDigests,
      seenDigests,
      allowedClaims
    )

    if (isFailure(claim)) {
      return claim
    }
    if (claim.name in claims) {
      return failure('DUPLICATE_DISCLOSURE')
    }

    claims[claim.name] = claim.value
  }

  return { vct, claims }
}

// Step 8.
const checkMandatory = (
  vct: string,
  claims: Record<string, string>
): VerificationFailureCode | undefined =>
  (MANDATORY_CLAIMS[vct] ?? []).every((claimName) => claimName in claims)
    ? undefined
    : 'MISSING_MANDATORY_CLAIM'

const verifyKeyBinding = (
  keyBindingJwt: string,
  sdJwt: string,
  deviceKey: PublicJwk,
  now: number
): VerificationFailureCode | undefined => {
  const parsed = parseJwt(keyBindingJwt)
  const publicKey = publicKeyBytes(deviceKey)

  if (
    !parsed ||
    !publicKey ||
    parsed.header.typ !== KEY_BINDING_TYP ||
    parsed.header.alg !== ALGORITHM
  ) {
    return 'MALFORMED'
  }
  if (!verifyJws(parsed.segments, publicKey)) {
    return 'BAD_KEY_BINDING_SIGNATURE'
  }

  // sd_hash covers the SD-JWT including its trailing ~, so disclosures cannot be added or removed
  // after the holder signed.
  if (parsed.payload.sd_hash !== digestOf(sdJwt)) {
    return 'SD_HASH_MISMATCH'
  }
  if (typeof parsed.payload.iat !== 'number') {
    return 'MALFORMED'
  }

  // 30 seconds fresh with 60 seconds of skew either way (wire-format section 8), because an offline
  // holder's clock drifts. There is no aud or nonce: a one-way QR flow cannot carry a verifier
  // challenge, recorded as a deviation in wire-format section 11.
  const age = now - parsed.payload.iat

  return age > KEY_BINDING_MAX_AGE_SECONDS + CLOCK_SKEW_SECONDS ||
    age < -CLOCK_SKEW_SECONDS
    ? 'STALE_PRESENTATION'
    : undefined
}

// Steps 9 to 11.
const checkKeyBinding = (
  parsed: ParsedPresentation,
  options: VerifyOptions
): VerificationFailureCode | undefined => {
  const confirmation = parsed.payload.cnf
  const deviceKey =
    isJsonObject(confirmation) && isJsonObject(confirmation.jwk)
      ? (confirmation.jwk as PublicJwk)
      : undefined

  if (parsed.keyBindingJwt === '') {
    // A credential bound to a device must prove possession of that device's key whatever the flag
    // says, otherwise a screenshot of the QR code presents it.
    return deviceKey || options.requireKeyBinding
      ? 'MISSING_KEY_BINDING'
      : undefined
  }

  // A key binding JWT with no cnf to check it against was not produced for this credential.
  return deviceKey
    ? verifyKeyBinding(
        parsed.keyBindingJwt,
        parsed.sdJwt,
        deviceKey,
        options.now
      )
    : 'MALFORMED'
}

// Step 12. The older timestamp decides, so fresh keys cannot hide a stale revocation list.
const trustAgeOf = (trust: TrustData, now: number): number => {
  const revocationRetrievedAt = trust.revocationRetrievedAt ?? null

  return (
    now -
    (revocationRetrievedAt === null
      ? trust.retrievedAt
      : Math.min(trust.retrievedAt, revocationRetrievedAt))
  )
}

const trustWarnings = (trust: TrustData, now: number): string[] => {
  const warnings: string[] = []

  if (trustAgeOf(trust, now) > TRUST_WARNING_SECONDS) {
    warnings.push('Verification data is over 24 hours old.')
  }

  // Until the revocation list ships (checklist 5.1 and 5.2), a revoked credential cannot be
  // detected offline, so the result must say so rather than imply it was checked.
  if ((trust.revocationRetrievedAt ?? null) === null) {
    warnings.push(REVOCATION_NOT_CHECKED_WARNING)
  }

  return warnings
}

export const verifyPresentation = (
  presentation: string,
  trust: TrustData,
  options: VerifyOptions
): VerificationResult => {
  const warnings = trustWarnings(trust, options.now)
  const fail = (code: VerificationFailureCode): VerificationResult => ({
    ok: false,
    code,
    warnings,
  })

  const parsed = parsePresentation(presentation)
  if (isFailure(parsed)) {
    return fail(parsed.failure)
  }

  // Until this passes, the credential's content is attacker-controlled.
  const signatureFailure = checkIssuerSignature(parsed, trust)
  if (signatureFailure) {
    return fail(signatureFailure)
  }

  const statusFailure = checkStatus(parsed.payload, trust, options.now)
  if (statusFailure) {
    return fail(statusFailure)
  }

  const disclosed = collectDisclosures(parsed)
  if (isFailure(disclosed)) {
    return fail(disclosed.failure)
  }

  const bindingFailure =
    checkMandatory(disclosed.vct, disclosed.claims) ??
    checkKeyBinding(parsed, options)
  if (bindingFailure) {
    return fail(bindingFailure)
  }

  // Reported last, so stale trust data never masks a genuinely invalid credential.
  if (trustAgeOf(trust, options.now) > TRUST_EXPIRY_SECONDS) {
    return fail('STALE_TRUST_DATA')
  }

  return {
    ok: true,
    vct: disclosed.vct,
    revocationIndex: parsed.payload.ri as number,
    claims: disclosed.claims,
    warnings,
  }
}
