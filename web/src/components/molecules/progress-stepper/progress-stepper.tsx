import { FC } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

import { ConnectorProps, ProgressStepperProps } from './types'

const Connector: FC<ConnectorProps> = ({ visible, filled }) => (
  <div
    className={cn(
      'h-0.5 flex-1 overflow-hidden rounded-full bg-border',
      !visible && 'invisible'
    )}
    aria-hidden="true"
  >
    <div
      className={cn(
        'h-full rounded-full bg-primary-green transition-[width] duration-500 ease-out motion-reduce:transition-none',
        filled ? 'w-full' : 'w-0'
      )}
    />
  </div>
)

export const ProgressStepper: FC<ProgressStepperProps> = ({
  steps,
  currentStep,
}) => (
  <ol className="flex w-full items-start" aria-label="Progress">
    {steps.map((label, index) => {
      const step = index + 1
      const isComplete = step < currentStep
      const isActive = step === currentStep
      const isFirst = index === 0
      const isLast = index === steps.length - 1

      const leftFilled = currentStep >= step
      const rightFilled = currentStep > step

      return (
        <li
          key={label}
          className="flex flex-1 flex-col items-center"
          aria-current={isActive ? 'step' : undefined}
        >
          <div className="flex w-full items-center">
            <Connector visible={!isFirst} filled={leftFilled} />
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
            <Connector visible={!isLast} filled={rightFilled} />
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
)
