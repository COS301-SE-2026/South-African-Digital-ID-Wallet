import { isAxiosError, type AxiosResponse } from 'axios'

import api from '@/lib/api'
import { getDevicePublicJwk } from '@/lib/offline/device-key'
import {
  readOfflineCache,
  writeOfflineCache,
  type OfflineCache,
  type OfflinePackage,
} from '@/lib/offline/offline-cache'
import { isPackageUsable } from '@/lib/offline/offline-package'

import offlineUrls from './offline-urls'
import {
  issuerKeySchema,
  issuerKeysResponseSchema,
  offlinePackageResponseSchema,
} from './schema'
import type { IssuerKeysResponse, OfflinePackageResponse } from './types'

// 400 not active, 403 not this citizen's, 404 gone. The backend will never issue this package again,
// so keeping the old one would let a revoked or deleted credential be presented offline.
const PERMANENT_PACKAGE_FAILURES = new Set([400, 403, 404])

// The public key goes with every request: the backend binds the credential to it as cnf, and re-mints when it changes, for example after a reinstall.
const requestOfflinePackage = async (
  credentialId: string
): Promise<OfflinePackageResponse> => {
  const deviceKey = await getDevicePublicJwk()
  const res: AxiosResponse<unknown> = await api.post(
    offlineUrls.package(credentialId),
    { deviceKey }
  )

  return offlinePackageResponseSchema.parse(res.data)
}

const requestIssuerKeys = (): Promise<IssuerKeysResponse> =>
  api.get(offlineUrls.issuerKeys()).then((res: AxiosResponse<unknown>) => {
    const response = issuerKeysResponseSchema.parse(res.data)

    return {
      keys: response.keys.flatMap((key) => {
        const parsed = issuerKeySchema.safeParse(key)

        return parsed.success ? [parsed.data] : []
      }),
      retrievedAt: response.retrievedAt,
    }
  })

const toOfflinePackage = (
  response: OfflinePackageResponse
): OfflinePackage => ({
  issuerSignedCredential: response.issuerSignedCredential,
  disclosures: response.disclosures,
  signedAt: response.signedAt,
  expiresAt: response.expiresAt,
})

const nowInSeconds = () => Math.floor(Date.now() / 1000)

const messageOf = (reason: unknown) =>
  reason instanceof Error ? reason.message : String(reason)

const toTrustData = (
  response: IssuerKeysResponse,
  existing: OfflineCache['trust']
): NonNullable<OfflineCache['trust']> => ({
  keys: response.keys,
  // The phone's own clock, deliberately not the server's retrievedAt: the verifier compares against
  // this clock, so the age is exact even when the phone's clock is wrong.
  retrievedAt: nowInSeconds(),
  revokedIndexes: existing?.revokedIndexes ?? [],
  revocationRetrievedAt: existing?.revocationRetrievedAt ?? null,
})

const nextPackages = (
  existing: OfflineCache['packages'],
  credentialId: string,
  result: PromiseSettledResult<OfflinePackageResponse>,
  now: number
): OfflineCache['packages'] => {
  const refreshed =
    result.status === 'fulfilled'
      ? { [credentialId]: toOfflinePackage(result.value) }
      : {}
  const isGone =
    result.status === 'rejected' &&
    isAxiosError(result.reason) &&
    PERMANENT_PACKAGE_FAILURES.has(result.reason.response?.status ?? 0)

  // Expired packages can never verify, so they are not kept on the phone either.
  return Object.fromEntries(
    Object.entries({ ...existing, ...refreshed }).filter(
      ([id, offlinePackage]) =>
        !(isGone && id === credentialId) && isPackageUsable(offlinePackage, now)
    )
  )
}

let refreshQueue: Promise<unknown> = Promise.resolve()

// Every refresh reads the cache, changes part of it and writes it back. Two running at once would
// both start from the same cache, and the later write would drop the other's change.
const serialised = <T>(task: () => Promise<T>): Promise<T> => {
  const run = refreshQueue.then(task, task)
  refreshQueue = run.catch(() => undefined)

  return run
}

const refreshOfflineCache = (credentialId: string): Promise<OfflineCache> =>
  serialised(async () => {
    const existing = await readOfflineCache()

    // Independent requests, so one failing never blocks the other.
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

      // Both causes are kept: offline, the key fetch failure is often the more useful one.
      throw new Error(
        `Offline data could not be refreshed. Package: ${messageOf(packageResult.reason)}. Issuer keys: ${messageOf(trustResult.reason)}.`
      )
    }

    const now = nowInSeconds()
    const refreshed: OfflineCache = {
      packages: nextPackages(
        existing?.packages ?? {},
        credentialId,
        packageResult,
        now
      ),
      trust:
        trustResult.status === 'fulfilled'
          ? toTrustData(trustResult.value, existing?.trust ?? null)
          : (existing?.trust ?? null),
      savedAt: now,
    }

    await writeOfflineCache(refreshed)

    return refreshed
  })

// For the verifier's phone: issuer keys only, since a verifier may hold no credential of its own.
// Serialised like refreshOfflineCache, because it reads and rewrites the same cache.
const refreshTrustData = (): Promise<OfflineCache> =>
  serialised(async () => {
    const existing = await readOfflineCache()

    let keys: IssuerKeysResponse
    try {
      keys = await requestIssuerKeys()
    } catch (error) {
      // Out of signal or the request failed: keep verifying with what the phone already has.
      if (existing) {
        return existing
      }

      throw error
    }

    const now = nowInSeconds()
    const refreshed: OfflineCache = {
      // Expired packages are pruned here too, so none outlives its usefulness on the phone.
      packages: Object.fromEntries(
        Object.entries(existing?.packages ?? {}).filter(([, offlinePackage]) =>
          isPackageUsable(offlinePackage, now)
        )
      ),
      trust: toTrustData(keys, existing?.trust ?? null),
      savedAt: now,
    }

    await writeOfflineCache(refreshed)

    return refreshed
  })

const offlineService = {
  requestOfflinePackage,
  requestIssuerKeys,
  refreshOfflineCache,
  refreshTrustData,
}

export default offlineService
