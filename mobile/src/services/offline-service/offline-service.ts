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

const toUnixSeconds = (value: string): number => {
  const milliseconds = Date.parse(value)

  if (Number.isNaN(milliseconds)) {
    throw new Error(
      'The issuer key response contained an invalid retrieval time.'
    )
  }

  return Math.floor(milliseconds / 1000)
}

const toOfflinePackage = (
  response: OfflinePackageResponse
): OfflinePackage => ({
  issuerSignedCredential: response.issuerSignedCredential,
  disclosures: response.disclosures,
  signedAt: response.signedAt,
  expiresAt: response.expiresAt,
})

const toTrustData = (
  response: IssuerKeysResponse,
  existing: OfflineCache['trust']
): NonNullable<OfflineCache['trust']> => ({
  keys: response.keys,
  retrievedAt: toUnixSeconds(response.retrievedAt),
  revokedIndexes: existing?.revokedIndexes ?? [],
})

const refreshOfflineCache = async (
  credentialId: string
): Promise<OfflineCache> => {
  const existing = await readOfflineCache()

  let offlinePackage = existing?.package ?? null
  let trust = existing?.trust ?? null
  let packageRefreshed = false
  let trustRefreshed = false
  let packageError: unknown
  let trustError: unknown

  try {
    offlinePackage = toOfflinePackage(await requestOfflinePackage(credentialId))
    packageRefreshed = true
  } catch (error) {
    packageError = error
  }

  try {
    trust = toTrustData(await requestIssuerKeys(), existing?.trust ?? null)
    trustRefreshed = true
  } catch (error) {
    trustError = error
  }

  if (!packageRefreshed && !trustRefreshed) {
    if (existing) {
      return existing
    }

    throw (
      packageError ??
      trustError ??
      new Error('Unable to refresh offline verification data.')
    )
  }

  const refreshed: OfflineCache = {
    package: offlinePackage,
    trust,
    savedAt: Math.floor(Date.now() / 1000),
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
