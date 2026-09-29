'use client'

import { DragEvent, FC, useEffect, useRef, useState } from 'react'
import { ArrowLeft, FileText, QrCode, Upload } from 'lucide-react'
import { Button, Modal, Text } from '@/components/atoms'
import { CertifiedCopyVerification } from '@/components/molecules'
import { QrCameraScanner } from '@/components/organisms/qr-camera-scanner'
import certifiedCopyService from '@/services/certified-copy-service/certified-copy-service'
import type { VerifyCertifiedCopyDocumentResponse } from '@/services/certified-copy-service/types'

type VerificationState = 'progress' | 'authentic' | 'failed' | null
const MAX_PDF_FILE_SIZE = 10 * 1024 * 1024
export const VerifyCertifiedCopyPage: FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [verificationState, setVerificationState] =
    useState<VerificationState>(null)
  const [verificationResult, setVerificationResult] =
    useState<VerifyCertifiedCopyDocumentResponse | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(3)
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  )
  useEffect(() => {
    if (verificationState !== 'progress') {
      return
    }
    const fourthStepTimer = window.setTimeout(() => {
      setCurrentStep(4)
    }, 400)
    const fifthStepTimer = window.setTimeout(() => {
      setCurrentStep(5)
    }, 900)
    return () => {
      window.clearTimeout(fourthStepTimer)
      window.clearTimeout(fifthStepTimer)
    }
  }, [verificationState])
  const runDocumentVerification = async (document: File): Promise<void> => {
    setVerificationError(null)
    setVerificationResult(null)
    setCurrentStep(3)
    setVerificationState('progress')
    try {
      const result = await certifiedCopyService.verifyDocument(document)
      setVerificationResult(result)
      setCurrentStep(5)
      setVerificationState(result.isValid ? 'authentic' : 'failed')
    } catch {
      setVerificationResult(null)
      setCurrentStep(5)
      setVerificationState('failed')
      setVerificationError(
        'The verification service could not be reached. Please try again.'
      )
    }
  }
  const handleFileSelected = (file?: File) => {
    if (!file) {
      return
    }
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setVerificationError('Only PDF files are accepted.')
      return
    }
    if (file.size > MAX_PDF_FILE_SIZE) {
      setVerificationError('The PDF document must be smaller than 10 MB.')
      return
    }
    setSelectedDocument(file)
    setVerificationError(null)
    void runDocumentVerification(file)
  }
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleFileSelected(event.dataTransfer.files?.[0])
  }
  const closeVerificationModal = () => {
    setVerificationState(null)
    setVerificationResult(null)
    setCurrentStep(3)
  }
  const resetVerification = () => {
    setVerificationState(null)
    setVerificationResult(null)
    setCurrentStep(3)
    setSelectedDocument(null)
    setVerificationError(null)
  }
  const openCameraModal = () => {
    setCameraOpen(true)
  }
  const closeCameraModal = () => {
    setCameraOpen(false)
  }

  const handleQrScan = (rawText: string) => {
    const value = rawText.trim()
    if (!value) {
      setVerificationError('The QR code did not contain a verification link.')
      return
    }
    const publicUrl = /^https?:\/\//i.test(value) ? value : `http://${value}`
    try {
      const url = new URL(publicUrl)
      const hasVerificationPath = /\/verify-certified-copy\/[^/]+\/?$/i.test(
        url.pathname
      )
      if (!hasVerificationPath) {
        throw new Error('Invalid verification path')
      }
      window.location.assign(url.toString())
    } catch {
      setVerificationError(
        'This QR code does not contain a valid certified-copy verification link.'
      )
    }
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
              <Text as="h2" variant="h4" className="mt-4 text-text-primary">
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
                  handleFileSelected(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
              <Button
                type="button"
                variant="secondary"
                LeftIcon={Upload}
                onClick={() => fileInputRef.current?.click()}
                className="!w-auto px-8"
              >
                Choose File
              </Button>
              <Text variant="caption" className="mt-4">
                Only PDF files are accepted (max 10 MB)
              </Text>
              {selectedDocument && (
                <Text variant="caption" className="mt-2">
                  Selected: {selectedDocument.name}
                </Text>
              )}
            </div>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border-grey" />
              <Text variant="caption">Alternatively, scan the QR code</Text>
              <div className="h-px flex-1 bg-border-grey" />
            </div>
            <Button
              type="button"
              variant="custom"
              LeftIcon={QrCode}
              onClick={openCameraModal}
              className="!flex !h-auto !w-full items-center !justify-start gap-4
               rounded-xl border border-deep-green bg-clean-white px-5 py-4 
               text-left text-deep-green 
               transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-green/5 hover:shadow-sm"
              iconClassName="h-7 w-7 text-primary-green"
            >
              <span className="flex flex-col items-start">
                <Text
                  as="span"
                  variant="sub-sm"
                  className="font-semibold text-deep-green"
                >
                  Scan QR Code
                </Text>
                <Text
                  as="span"
                  variant="caption"
                  className="mt-1 block whitespace-normal leading-5 text-muted-text text-left"
                >
                  Open the public certified-copy verification page
                </Text>
              </span>
            </Button>
            {verificationError && (
              <Text
                variant="caption"
                className="mt-4 text-center text-danger-red"
              >
                {verificationError}
              </Text>
            )}
            {selectedDocument && (
              <Button
                type="button"
                variant="text"
                onClick={resetVerification}
                className="mx-auto mt-4 !h-auto !w-auto !px-0 !py-0 text-sm underline"
              >
                Clear verification
              </Button>
            )}
          </div>
        </div>
      </div>
      {cameraOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center 
                justify-center bg-black/50 p-4 sm:p-6"
        >
          <div className="relative w-full max-w-xl">
            <div className="pt-12 [&_.aspect-square]:!aspect-[4/3]">
              <QrCameraScanner onScan={handleQrScan} />
            </div>

            <Button
              type="button"
              variant="text"
              onClick={closeCameraModal}
              aria-label="Back to verification options"
              className="!absolute left-6 top-16 z-20 !h-10 !w-10 !min-w-0 
                !rounded-full !p-0 text-deep-green hover:bg-primary-green/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
      <Modal
        isOpen={verificationState !== null}
        onClose={closeVerificationModal}
        className="!m-0 !h-auto !min-h-0 !w-[calc(100vw-3rem)] !max-w-xl 
        !overflow-visible !bg-transparent !p-0 sm:!w-[calc(100vw-4rem)]"
      >
        <div
          className="rounded-[26px] 
              bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]"
        >
          <div
            className="max-h-[calc(100dvh-2rem)] overflow-y-auto 
          rounded-[calc(1.5rem-2px)] bg-clean-white p-4 sm:max-h-[90vh] sm:p-8"
          >
            {verificationState && (
              <CertifiedCopyVerification
                state={verificationState}
                currentStep={currentStep}
                result={verificationResult}
                onViewCredentialDetails={closeVerificationModal}
                onVerifyAnotherDocument={resetVerification}
                onContactSupport={() => undefined}
              />
            )}
          </div>
        </div>
      </Modal>
    </main>
  )
}
