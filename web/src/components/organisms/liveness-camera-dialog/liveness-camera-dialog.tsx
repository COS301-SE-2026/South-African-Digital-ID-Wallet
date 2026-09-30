'use client'

import * as React from 'react'
import { ScanFace, X } from 'lucide-react'

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
  fontFamily?: string
  fontSize?: string
  buttonStyles?: string
  continueButtonStyles?: string
  feedbackMessageStyles?: string
}

const DEEP_GREEN = '#053b2c'

const INITIALISATION_ERROR_MESSAGE =
  'Azure Face Liveness component did not initialise correctly.'

const LIVENESS_ERROR_MESSAGES: Record<string, string> = {
  CameraPermissionDenied:
    'Camera access was blocked. Allow camera access in your browser and try again.',
  CameraStartupFailure:
    'Your camera could not be started. Close any other app using the camera and try again.',
  InvalidToken:
    'This verification session has expired. Please start the verification again.',
  TimedOut: 'The face check took too long. Please try again.',
  ServerRequestTimedOut:
    'We could not reach the verification service. Check your connection and try again.',
  NoFaceDetected:
    'We could not see your face. Make sure your face is inside the frame and try again.',
  FaceTrackingFailed:
    'We lost track of your face. Hold your device steady and try again.',
  FaceMouthRegionNotVisible:
    'Make sure your whole face is visible, with nothing covering your mouth, and try again.',
  FaceEyeRegionNotVisible:
    'Make sure your eyes are visible, without sunglasses, and try again.',
  FaceWithMaskDetected: 'Please remove your mask and try again.',
  ExcessiveImageBlurDetected:
    'The image was too blurry. Hold your device steady and try again.',
  ExcessiveFaceBrightness:
    'There is too much light on your face. Move away from direct light and try again.',
  EnvironmentNotSupported:
    'The lighting is not suitable. Move to a well-lit area and try again.',
  UserCanceledSession: 'Face verification was cancelled.',
  UserCanceledActiveMotion: 'Face verification was cancelled.',
  UserCanceledActiveMotionPrompt: 'Face verification was cancelled.',
}

const DEFAULT_LIVENESS_ERROR_MESSAGE =
  'Face verification could not be completed. Please try again.'

const SDK_BUTTON_STYLES = [
  `background-color: ${DEEP_GREEN}`,
  'color: #ffffff',
  'border: none',
  'border-radius: 12px',
  'padding: 12px 32px',
  'font-size: 1rem',
  'font-weight: 600',
  'cursor: pointer',
].join('; ')

const SDK_FEEDBACK_MESSAGE_STYLES = [
  `color: ${DEEP_GREEN}`,
  'font-weight: 600',
  'text-align: center',
  'justify-content: center',
  'left: 0',
  'right: 0',
  'width: 100%',
  'margin-left: auto',
  'margin-right: auto',
].join('; ')

const applyFlashIdTheme = (detector: AzureFaceLivenessElement) => {
  try {
    detector.fontFamily = getComputedStyle(document.body).fontFamily
    detector.fontSize = '1.125rem'
    detector.buttonStyles = SDK_BUTTON_STYLES
    detector.continueButtonStyles = SDK_BUTTON_STYLES
    detector.feedbackMessageStyles = SDK_FEEDBACK_MESSAGE_STYLES
  } catch (error) {
    console.warn('Could not apply FlashID theme to the liveness SDK', error)
  }
}

const getLivenessErrorMessage = (error: unknown) => {
  if (
    error instanceof Error &&
    error.message === INITIALISATION_ERROR_MESSAGE
  ) {
    return error.message
  }

  if (error && typeof error === 'object' && 'livenessError' in error) {
    const { livenessError } = error as { livenessError?: string }
    return (
      (livenessError && LIVENESS_ERROR_MESSAGES[livenessError]) ??
      DEFAULT_LIVENESS_ERROR_MESSAGE
    )
  }

  return DEFAULT_LIVENESS_ERROR_MESSAGE
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

        applyFlashIdTheme(detector)

        detectorRef.current = detector
        container.appendChild(detector)

        if (typeof detector.start !== 'function') {
          throw new Error(INITIALISATION_ERROR_MESSAGE)
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

        console.error('Azure Face liveness failed', error)

        const message = getLivenessErrorMessage(error)

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
    <dialog
      open
      aria-modal="true"
      aria-labelledby="liveness-dialog-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none flex-col border-0 bg-card p-0"
    >
      <div className="shrink-0 bg-card">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
              <ScanFace className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-text">Identity Verification</p>
              <h2
                id="liveness-dialog-title"
                className="text-base font-extrabold text-deep-green"
              >
                Face Liveness Check
              </h2>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-deep-green hover:bg-deep-green/10 hover:text-deep-green"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />

            <span className="sr-only">Close verification</span>
          </Button>
        </div>
        <div className="h-[3px] w-full bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green" />
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto bg-card">
        {isStarting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card">
            <div className="text-center">
              <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary-green/20 border-t-primary-green" />

              <p className="mt-4 text-sm text-muted-text">
                Preparing secure camera...
              </p>
            </div>
          </div>
        )}

        <div ref={containerRef} className="h-full w-full" />
      </div>

      {errorMessage && (
        <div className="shrink-0 border-t border-national-red/20 bg-national-red/5 px-4 py-4 sm:px-6">
          <p role="alert" className="text-sm text-national-red">
            {errorMessage}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-3 rounded-full border-deep-green/20 text-deep-green hover:bg-deep-green/10"
            onClick={() => {
              setErrorMessage('')
              onOpenChange(false)
            }}
          >
            Close
          </Button>
        </div>
      )}
    </dialog>
  )
}
