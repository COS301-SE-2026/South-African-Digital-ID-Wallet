'use client'
import { FC } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import type { QuickActionsCardProps } from './types'

export const QuickActionsCard: FC<QuickActionsCardProps> = ({
  icon,
  title,
  description,
  href,
  dataCy,
}) => {
  const router = useRouter()

  return (
    <Button
      variant="custom"
      dataCy={dataCy}
      onClick={() => router.push(href)}
      className="h-auto w-full items-center justify-between gap-3 rounded-2xl border border-black p-3 text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="rounded-2xl bg-primary-green/10 p-3 text-primary-green">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <Text
            as="span"
            variant="caption"
            className="block text-xs font-semibold leading-4 tracking-normal text-text-primary"
          >
            {title}
          </Text>
          <Text
            as="span"
            variant="caption"
            className="mt-1 block text-[11px] tracking-normal text-muted-text"
          >
            {description}
          </Text>
        </div>
      </div>
    </Button>
  )
}
