import { base64urlnopad } from '@scure/base'

import type { OfflinePackage } from './offline-cache'

export type IssuerClaims = { vct: string; exp: number; isDeviceBound: boolean }

// Read from the signed credential rather than the server's timestamp strings: exp is plain unix
// seconds, and .NET's seven-digit fractional seconds are not guaranteed to parse on Hermes.
export const readIssuerClaims = (
  offlinePackage: OfflinePackage
): IssuerClaims | null => {
  try {
    const payloadSegment =
      offlinePackage.issuerSignedCredential.split('.')[1] ?? ''
    const payload = JSON.parse(
      new TextDecoder().decode(base64urlnopad.decode(payloadSegment))
    )

    return typeof payload.vct === 'string' && typeof payload.exp === 'number'
      ? {
          vct: payload.vct,
          exp: payload.exp,
          isDeviceBound:
            typeof payload.cnf === 'object' && payload.cnf !== null,
        }
      : null
  } catch {
    return null
  }
}

export const isPackageUsable = (
  offlinePackage: OfflinePackage,
  nowInSeconds: number
): boolean => {
  const claims = readIssuerClaims(offlinePackage)

  return claims !== null && claims.exp > nowInSeconds
}

export const isDeviceBound = (offlinePackage: OfflinePackage): boolean =>
  readIssuerClaims(offlinePackage)?.isDeviceBound === true
