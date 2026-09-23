import type { AxiosResponse } from 'axios'

import api from '@/lib/api'
import {
  readOfflineCache,
  writeOfflineCache,
  type OfflineCache,
  type OfflinePackage,
} from '@/lib/offline/offline-cache'

import offlineUrls from './offline-urls'
import type { IssuerKeysResponse, OfflinePackageResponse } from './types'

const requestOfflinePackage = (credentialId: string) =>
  api
    .post(offlineUrls.package(credentialId))
    .then((res: AxiosResponse<OfflinePackageResponse>) => res.data)

const requestIssuerKeys = () =>
  api
    .get(offlineUrls.issuerKeys())
    .then((res: AxiosResponse<IssuerKeysResponse>) => res.data)

const toOfflinePackage = (
  response: OfflinePackageResponse
): OfflinePackage => ({
  issuerSignedCredential: response.issuerSignedCredential,
  disclosures: response.disclosures,
  signedAt: response.signedAt,
  expiresAt: response.expiresAt,
})

const nowInSeconds = () => Math.floor(Date.now() / 1000)

const toTrustData = (
  response: IssuerKeysResponse,
  existing: OfflineCache['trust']
): NonNullable<OfflineCache['trust']> => ({
  keys: response.keys,
  retrievedAt: nowInSeconds(),
  revokedIndexes: existing?.revokedIndexes ?? [],
})

const refreshOfflineCache = async (
  credentialId: string
): Promise<OfflineCache> => {
  const existing = await readOfflineCache()

  const [packageResult, trustResult] = await Promise.allSettled([
    requestOfflinePackage(credentialId),
    requestIssuerKeys(),
  ])

  if (
    packageResult.status === 'rejected' &&
    trustResult.status === 'rejected'
  ) {
    if (existing) {
      return existing
    }

    throw packageResult.reason
  }

  const refreshed: OfflineCache = {
    // Only this credential's entry changes, so the citizen's other credential stays presentable.
    packages:
      packageResult.status === 'fulfilled'
        ? {
            ...existing?.packages,
            [credentialId]: toOfflinePackage(packageResult.value),
          }
        : (existing?.packages ?? {}),
    trust:
      trustResult.status === 'fulfilled'
        ? toTrustData(trustResult.value, existing?.trust ?? null)
        : (existing?.trust ?? null),
    savedAt: nowInSeconds(),
  }

  await writeOfflineCache(refreshed)

  return refreshed
}

const offlineService = {
  requestOfflinePackage,
  requestIssuerKeys,
  refreshOfflineCache,
}

export default offlineService
