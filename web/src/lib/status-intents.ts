import type { StatusPillIntent } from '@/components/atoms'
import type { CitizenStatus, CredentialStatus, CredentialType } from '@/types'

export const CITIZEN_STATUS_INTENTS: Record<CitizenStatus, StatusPillIntent> = {
  Activated: 'active',
  Deactivated: 'danger',
  Pending: 'warning',
  Suspended: 'danger',
  Verified: 'warning',
}

export const CREDENTIAL_STATUS_INTENTS: Record<
  CredentialStatus,
  StatusPillIntent
> = {
  Active: 'active',
  Expired: 'inactive',
  Inactive: 'inactive',
  Investigation: 'warning',
  Revoked: 'danger',
}

export const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  DriversLicense: "Driver's Licence",
  IdentityDocument: 'South African Identity Document',
}
