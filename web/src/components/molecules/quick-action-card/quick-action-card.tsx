'use client'
import { FC } from 'react'
import Link from 'next/link'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import { useRouter } from 'next/navigation'
import type { QuickActionsCardProps } from './types'

export const QuickActionsCard: FC<QuickActionsCardProps> = ({
  icon,
  title,
  description,
  href,
  dataCy,
  variant = 'default',
}) => {
  const router = useRouter()
  if (variant === 'gradient') {
    return (
      <Link
        href={href}
        data-cy={dataCy}
        className="flex items-center gap-3 rounded-2xl border-2 border-black bg-card p-3 min-w-0"
      >
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
      </Link>
    )
  }
  return (
    <div className="flashid-gradient-border group w-full transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg">
      <div className="flashid-gradient-border-inner">
        <Button
          variant="custom"
          dataCy={dataCy}
          onClick={() => router.push(href)}
          className="h-auto w-full items-center justify-between gap-3 rounded-xl p-3 text-left bg-white 
                    transition-colors duration-200 group-hover"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="rounded-2xl bg-primary-green/10 p-3 text-primary-green 
                          transition-all duration-200 group-hover:bg-primary-green group-hover:text-white"
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <Text
                as="span"
                variant="caption"
                className="block text-xs font-semibold leading-4 tracking-normal text-text-primary 
                          transition-colors group-hover:text-primary-green"
              >
                {title}
              </Text>
              <Text
                as="span"
                variant="caption"
                className="mt-1 block text-[11px] tracking-normal text-muted-text
                          transition-colors group-hover:text-primary-green"
              >
                {description}
              </Text>
            </div>
          </div>
        </Button>
      </div>
    </div>
  )
}
