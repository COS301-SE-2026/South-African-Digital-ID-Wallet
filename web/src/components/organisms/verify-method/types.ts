export type VerifyMethodOption = 'code' | 'id'
export interface VerifyMethodProps {
  isOpen: boolean
  onClose: () => void
  onSelectMethod: (method: VerifyMethodOption) => void
}
