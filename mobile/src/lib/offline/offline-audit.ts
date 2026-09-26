import * as Crypto from 'expo-crypto'
import type { OfflineVerification } from './offline-cache'
import type { VerificationResult } from './verify'

// Only a verified result proves the issuer signed the revocation index, so a failure never sends one;
// the backend would otherwise be asked to link a forged index to a real citizen.
export const toOfflineVerification = (
  result: VerificationResult,
  verifiedAt: number
): OfflineVerification => ({
  id: Crypto.randomUUID(),
  revocationIndex: result.ok ? result.revocationIndex : null,
  result: result.ok ? 'VERIFIED' : result.code,
  verifiedAt,
})
