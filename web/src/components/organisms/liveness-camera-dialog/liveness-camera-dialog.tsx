'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

type LivenessCameraDialogProps = {
  open: boolean
  authToken: string
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  onError?: (message: string) => void
}

type AzureFaceLivenessElement = HTMLElement & {
  start: (authToken: string) => Promise<unknown>
}

export function LivenessCameraDialog({
  open,
  authToken,
  onOpenChange,
  onComplete,
  onError,
}: Readonly<LivenessCameraDialogProps>) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const detectorRef = React.useRef<AzureFaceLivenessElement | null>(null)

  const [isStarting, setIsStarting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  React.useEffect(() => {
    if (!open || !authToken) {
      return
    }

    const container = containerRef.current

    if (!container) {
      return
    }

    let disposed = false

    const startLiveness = async () => {
      setIsStarting(true)
      setErrorMessage('')

      try {
        await import('@azure/ai-vision-face-ui')

        await customElements.whenDefined('azure-ai-vision-face-ui')

        if (disposed) {
          return
        }

        container.innerHTML = ''

        const detector = document.createElement(
          'azure-ai-vision-face-ui'
        ) as AzureFaceLivenessElement

        detectorRef.current = detector
        container.appendChild(detector)

        if (typeof detector.start !== 'function') {
          throw new Error(
            'Azure Face Liveness component did not initialise correctly.'
          )
        }

        setIsStarting(false)

        await detector.start(authToken)

        if (disposed) {
          return
        }

        onComplete()
      } catch (error) {
        if (disposed) {
          return
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Unable to start face verification.'

        setErrorMessage(message)
        setIsStarting(false)
        onError?.(message)
      }
    }

    void startLiveness()

    return () => {
      disposed = true
      detectorRef.current = null

      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [open, authToken, onComplete, onError])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="relative flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
          <div>
            <p className="text-xs text-white/60">Identity Verification</p>

            <h2 className="text-base font-semibold">Face Liveness Check</h2>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />

            <span className="sr-only">Close verification</span>
          </Button>
        </div>

        <div className="relative min-h-0 flex-1 bg-black">
          {isStarting && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black text-white">
              <div className="text-center">
                <div className="mx-auto size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                <p className="mt-4 text-sm text-white/70">
                  Preparing secure camera...
                </p>
              </div>
            </div>
          )}

          <div ref={containerRef} className="h-full w-full" />
        </div>

        {errorMessage && (
          <div className="border-t border-red-500/20 bg-red-500/10 px-5 py-4">
            <p role="alert" className="text-sm text-red-200">
              {errorMessage}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-3 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => {
                setErrorMessage('')
                onOpenChange(false)
              }}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
