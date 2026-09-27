import { isAxiosError, type AxiosResponse } from 'axios'
import api from '@/lib/api'
import { getDevicePublicJwk } from '@/lib/offline/device-key'
import {
  clearOfflineCache,
  readOfflineCache,
  writeOfflineCache,
  type OfflineCache,
  type OfflinePackage,
  type OfflineVerification,
} from '@/lib/offline/offline-cache'
import { isPackageUsable } from '@/lib/offline/offline-package'
import { verifyRevocationList } from '@/lib/offline/verify'
import offlineUrls from './offline-urls'
import {
  issuerKeySchema,
  issuerKeysResponseSchema,
  offlinePackageResponseSchema,
  revocationListResponseSchema,
} from './schema'
import type { IssuerKeysResponse, OfflinePackageResponse } from './types'

// 400 not active, 403 not this citizen's, 404 gone. The backend will never issue this package again,
// so keeping the old one would let a revoked or deleted credential be presented offline.
const PERMANENT_PACKAGE_FAILURES = new Set([400, 403, 404])

// The backend accepts at most 100 scans per upload.
const SYNC_BATCH_SIZE = 100
// A verifier offline for weeks could otherwise grow the cache without limit, so past this the oldest go.
const MAX_QUEUED_VERIFICATIONS = 1000
const PERMANENT_SYNC_FAILURES = new Set([400, 403])

// The public key goes with every request: the backend binds the credential to it as cnf and re-mints when it changes.
// On Android a reinstall create a new key. On iOS the Keychain usually keeps it across one.
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

const requestRevocationList = (): Promise<string> =>
  api
    .get(offlineUrls.revocationList())
    .then(
      (res: AxiosResponse<unknown>) =>
        revocationListResponseSchema.parse(res.data).revocationList
    )

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

const nextTrustData = (
  keysResult: PromiseSettledResult<IssuerKeysResponse>,
  listResult: PromiseSettledResult<string>,
  existing: OfflineCache['trust'],
  now: number
): OfflineCache['trust'] => {
  // The phone's own clock for the key set, deliberately not the server's retrievedAt: the verifier compares
  // against this clock, so the age is exact even when the phone's clock is wrong.
  const keySet =
    keysResult.status === 'fulfilled'
      ? { keys: keysResult.value.keys, retrievedAt: now }
      : existing && { keys: existing.keys, retrievedAt: existing.retrievedAt }

  if (!keySet) {
    return null
  }

  // A list only counts once its signature checks out against the keys it will be used with, and never
  // replaces a newer one: a replayed older list would un-revoke a credential and reset the staleness clock.
  const list =
    listResult.status === 'fulfilled'
      ? verifyRevocationList(listResult.value, keySet.keys)
      : null
  const newer =
    list && list.issuedAt > (existing?.revocationRetrievedAt ?? -Infinity)
      ? list
      : null

  return {
    ...keySet,
    revokedIndexes: newer?.revokedIndexes ?? existing?.revokedIndexes ?? [],
    revocationRetrievedAt:
      newer?.issuedAt ?? existing?.revocationRetrievedAt ?? null,
  }
}

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

// Every change reads the cache, changes part of it and writes it back. Two running at once would
// both start from the same cache, and the later write would drop the other's change.
const serialised = <T>(task: () => Promise<T>): Promise<T> => {
  const run = refreshQueue.then(task, task)
  refreshQueue = run.catch(() => undefined)

  return run
}

