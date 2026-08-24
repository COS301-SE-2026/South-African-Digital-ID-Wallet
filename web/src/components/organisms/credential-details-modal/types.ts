import type { CredentialStatus } from '@/services/credential-service'
import type { RevocationReason } from '@/components/organisms/revoke-credentials-modal'
export type CredentialType = 'drivers-licence' | 'id-card'
export type { CredentialStatus }

export interface CredentialDetail {
  id: string
  type: CredentialType
  label: string
  credentialId: string
  status: CredentialStatus
  issuedOn: string
  expiresOn: string
  citizen: {
    fullName: string
    idNumber: string
    dateOfBirth: string
    email: string
    phone: string
    address: string
  }
  issuedBy: {
    administrator: string
    department: string
    office: string
    reference: string
  }
  activity: {
    verifications: number
    lastVerifiedOn: string
    lastVerifiedAt: string
    devicesUsed: number
  }
}

export interface CredentialDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  citizenName: string
  credentials: CredentialDetail[]
  onReinstate?: (credential: CredentialDetail) => void | Promise<void>
  onRevoke?: (
    credential: CredentialDetail,
    payload: { reason: RevocationReason; notes: string }
  ) => void | Promise<void>
}
