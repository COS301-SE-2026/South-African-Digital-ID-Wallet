'use client'
import { useState } from 'react'
import { Clock, Lock, Shield, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import { Modal } from '@/components/atoms/modal'
import type { ConsentToVerifyProps } from './types'

function InfoRow({
  icon: Icon,
  title,
  description,
}: Readonly<{ icon: typeof Shield; title: string; description: string }>) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-deep-green" />
      <div>
        <Text
          as="p"
          variant="sub-sm"
          className="!text-sm font-bold text-deep-green"
        >
          {title}
        </Text>
        <Text as="p" variant="sub-sm" className="!text-sm text-muted-text">
          {description}
        </Text>
      </div>
    </div>
  )
}
export const ConsentToVerify = ({
  isOpen,
  onClose,
  onConsent,
}: Readonly<ConsentToVerifyProps>) => {
  const [hasConsented, setHasConsented] = useState(false)
  const handleContinue = () => {
    if (!hasConsented) return
    onConsent()
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      dataCy="consent-to-verify-modal"
      className="!max-w-md !bg-transparent !p-0"
    >
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="rounded-[24px] bg-white">
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary-green" />
            </div>
            <div className="text-center">
              <Text
                as="h2"
                variant="sub-sm"
                className="text-xl font-bold text-deep-green"
              >
                Before we continue
              </Text>
              <Text
                as="p"
                variant="sub-sm"
                className="mt-2 !text-sm text-muted-text"
              >
                We need your consent to verify your identity using liveness
                detection.
              </Text>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-primary-green/10 p-5">
              <InfoRow
                icon={Shield}
                title="What we do"
                description="We'll compare your live selfie with your official government record."
              />
              <InfoRow
                icon={Lock}
                title="Your privacy"
                description="Your data is encrypted and never shared without your permission."
              />
              <InfoRow
                icon={Clock}
                title="Takes less than 1 minute"
                description="Make sure you're in a well-lit space."
              />
            </div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={(event) => setHasConsented(event.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/20 text-primary-green focus:ring-primary-green"
                data-cy="consent-checkbox"
              />
              <Text
                as="span"
                variant="sub-sm"
                className="!text-sm text-text-primary"
              >
                I consent to verify my identity using liveness detection and
                confirm that the information provided is mine.
              </Text>
            </label>
            <Button
              variant="primary"
              className="!flex !h-12 !w-full !max-w-none !items-center !justify-center !bg-deep-green"
              disabled={!hasConsented}
              onClick={handleContinue}
              dataCy="consent-continue"
            >
              I Consent, Continue
            </Button>
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-text" />
              <Text
                as="span"
                variant="sub-sm"
                className="!text-xs text-muted-text"
              >
                Your information is protected by FlashID
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