const refreshOfflineCache = (credentialId: string): Promise<OfflineCache> =>
  serialised(async () => {
    const existing = await readOfflineCache()

    // Independent requests, so one failing never blocks the others.
    const [packageResult, keysResult, listResult] = await Promise.allSettled([
      requestOfflinePackage(credentialId),
      requestIssuerKeys(),
      requestRevocationList(),
    ])

    // Only when all three fail: a list fetched on its own still verifies against the keys already stored.
    if (
      packageResult.status === 'rejected' &&
      keysResult.status === 'rejected' &&
      listResult.status === 'rejected'
    ) {
      if (existing) {
        return existing
      }

      // Both causes are kept: offline, the key fetch failure is often the more useful one.
      throw new Error(
        `Offline data could not be refreshed. Package: ${messageOf(packageResult.reason)}. Issuer keys: ${messageOf(keysResult.reason)}.`
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
      trust: nextTrustData(
        keysResult,
        listResult,
        existing?.trust ?? null,
        now
      ),
      savedAt: now,
      pendingVerifications: existing?.pendingVerifications ?? [],
    }

    await writeOfflineCache(refreshed)

    return refreshed
  })

// For the verifier's phone: issuer keys and the revocation list only, since a verifier may hold no
// credential of its own.
const refreshTrustData = (): Promise<OfflineCache> =>
  serialised(async () => {
    const existing = await readOfflineCache()
    const [keysResult, listResult] = await Promise.allSettled([
      requestIssuerKeys(),
      requestRevocationList(),
    ])

    if (keysResult.status === 'rejected' && listResult.status === 'rejected') {
      // Out of signal or the requests failed: keep verifying with what the phone already has.
      if (existing) {
        return existing
      }

      throw keysResult.reason
    }

    const now = nowInSeconds()
    const refreshed: OfflineCache = {
      // Expired packages are pruned here too, so none outlives its usefulness on the phone.
      packages: Object.fromEntries(
        Object.entries(existing?.packages ?? {}).filter(([, offlinePackage]) =>
          isPackageUsable(offlinePackage, now)
        )
      ),
      trust: nextTrustData(
        keysResult,
        listResult,
        existing?.trust ?? null,
        now
      ),
      savedAt: now,
      pendingVerifications: existing?.pendingVerifications ?? [],
    }

    await writeOfflineCache(refreshed)

    return refreshed
  })

const queueOfflineVerification = (
  verification: OfflineVerification
): Promise<void> =>
  serialised(async () => {
    const existing = await readOfflineCache()

    await writeOfflineCache({
      packages: existing?.packages ?? {},
      trust: existing?.trust ?? null,
      savedAt: existing?.savedAt ?? nowInSeconds(),
      pendingVerifications: [
        ...(existing?.pendingVerifications ?? []),
        verification,
      ].slice(-MAX_QUEUED_VERIFICATIONS),
    })
  })

// The verifier is known from the session, so it is not sent with each entry.
const toUploadEntry = ({
  verifierId: _verifierId,
  ...entry
}: OfflineVerification) => entry

// Uploads this official's queued scans in batches, saving after each one, so a failure part-way keeps what was
// sent. Scans queued by anyone else stay until they sign in, or uploading them would name the wrong verifier.
const syncOfflineVerifications = (verifierId: string): Promise<number> =>
  serialised(async () => {
    const existing = await readOfflineCache()
    let remaining = existing?.pendingVerifications ?? []
    let mine = remaining.filter((entry) => entry.verifierId === verifierId)
    let uploaded = 0

    while (existing && mine.length > 0) {
      const batch = mine.slice(0, SYNC_BATCH_SIZE)

      try {
        await api.post(offlineUrls.offlineVerifications(), {
          entries: batch.map(toUploadEntry),
        })
      } catch (error) {
        // These can never succeed for this batch, so it is dropped rather than blocking every later upload. Anything
        // else, such as no signal, a 409 race or a server error, keeps the batch for the next attempt.
        if (
          !isAxiosError(error) ||
          !PERMANENT_SYNC_FAILURES.has(error.response?.status ?? 0)
        ) {
          throw error
        }
      }

      const sent = new Set(batch.map((entry) => entry.id))
      remaining = remaining.filter((entry) => !sent.has(entry.id))
      mine = mine.slice(batch.length)
      uploaded += batch.length
      await writeOfflineCache({ ...existing, pendingVerifications: remaining })
    }

    return uploaded
  })

// Called when a session ends. Serialised with every other cache write, so a sync still running cannot write the
// signed-out user's data back afterwards. Queued scans survive: an official whose session expires offline must not
// lose them, and they upload only when that official signs in again.
const clearOfflineData = (): Promise<void> =>
  serialised(async () => {
    const pending = (await readOfflineCache())?.pendingVerifications ?? []

    await clearOfflineCache()

    if (pending.length > 0) {
      await writeOfflineCache({
        packages: {},
        trust: null,
        savedAt: nowInSeconds(),
        pendingVerifications: pending,
      })
    }
  })

const offlineService = {
  requestOfflinePackage,
  requestIssuerKeys,
  refreshOfflineCache,
  refreshTrustData,
  queueOfflineVerification,
  syncOfflineVerifications,
  clearOfflineData,
}

export default offlineService
