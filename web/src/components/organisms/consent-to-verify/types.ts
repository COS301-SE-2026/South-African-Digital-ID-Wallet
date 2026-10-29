export interface ConsentToVerifyProps {
  isOpen: boolean
  onClose: () => void
  onConsent: () => void
  userName: string
  userInitials?: string
  // True while the consent request is in flight
  isLoading?: boolean
}
