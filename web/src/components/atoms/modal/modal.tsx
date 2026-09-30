'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  modalCloseButtonClassName,
  modalOverlayClassName,
  modalPanelClassName,
} from './modal-styles'
import type { ModalProps } from './types'

export const Modal = ({
  isOpen,
  onClose,
  children,
  className,
  dataCy,
}: Readonly<ModalProps>) => {
  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <dialog
      open
      aria-modal="true"
      data-cy={dataCy}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      className={cn(
        modalOverlayClassName,
        'm-0 h-full max-h-none w-full max-w-none border-0'
      )}
    >
      <div className={cn(modalPanelClassName, 'max-w-5xl', className)}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={cn(
            modalCloseButtonClassName,
            'absolute right-4 top-4 z-10'
          )}
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </dialog>
  )
}
