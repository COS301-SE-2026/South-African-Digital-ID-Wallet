import { isAxiosError, type AxiosResponse } from 'axios'

import api from '@/lib/api'
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

const requestOfflinePackage = (
  credentialId: string
): Promise<OfflinePackageResponse> =>
  api
    .post(offlineUrls.package(credentialId))
    .then((res: AxiosResponse<unknown>) =>
      offlinePackageResponseSchema.parse(res.data)
    )

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

const offlineService = {
  requestOfflinePackage,
  requestIssuerKeys,
  refreshOfflineCache,
}

export default offlineService
