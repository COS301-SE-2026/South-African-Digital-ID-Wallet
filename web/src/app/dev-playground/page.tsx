import { ActivationInfoItem } from '@/components/molecules/activation-info-item/activation-info-item'
import { BadgeCheck } from 'lucide-react'
export default function Page() {
  return (
    <ActivationInfoItem
      key={'Security'}
      icon={BadgeCheck}
      title={'title'}
      description={'description'}
    />
  )
}
