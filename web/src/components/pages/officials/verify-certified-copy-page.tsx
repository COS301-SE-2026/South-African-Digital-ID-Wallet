'use client'

import {
  DragEvent,
  FC,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ArrowLeft,
  FileText,
  QrCode,
  Upload,
} from 'lucide-react'

import { Modal, Text } from '@/components/atoms'
import { CertifiedCopyVerification } from '@/components/molecules'
import { QrCameraScanner } from '@/components/organisms/qr-camera-scanner'

type VerificationState =
  | 'progress'
  | 'authentic'
  | 'failed'
  | null

export const VerifyCertifiedCopyPage: FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [verificationState, setVerificationState] =
    useState<VerificationState>(null)

  const [cameraOpen, setCameraOpen] = useState(false)

  const [currentStep, setCurrentStep] = useState(3)

  const [shouldFail, setShouldFail] = useState(false)

  useEffect(() => {
    if (verificationState !== 'progress') {
      return
    }

    setCurrentStep(3)

    const fourthStepTimer = window.setTimeout(() => {
      setCurrentStep(4)
    }, 900)

    const fifthStepTimer = window.setTimeout(() => {
      setCurrentStep(5)
    }, 1800)

    const resultTimer = window.setTimeout(() => {
      setVerificationState(
        shouldFail ? 'failed' : 'authentic'
      )
    }, 3000)

    return () => {
      window.clearTimeout(fourthStepTimer)
      window.clearTimeout(fifthStepTimer)
      window.clearTimeout(resultTimer)
    }
  }, [shouldFail, verificationState])

  const startVerification = (value = '') => {
    const lowerValue = value.toLowerCase()

    const failedDocument =
      lowerValue.includes('fail') ||
      lowerValue.includes('invalid') ||
      lowerValue.includes('tampered')

    setShouldFail(failedDocument)
    setCurrentStep(3)
    setVerificationState('progress')
  }

  const handleFileSelected = (file?: File) => {
    if (!file) {
      return
    }

    if (file.type !== 'application/pdf') {
      return
    }

    startVerification(file.name)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const file = event.dataTransfer.files?.[0]

    handleFileSelected(file)
  }

  const closeVerificationModal = () => {
    setVerificationState(null)
    setCurrentStep(3)
  }

  const openCameraModal = () => {
    setCameraOpen(true)
  }

  const closeCameraModal = () => {
    setCameraOpen(false)
  }

  const handleQrScan = (rawText: string) => {
    setCameraOpen(false)
    startVerification(rawText)
  }

  return (
    <main className="min-h-full bg-cream-background px-4 py-4 text-deep-green sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
          <div className="rounded-[24px] bg-card p-4 sm:p-6">
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-grey bg-clean-white px-5 py-8 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
                <FileText className="h-7 w-7" />
              </div>

              <Text
                as="h2"
                variant="h4"
                className="mt-4 text-text-primary"
              >
                Upload Certified Copy PDF
              </Text>

              <Text variant="sub-sm" className="mt-2">
                Drag and drop your PDF here
              </Text>

              <Text variant="caption" className="my-3">
                or
              </Text>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => {
                  handleFileSelected(
                    event.target.files?.[0]
                  )

                  event.target.value = ''
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-deep-green px-8 text-sm font-semibold text-deep-green transition-colors hover:bg-primary-green/5"
              >
                <Upload className="h-4 w-4" />
                Choose File
              </button>

              <Text variant="caption" className="mt-4">
                Only PDF files are accepted (max 10 MB)
              </Text>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border-grey" />

              <Text variant="caption">
                Alternatively
              </Text>

              <div className="h-px flex-1 bg-border-grey" />
            </div>

            <button
              type="button"
              onClick={openCameraModal}
              className="flex w-full items-center gap-3 rounded-xl border border-border-grey bg-clean-white px-5 py-4 text-left transition-colors hover:border-deep-green hover:bg-primary-green/5"
            >
              <QrCode className="h-7 w-7 text-primary-green" />

              <span>
                <Text
                  variant="sub-sm"
                  className="font-semibold text-deep-green"
                >
                  Scan QR Code
                </Text>

                <Text
                  variant="caption"
                  className="mt-1 block"
                >
                  Use your camera to scan the verification QR code
                </Text>
              </span>
            </button>
          </div>
        </div>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
          <div className="relative w-full max-w-3xl [&_.aspect-square]:!aspect-[4/3]">
            <button
              type="button"
              onClick={closeCameraModal}
              aria-label="Back to verification options"
              className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-deep-green transition-colors hover:bg-primary-green/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <QrCameraScanner onScan={handleQrScan} />
          </div>
        </div>
      )}

      <Modal
        isOpen={verificationState !== null}
        onClose={closeVerificationModal}
        className="h-fit min-h-0 max-h-[90vh] !w-full !max-w-xl overflow-y-auto p-5 sm:!w-full sm:!max-w-xl sm:p-8"
      >
        <div className="flex w-full items-center justify-center">
          {verificationState && (
            <CertifiedCopyVerification
              state={verificationState}
              currentStep={currentStep}
              onViewCredentialDetails={closeVerificationModal}
              onVerifyAnotherDocument={closeVerificationModal}
              onContactSupport={() => undefined}
            />
          )}
        </div>
      </Modal>
    </main>
  )
}