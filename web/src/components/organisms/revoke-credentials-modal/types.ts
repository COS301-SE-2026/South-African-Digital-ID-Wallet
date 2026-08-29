export type RevocationReason =
  | 'expired'
  | 'lost_stolen'
  | 'fraudulent'
  | 'citizen_request'
  | 'compliance_violation'
  | 'other'

export interface RevokeCredentialModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (payload: {
    reason: RevocationReason
    notes: string
  }) => void | Promise<void>
  citizenName: string
  credentialLabel: string
  credentialId: string
  isSubmitting?: boolean
}
