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

  return null
}