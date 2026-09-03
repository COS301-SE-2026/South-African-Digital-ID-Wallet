export interface ConsentToVerifyProps {
  isOpen: boolean
  onClose: () => void
  onConsent: () => void
  userName: string
  userInitials?: string
}
