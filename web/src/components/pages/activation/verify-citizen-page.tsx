'use client'
import { ActivationInfoItem } from '@/components/molecules/activation-info-item'
import { useState } from 'react'
import { ShieldCheck, Landmark, WalletCards, LockKeyhole } from 'lucide-react'
import { VerifyIdentityCard } from '@/components/organisms/verify-identity-card'
import Image from 'next/image'

const STEPS = ['Verify Identity', 'Activate Credentials', 'Complete']
const CURRENT_STEP = 1

export default function VerifyCitizen() {
  const [saId, setSaId] = useState('')
  const [pin, setPin] = useState('')

  function handleVerification() {
    //TODO: integration
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8 lg:px-10 lg:py-16">
      <div className="mx-auto grid w-full max-w-[1500px] gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start xl:gap-20">
        <section className="max-w-[560px] lg:pt-2">
          <span className="inline-flex rounded-full bg-primary-green/15 px-4 py-1.5 text-sm font-semibold text-deep-green">
            Step 1 of 3
          </span>

          <h1 className="mt-8 max-w-[560px] text-xl font-semibold tracking-tight text-deep-green sm:text-6xl">
            Activate your digital identity
          </h1>

          <p className="mt-8 max-w-[540px] text-lg leading-8 text-muted-foreground sm:text-xl">
            Enter the details provided during onboarding to link your verified
            citizen record to your FlashID account.
          </p>

          <div className="mt-12 space-y-8">
            <ActivationInfoItem
              icon={ShieldCheck}
              title={'Security & Encrypted'}
              description={'Your data is protected with bank-level security.'}
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
            currentStep={CURRENT_STEP}
            saId={saId}
            pin={pin}
            onSaIdChange={setSaId}
            onPinChange={setPin}
            onSubmit={handleVerification}
            onRequestNewPin={() => console.log('TODO: Integration')}
          />
        </div>
      </div>
    </main>
  )
}
