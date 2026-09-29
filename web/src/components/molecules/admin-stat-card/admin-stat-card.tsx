import { Text } from '@/components/atoms/text'
import type { AdminStatCardProps } from './types'

export const AdminStatCard = ({ items }: AdminStatCardProps) => {
  return (
    <div className="relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="flex flex-col divide-y divide-black/10 rounded-[24px] bg-card p-2">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
                <Icon className="h-5 w-5" />
              </div>
              <Text
                as="p"
                variant="sub-sm"
                className="!text-sm font-medium text-muted-text"
              >
                {label}
              </Text>
            </div>
            <Text
              as="p"
              variant="h3"
              className="!text-2xl font-extrabold text-text-primary"
            >
              {value.toLocaleString('en-ZA')}
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}
