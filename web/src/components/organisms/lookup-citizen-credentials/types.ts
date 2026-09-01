import type { CitizenCredentialStatus } from '@/types'

export type LookupCitizenCredentialsProps = {
  citizen: CitizenCredentialStatus | null
  className?: string
  errors: Record<string, string>
  isPending: boolean
  notFound: boolean
  onLookup: () => void
  saId: string
  setErrors: (errors: Record<string, string>) => void
  setSaId: (saId: string) => void
}
