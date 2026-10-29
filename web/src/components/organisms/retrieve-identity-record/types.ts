import { IdentityRecord } from '@/types'

export type RetrieveIdentityRecordProps = {
  idNumber: string
  setIdNumber: (v: string) => void
  idConsent: boolean
  setConsent: (v: boolean) => void
  record: IdentityRecord | null
  retrieveIdentityRecord: () => void
  isRetrieving: boolean
  errors: Record<string, string>
  setErrors: (r: Record<string, string>) => void
}
