import { Circle } from 'lucide-react'
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
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-7">
        <Text as="h2" variant="h4" className="text-text-primary">
          Generate Certified Copy
        </Text>
        <Text variant="caption" className="mt-1">
          Preparing your verified document.
        </Text>
      </div>
      <div className="rounded-2xl border border-border-grey bg-clean-white p-5 sm:p-6">
        <ol
          className="space-y-5"
          aria-label="Certified copy generation progress"
        >
          {STEPS.map((step, index) => {
            const stepNumber = index + 1
            const isComplete = stepNumber < currentStep
            const isActive = stepNumber === currentStep
            return (
              <li
                key={step.title}
                aria-current={isActive ? 'step' : undefined}
                className="flex gap-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    isComplete || isActive
                      ? 'bg-primary-green text-clean-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? (
                    <Circle className="h-3 w-3" fill="currentColor" />
                  ) : (
                    stepNumber
                  )}
                </span>
                <span className="min-w-0 pt-0.5">
                  <Text
                    variant="sub-sm"
                    className={`font-semibold ${
                      isComplete || isActive
                        ? 'text-deep-green'
                        : 'text-muted-text'
                    }`}
                  >
                    {step.title}
                  </Text>
                  <Text variant="caption" className="mt-0.5">
                    {step.description}
                  </Text>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}