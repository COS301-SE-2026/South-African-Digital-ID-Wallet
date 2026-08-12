'use client'

import type { FC } from 'react'
import { UserRoundPlus } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button, Text } from '@/components/atoms'
import { cn } from '@/lib/utils'

import type { OnboardSuccessPanelProps } from './types'

export const OnboardSuccessPanel: FC<OnboardSuccessPanelProps> = ({
  className,
  response,
}) => {
  const handleCopyActivationPin = () => {
    void navigator.clipboard.writeText(response.activationPin)
    toast.success('Activation PIN copied')
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-success-green/70 bg-success-green/10 p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-15 w-15 items-center justify-center rounded-full bg-success-green/20">
          <UserRoundPlus className="h-10 w-10 text-success-green" />
        </div>
        <div>
          <Text className="text-success-green" variant="h4">
            Citizen onboarded successfully
          </Text>
          <Text className="text-success-green/90" variant="sub-sm">
            The pending FlashID account has been created.
          </Text>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Text className="uppercase" variant="caption">
            SA ID
          </Text>
          <Text className="mt-1 font-medium" variant="sub-sm">
            {response.saId}
          </Text>
        </div>
        <div>
          <Text className="uppercase" variant="caption">
            Status
          </Text>
          <Text className="mt-1 font-medium" variant="sub-sm">
            {response.status}
          </Text>
        </div>
        <div>
          <Text className="uppercase" variant="caption">
            Activation PIN
          </Text>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded-md bg-clean-white px-3 py-2 text-lg font-semibold tracking-widest text-muted-text">
              {response.activationPin}
            </code>
            <Button
              className="h-auto rounded-md border border-success-green/50 bg-clean-white px-3 py-2 font-medium text-success-green/80 hover:bg-success-green/10"
              onClick={handleCopyActivationPin}
              variant="custom"
            >
              Copy
            </Button>
          </div>
        </div>
        <div>
          <Text className="uppercase" variant="caption">
            Expires
          </Text>
          <Text className="mt-1 font-medium" variant="sub-sm">
            {new Date(response.activationExpiresAt).toLocaleString()}
          </Text>
        </div>
      </div>
      <Text className="mt-5 text-success-green/80" variant="sub-sm">
        Keep the activation PIN secure. It should only be provided to the
        citizen through the approved delivery channel.
      </Text>
    </div>
  )
}
