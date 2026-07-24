'use client'

import { FC, useEffect } from 'react'
import { Check, ChevronRight, User, IdCard, Car } from 'lucide-react'

import { Button, Text } from '@/components/atoms'

import {
  VerificationSuccessModalProps,
  CredentialVariant,
  CredentialConfig,
} from './types'

const CREDENTIAL_CONFIG: Record<CredentialVariant, CredentialConfig> = {
  'id-document': { icon: IdCard, label: 'South African ID' },
  'drivers-licence': { icon: Car, label: "Driver's Licence" },
}

export const VerificationSuccessModal: FC<VerificationSuccessModalProps> = ({
  open,
  variant,
  fullName,
  credentialValue,
  onContinueAction,
  onDismissAction,
}) => {
  const { icon: CredentialIcon, label: credentialLabel } =
    CREDENTIAL_CONFIG[variant]

  useEffect(() => {
    if (!open) {
      return
    }
    let cancelled = false
    import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) {
        return
      }
      confetti({
        particleCount: 140,
        spread: 75,
        startVelocity: 45,
        origin: { y: 0.35 },
        colors: ['#007a4d', '#ffb81c', '#002395', '#16a34a'],
      })
    })
    return () => {
      cancelled = true
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 animate-in fade-in-0 duration-300"
        onClick={onDismissAction}
        aria-hidden
      />
      <div className="relative w-[min(560px,95%)] animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="rounded-3xl bg-card p-8 text-center shadow-2xl shadow-deep-green/10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-green">
            <Check className="h-10 w-10 text-clean-white" strokeWidth={3} />
          </div>
          <Text as="h2" variant="h2" className="text-text-primary">
            Citizen verified successfully!
          </Text>
          <Text variant="sub-sm" className="mx-auto mt-3 max-w-[38ch]">
            Your identity has been verified and your FlashID account is now
            linked to your citizen record.
          </Text>
          <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-secondary p-5 text-left sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 shrink-0 text-primary-green" />
              <div>
                <Text variant="caption">Full Name</Text>
                <Text
                  variant="sub-sm"
                  className="font-semibold text-text-primary"
                >
                  {fullName}
                </Text>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CredentialIcon className="h-5 w-5 shrink-0 text-primary-green" />
              <div>
                <Text variant="caption">{credentialLabel}</Text>
                <Text
                  variant="sub-sm"
                  className="font-semibold text-text-primary"
                >
                  {credentialValue}
                </Text>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="primary"
              className="w-full lg:w-full"
              RightIcon={ChevronRight}
              onClick={onContinueAction}
            >
              Continue to activate credentials
            </Button>

            <Button
              variant="secondary"
              className="w-full lg:w-full"
              onClick={onDismissAction}
            >
              Do this later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
