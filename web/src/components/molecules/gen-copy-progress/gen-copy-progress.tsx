import { Check, Circle, Info, LoaderCircle } from 'lucide-react'
import { Text } from '@/components/atoms'
import type { GenCopyProgressProps } from './types'

const STEPS = [
  {
    title: 'Validating credential',
    description: 'Checking ownership and status...',
  },
  {
    title: 'Creating certified document',
    description: 'Generating PDF and QR code...',
  },
  {
    title: 'Finalizing certified copy',
    description: 'Almost ready...',
  },
  {
    title: 'Complete',
    description: 'Your certified copy is ready.',
  },
]

export function GenCopyProgress({
  currentStep,
}: Readonly<GenCopyProgressProps>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gen-copy-progress-title"
    >
      <div className="max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border-grey bg-clean-white p-4 shadow-xl sm:p-5">
        <div className="mb-5">
          <Text
            as="h2"
            variant="h4"
            className="text-text-primary"
            id="gen-copy-progress-title"
          >
            Generate Certified Copy
          </Text>
          <Text variant="caption" className="mt-1">
            Preparing your verified document.
          </Text>
        </div>
        <ol
          className="space-y-4 sm:space-y-5"
          aria-label="Certified copy generation progress"
        >
          {STEPS.map((step, index) => {
            const stepNumber = index + 1
            const isComplete = stepNumber < currentStep
            const isActive = stepNumber === currentStep
            const isPending = stepNumber > currentStep

            return (
              <li key={step.title} className="relative flex gap-3">
                {index < STEPS.length - 1 && (
                  <span
                    className={`absolute left-3.5 top-7 h-[calc(100%+1rem)] w-px ${
                      isComplete ? 'bg-primary-green' : 'bg-border-grey'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                    isComplete || isActive
                      ? 'bg-primary-green text-clean-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : isActive ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Circle className="h-3 w-3" fill="currentColor" />
                  )}
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <Text
                    variant="sub-sm"
                    className={`font-semibold ${
                      isPending ? 'text-muted-text' : 'text-deep-green'
                    }`}
                  >
                    {step.title}
                  </Text>
                  <Text variant="caption" className="mt-0.5 break-words">
                    {step.description}
                  </Text>
                </span>
              </li>
            )
          })}
        </ol>
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-national-blue/5 px-3 py-2.5 text-national-blue">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <Text variant="caption" className="text-national-blue">
            This usually takes a few seconds. Please do not close this window.
          </Text>
        </div>
      </div>
    </div>
  )
}