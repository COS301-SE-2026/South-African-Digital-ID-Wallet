import {
  Check,
  Circle,
  LoaderCircle,
} from 'lucide-react'
import { Text } from '@/components/atoms'
import type { CertifiedCopyVerificationProgressProps } from './types'

const VERIFICATION_STEPS = [
  {
    title: 'Uploading document',
    description: 'File received successfully',
  },
  {
    title: 'Extracting verification reference',
    description: 'Reading QR code and document data...',
  },
  {
    title: 'Verifying certification record',
    description: 'Checking with FlashID...',
  },
  {
    title: 'Checking document integrity',
    description: 'Comparing against the original document...',
  },
  {
    title: 'Retrieving credential details',
    description: 'Loading verified credential information...',
  },
]

export function CertifiedCopyVerificationProgress({
  currentStep,
}: Readonly<CertifiedCopyVerificationProgressProps>) {
  return (
    <div className="w-full max-w-xl">
      <div className="mb-6">
        <Text
          as="h2"
          variant="h3"
          className="text-text-primary"
        >
          Verifying Document
        </Text>
        <Text variant="sub-sm" className="mt-1">
          Please wait while the certified copy is checked.
        </Text>
      </div>
      <div className="rounded-2xl border border-border-grey bg-clean-white p-5 sm:p-6">
        <ol aria-label="Document verification progress" className="space-y-5">
          {VERIFICATION_STEPS.map((step, index) => {
            const stepNumber = index + 1
            const isComplete = stepNumber < currentStep
            const isActive = stepNumber === currentStep
            const isPending = stepNumber > currentStep
            return (
              <li
                key={step.title}
                className="relative flex gap-3"
              >
                {index < VERIFICATION_STEPS.length - 1 && (
                  <span
                    className={`absolute left-4 top-8 h-[calc(100%+1.25rem)] w-px ${
                      isComplete
                        ? 'bg-primary-green'
                        : 'bg-border-grey'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isComplete || isActive
                      ? 'bg-primary-green text-clean-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? (
                    <Check
                      className="h-4 w-4"
                      strokeWidth={3}
                    />
                  ) : isActive ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Circle
                      className="h-3 w-3"
                      fill="currentColor"
                    />
                  )}
                </span>
                <div className="min-w-0 pt-0.5">
                  <Text
                    variant="sub-sm"
                    className={`font-semibold ${
                      isPending
                        ? 'text-muted-text'
                        : 'text-deep-green'
                    }`}
                  >
                    {step.title}
                  </Text>
                  <Text variant="caption" className="mt-0.5">
                    {step.description}
                  </Text>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="mt-5 rounded-xl bg-national-blue/5 px-4 py-3">
        <Text
          variant="caption"
          className="text-national-blue"
        >
          This usually takes a few seconds. Please do not close
          this window.
        </Text>
      </div>
    </div>
  )
}