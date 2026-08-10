import { FC } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

import { ProgressStepperProps } from './types'

export const ProgressStepper: FC<ProgressStepperProps> = ({
  steps,
  currentStep,
}) => {
  const clamped = Math.min(Math.max(currentStep, 1), steps.length)
  const progress = steps.length > 1 ? (clamped - 1) / (steps.length - 1) : 0

  return (
    <div className="relative">
      <div
        className="absolute top-4 h-0.5 -translate-y-1/2 rounded-full bg-border"
        style={{
          left: `${50 / steps.length}%`,
          right: `${50 / steps.length}%`,
        }}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-primary-green transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <ol className="relative flex w-full items-start" aria-label="Progress">
        {steps.map((label, index) => {
          const step = index + 1
          const isComplete = step < currentStep
          const isActive = step === currentStep

          return (
            <li
              key={label}
              className="flex flex-1 flex-col items-center"
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={cn(
                  'z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-500 motion-reduce:transition-none',
                  isComplete || isActive
                    ? 'bg-primary-green text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? <Check className="size-4" /> : step}
              </div>
              <span
                className={cn(
                  'mt-2 block px-1 text-center text-xs transition-colors duration-500 motion-reduce:transition-none',
                  isActive
                    ? 'font-semibold text-primary'
                    : isComplete
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
