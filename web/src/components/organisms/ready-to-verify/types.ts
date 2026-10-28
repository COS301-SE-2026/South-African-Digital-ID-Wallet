export interface ReadyToVerifyProps {
  isOpen: boolean
  onClose: () => void
  onStartVerification: () => void
  onCancel: () => void
  userName: string
  userInitials?: string
  // True while the liveness session is being created
  isLoading?: boolean
}
