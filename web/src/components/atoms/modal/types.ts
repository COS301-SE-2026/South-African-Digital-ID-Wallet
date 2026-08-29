import type { ReactNode } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  dataCy?: string
}
