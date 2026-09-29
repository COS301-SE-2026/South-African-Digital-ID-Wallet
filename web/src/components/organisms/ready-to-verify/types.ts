export interface ReadyToVerifyProps {
  isOpen: boolean
  onClose: () => void
  onStartVerification: () => void
  onCancel: () => void
  userName: string
  userInitials?: string
}
