'use client'

import { useRouter } from 'next/navigation'
import { ActivationInfoItem } from '@/components/molecules/activation-info-item'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ShieldCheck, Landmark, WalletCards } from 'lucide-react'
import {
  ActivateCredentialsForm,
  type ActivateCredentialsSelection,
  VerifyIdentityCard,
} from '@/components/organisms'
import {
  ProgressStepper,
  VerificationSuccessModal,
} from '@/components/molecules'
import { activateCredentialsService } from '@/services/activate-credentials-service'
import type { CredentialType } from '@/services/activate-credentials-service'
import { verificationService } from '@/services/verification-service'

const STEPS = ['Verify Identity', 'Activate Credentials']

type VerifyCitizenProps = {
  token?: string
}

export default function VerifyCitizen({ token = '' }: VerifyCitizenProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [saId, setSaId] = useState('')
  const [pin, setPin] = useState('')

  const [selected, setSelected] = useState<ActivateCredentialsSelection>({
    identityDocument: true,
    driversLicense: true,
  })

  const [successOpen, setSuccessOpen] = useState(false)
  const { mutate: verifyCitizen, isPending: isVerifying } = useMutation({
    mutationFn: () => verificationService.verify({ token, saId, pin }),
    onSuccess: () => {
      setSuccessOpen(true)
    },
    onError: () => {
      toast.error('Could not verify your details. Please check and try again.')
    },
  })

  function handleVerification() {
    verifyCitizen()
  }

  const { mutate: activateCredentials, isPending: isActivating } = useMutation({
    mutationFn: (types: CredentialType[]) =>
      activateCredentialsService.activate(types),
    onSuccess: (response) => {
      toast.success(response.message || 'Credentials activated')
      router.push('/citizen/my-credentials')
    },
    onError: () => {
      toast.error('Could not activate credentials. Please try again.')
    },
  })
  function handleActivateSubmit() {
    const types: CredentialType[] = []
    if (selected.identityDocument) types.push('identityDocument')
    if (selected.driversLicense) types.push('driversLicense')
    activateCredentials(types)
  }

  return (
    <main className="min-h-full bg-background px-6 py-8 lg:px-10 lg:py-16 will-change-transform">
      {!successOpen &&
        (step === 1 ? (
          <div className="mx-auto flex w-full max-w-[800px] gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start xl:gap-16">
            <div className="w-full lg:pt-2">
              <VerifyIdentityCard
                steps={STEPS}
                currentStep={1}
                saId={saId}
                pin={pin}
                onSaIdChange={setSaId}
                onPinChange={setPin}
                onSubmit={handleVerification}
                onRequestNewPin={() => {}}
                isSubmitting={isVerifying}
              />
            </div>
          </div>
        ) : (
          <div className=" mx-auto w-full max-w-[1100px] rounded-[32px] bg-white px-12 py-10 shadow-sm border border-neutral-200">
            <div className="space-y-10">
              <ProgressStepper steps={STEPS} currentStep={2} />
              <ActivateCredentialsForm
                identityDocumentAvailable
                driversLicenseAvailable
                selection={selected}
                onSelectionChange={setSelected}
                onBack={() => setStep(1)}
                onSubmit={handleActivateSubmit}
                isSubmitting={isActivating}
              />
            </div>
          </div>
        ))}
      <VerificationSuccessModal
        open={successOpen}
        variant="id-document"
        fullName="Verified citizen"
        credentialValue={saId}
        onContinueAction={() => {
          setSuccessOpen(false)
          setStep(2)
        }}
        onDismissAction={() => router.push('/citizen')}
      />
    </main>
  )
}
