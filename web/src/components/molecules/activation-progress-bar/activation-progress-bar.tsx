import { ActivationProgressProps } from './types'
const steps = ['Verify Identity', 'Activate Credentials', 'Complete']
export function ActivationProgress({ currentStep }: ActivationProgressProps) {
  return (
    <ol className="grid grid-cols-3 gap-3" aria-label="Activation progress">
      {steps.map((label, index) => {
        const step = index + 1
        const active = step === currentStep
        const complete = step < currentStep

        return (
          <li key={label} className="relative text-center">
            {index < steps.length - 1 && (
              <span className="absolute left-1/2 top-4 h-px w-full bg-border" />
            )}

            <div className="relative z-10 mx-auto flex size-8 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
              <span
                className={
                  active || complete
                    ? 'flex size-8 items-center justify-center rounded-full bg-primary-green text-primary-foreground'
                    : ''
                }
              >
                {step}
              </span>
            </div>

            <span
              className={
                active
                  ? 'mt-2 bock text-xs font-semibold text-primary'
                  : 'mt-2 block text-xs text-muted-foreground'
              }
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
