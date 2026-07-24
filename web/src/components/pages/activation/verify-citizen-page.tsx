'use client'

import { useRouter } from 'next/navigation'
import { ActivationInfoItem } from '@/components/molecules/activation-info-item'
import { useState } from 'react'
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

const STEPS = ['Verify Identity', 'Activate Credentials', 'Complete']

export default function VerifyCitizen() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [saId, setSaId] = useState('')
  const [pin, setPin] = useState('')

  const [selected, setSelected] = useState<ActivateCredentialsSelection>({
    identityDocument: true,
    driversLicense: true,
  })

  const [successOpen, setSuccessOpen] = useState(false)

  function handleVerification() {
    // this is temporary code that just advance to next flow, needs integration please
  }

  return (
    <main className="min-h-full bg-background px-6 py-8 lg:px-10 lg:py-16 will-change-transform">
      {!successOpen &&
        (step === 1 ? (
          <div className="mx-auto grid w-full max-w-[1500px] gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start xl:gap-16">
            <section className="max-w-[560px] lg:pt-2">
              <h1 className="mt-4 max-w-[560px] text-xl font-semibold tracking-tight text-deep-green sm:text-5xl">
                Activate your digital identity
              </h1>

              <p className="mt-4 max-w-[540px] text-lg leading-8 text-muted-foreground sm:text-xl">
                Enter the details provided during onboarding to link your
                verified citizen record to your FlashID account.
              </p>

              <div className="mt-8 space-y-5">
                <ActivationInfoItem
                  icon={ShieldCheck}
                  title={'Security & Encrypted'}
                  description={
                    'Your data is protected with bank-level security.'
                  }
                />
                <ActivationInfoItem
                  icon={Landmark}
                  title={'Government Verified'}
                  description={
                    'We verify your identity against official Home Affairs records.'
                  }
                />
                <ActivationInfoItem
                  icon={WalletCards}
                  title={'One Wallet. All You.'}
                  description={
                    'Access your verified credentials anytime, anywhere.'
                  }
                />
              </div>
            </section>
            <div className="w-full lg:pt-2">
              <VerifyIdentityCard
                steps={STEPS}
                currentStep={1}
                saId={saId}
                pin={pin}
                onSaIdChange={setSaId}
                onPinChange={setPin}
                onSubmit={() => setSuccessOpen(true)}
                onRequestNewPin={() => {}}
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[1100px] space-y-10">
            <ProgressStepper steps={STEPS} currentStep={2} />
            <ActivateCredentialsForm
              identityDocumentAvailable
              driversLicenseAvailable
              selection={selected}
              onSelectionChange={setSelected}
              onBack={() => setStep(1)}
              onSubmit={() => router.push('/citizen')}
            />
          </div>
        ))}
      <VerificationSuccessModal
        open={successOpen}
        variant="id-document"
        fullName="Unathi L. Tshakalisa"
        credentialValue="990101 5009 087"
        onContinueAction={() => {
          setSuccessOpen(false)
          setStep(2)
        }}
        onDismissAction={() => router.push('/citizen')}
      />
    </main>
  )
}
