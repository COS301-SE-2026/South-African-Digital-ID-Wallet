'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
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
      className="fixed inset-0 z-50 m-0 flex h-full w-full items-start justify-center overflow-y-auto border-0 bg-black/50 p-0 sm:items-center sm:px-6 sm:py-8"
    >
      <div
        className={cn(
          'relative flex min-h-screen w-full flex-col bg-[#f6f2ea] sm:min-h-0 sm:max-h-[95vh] sm:w-[98vw] sm:max-w-5xl sm:rounded-2xl',
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted-text hover:bg-black/5"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </dialog>
  )
}
