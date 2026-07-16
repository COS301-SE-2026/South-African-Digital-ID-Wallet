import { ActivationInfoItem } from '@/components/molecules/activation-info-item/activation-info-item'
import { ActivationProgress } from '@/components/molecules/activation-progress-bar'
import { ShieldCheck } from 'lucide-react'
export default function Page() {
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
      <div className="bg-white rounded-md">
        <ActivationProgress currentStep={1} />
      </div>
    </div>
  )
}
