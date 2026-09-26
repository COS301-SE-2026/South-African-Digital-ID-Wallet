import { claimNameFor, LABELS_NOT_OFFLINE } from './claim-labels'
import type { OfflinePackage } from './offline-cache'
import { readIssuerClaims } from './offline-package'
import { MANDATORY_CLAIMS } from './verify'

export { isPackageUsable } from './offline-package'

const claimNameOf = (vct: string, label: string): string => {
  const claimName = claimNameFor(vct, label)

  if (!claimName) {
    throw new Error(`Unsupported offline claim: ${label}`)
  }

  return claimName
}

export const createOfflinePresentation = (
  offlinePackage: OfflinePackage,
  selectedFields: readonly string[]
): string => {
  const vct = readIssuerClaims(offlinePackage)?.vct
  const mandatory = vct ? MANDATORY_CLAIMS[vct] : undefined

  if (!vct || !mandatory) {
    throw new Error('This credential cannot be presented offline.')
  }

  const selectedClaims = selectedFields
    // D-011: the handwritten signature image never travels offline.
    .filter((field) => !LABELS_NOT_OFFLINE.has(field))
    .map((field) => claimNameOf(vct, field))

  // Mandatory claims are always presented, because a verifier rejects a presentation without them,
  // so the code works even before the citizen has chosen optional fields.
  const claimNames = [...new Set([...mandatory, ...selectedClaims])]

  const disclosures = claimNames.flatMap((claimName) => {
    const disclosure = offlinePackage.disclosures[claimName]

    if (disclosure) {
      return [disclosure]
    }

    if (mandatory.includes(claimName)) {
      throw new Error(`Offline claim is not cached: ${claimName}`)
    }

    // The backend omits optional claims the citizen has no value for, so there is nothing to show.
    return []
  })

  return [offlinePackage.issuerSignedCredential, ...disclosures, ''].join('~')
}
