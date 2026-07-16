'use client'
import { useState } from 'react'
import { ActivationInfoItem } from '@/components/molecules/activation-info-item/activation-info-item'
import { ActivationProgress } from '@/components/molecules/activation-progress-bar'
import { VerifyIdentityCard } from '@/components/organisms/verify-identity-card'
import { ShieldCheck } from 'lucide-react'

export default function Page() {
  const [saId, setSaId] = useState('')
  const [pin, setPin] = useState('')
  return (
    <div className="p-2">
      <div className="flex items-center m-10 justify-center ">
        <ActivationInfoItem
          key={'Security'}
          icon={ShieldCheck}
          title={'Secure & Encrypted'}
          description={'Your data is protected with bank-level security'}
        />
      </div>

      <div className="bg-white rounded-md m-10">
        <ActivationProgress currentStep={1} />
      </div>

      <div className="m-10">
        <VerifyIdentityCard
          saId={saId}
          pin={pin}
          onSaIdChange={setSaId}
          onPinChange={setPin}
          onSubmit={() => console.log('Verify')}
          onRequestNewPin={() => console.log('Resend PIN')}
        />
      </div>
    </div>
  )
}
