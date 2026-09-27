import type { z } from 'zod'
import type { IssuerKey } from '@/lib/offline/verify'
import type { offlinePackageResponseSchema } from './schema'

export type OfflinePackageResponse = z.infer<
  typeof offlinePackageResponseSchema
>

export type IssuerKeyResponse = IssuerKey

export type IssuerKeysResponse = {
  keys: IssuerKeyResponse[]
  retrievedAt: string
}
