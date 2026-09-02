import { Mail, ScanFace, ShieldCheck, Lock } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { ProgressStepper } from '@/components/molecules'
import type { VerifyMethodProps } from './types'

export const VerifyMethod = ({
  onSelectMethod,
  steps,
  currentStep,
}: VerifyMethodProps) => {
  return (
    <div className="w-full rounded-[24px] bg-card">
      <div className="flex flex-col items-center px-8 py-10 text-center">
        {steps && currentStep !== undefined && (
          <div className="mb-6 w-full">
            <ProgressStepper steps={steps} currentStep={currentStep} />
          </div>
        )}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <Text
          as="h1"
          variant="h3"
          className="mt-4 !text-2xl font-extrabold text-text-primary"
        >
          Verify your identity
        </Text>
        <Text as="p" variant="sub-sm" className="mt-1 !text-sm text-muted-text">
          Confirm your identity before activating your credentials.
        </Text>
        <div className="mt-6 h-px w-full bg-black/10" />
        <Text
          as="p"
          variant="sub-sm"
          className="mt-6 self-start !text-sm font-medium text-text-primary"
        >
          Choose how you want to verify yourself.
        </Text>
        <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-center rounded-[18px] border border-black/10 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
              <Mail className="h-5 w-5" />
            </div>
            <Text
              as="p"
              variant="sub-sm"
              className="mt-3 !text-base font-bold text-text-primary"
            >
              Activation Code
            </Text>
            <Text
              as="p"
              variant="sub-sm"
              className="mt-1 !text-xs text-muted-text"
            >
              Use the code sent to your email.
            </Text>
            <button
              type="button"
              onClick={() => onSelectMethod('code')}
              className="mt-4 w-full rounded-full bg-deep-green py-2.5 text-sm font-semibold text-clean-white transition-opacity hover:opacity-90"
            >
              Use Code
            </button>
          </div>
          <div className="flex flex-col items-center rounded-[18px] border border-black/10 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-deep-green/10 text-deep-green">
              <ScanFace className="h-5 w-5" />
            </div>
            <Text
              as="p"
              variant="sub-sm"
              className="mt-3 !text-base font-bold text-text-primary"
            >
              Physical ID
            </Text>
            <Text
              as="p"
              variant="sub-sm"
              className="mt-1 !text-xs text-muted-text"
            >
              Scan your SA ID and verify face.
            </Text>
            <button
              type="button"
              onClick={() => onSelectMethod('id')}
              className="mt-4 w-full rounded-full bg-deep-green py-2.5 text-sm font-semibold text-clean-white transition-opacity hover:opacity-90"
            >
              Use ID
            </button>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-1.5 text-muted-text">
          <Lock className="h-3.5 w-3.5" />
          <Text as="span" variant="caption" className="!text-xs">
            Your information is protected by FlashID
          </Text>
        </div>
      </div>
    </div>
  )
}
