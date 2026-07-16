import { ActivationInfoItem } from '@/components/molecules/activation-info-item/activation-info-item'
import { ShieldCheck } from 'lucide-react'
export default function Page() {
  return (
    <div className=" m-10 justify-center ">
      <ActivationInfoItem
        key={'Security'}
        icon={ShieldCheck}
        title={'Secure & Encrypted'}
        description={'Your data is protected with bank-level security'}
      />
    </div>
  )
}
