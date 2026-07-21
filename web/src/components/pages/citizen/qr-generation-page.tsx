'use client'

import * as React from 'react'
import { Text } from '@/components/atoms'
import {
  CredentialSelector,
  FieldSelectionForm,
  DisclosurePreview,
  QrDisplay,
} from '@/components/organisms'
import type { QrDisclosureSelection } from '@/services/qr-service'

type Step = 'select-credential' | 'select-fields' | 'preview' | 'display'

export const QrGenerationPage = () => {
  const [step, setStep] = React.useState<Step>('select-credential')
  const [credentialId, setCredentialId] = React.useState<string | null>(null)
  const [selection, setSelection] =
    React.useState<QrDisclosureSelection | null>(null)

  const handleCredentialSelect = (id: string) => {
    setCredentialId(id)
    setStep('select-fields')
  }

  const handleFieldSelectionContinue = (
    newSelection: QrDisclosureSelection
  ) => {
    setSelection(newSelection)
    setStep('preview')
  }

  const handlePreviewConfirm = () => {
    setStep('display')
  }

  const handlePreviewBack = () => {
    setStep('select-fields')
  }

  const handleDisplayBack = () => {
    setStep('preview')
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <Text variant="h3">Generate QR code</Text>

      {step === 'select-credential' && (
        <CredentialSelector onSelect={handleCredentialSelect} />
      )}

      {step === 'select-fields' && credentialId && (
        <FieldSelectionForm
          credentialId={credentialId}
          onContinue={handleFieldSelectionContinue}
        />
      )}

      {step === 'preview' && selection && (
        <DisclosurePreview
          selection={selection}
          onConfirm={handlePreviewConfirm}
          onBack={handlePreviewBack}
        />
      )}

      {step === 'display' && selection && (
        <QrDisplay selection={selection} onBack={handleDisplayBack} />
      )}
    </div>
  )
}
