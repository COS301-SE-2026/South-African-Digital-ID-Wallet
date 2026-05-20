import { FC } from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { ButtonPropsType, ButtonVariant } from './types'

const BASE_STYLE =
  'focus:outline-none transition-colors duration-150 ease-in-out rounded-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2 h-[45px] px-4 group'

const BUTTON_VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary:
    'bg-deep-green hover:bg-primary-green text-clean-white disabled:bg-neutral-mid-grey focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2 lg:w-[160px] w-full',
  secondary:
    'border border-deep-green text-deep-green hover:bg-deep-green hover:text-clean-white disabled:border-neutral-mid-grey disabled:text-neutral-mid-grey disabled:hover:bg-transparent focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2 lg:w-[160px] w-full',
  text: 'text-deep-green hover:text-primary-green disabled:text-neutral-mid-grey focus-visible:text-primary-green',
  custom: '',
}

const BUTTON_TEXT_VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'text-clean-white',
  secondary: 'text-deep-green group-hover:text-clean-white',
  text: 'text-deep-green group-hover:text-primary-green',
  custom: '',
}

const BUTTON_ICON_VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'text-clean-white',
  secondary: 'text-deep-green group-hover:text-clean-white',
  text: 'text-deep-green group-hover:text-primary-green',
  custom: '',
}

export const Button: FC<ButtonPropsType> = ({
  children,
  variant = 'primary',
  className,
  RightIcon,
  LeftIcon,
  dataCy,
  iconClassName,
  isLoading = false,
  disabled,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    data-cy={dataCy}
    disabled={disabled || isLoading}
    className={cn(BASE_STYLE, BUTTON_VARIANT_CLASSNAMES[variant], className)}
    {...rest}
  >
    {isLoading ? (
      <Loader2
        className={cn(
          'h-5 w-5 animate-spin',
          BUTTON_ICON_VARIANT_CLASSNAMES[variant]
        )}
        aria-label="Loading"
      />
    ) : (
      <>
        {LeftIcon && (
          <LeftIcon
            className={cn(
              'h-5 w-5',
              BUTTON_ICON_VARIANT_CLASSNAMES[variant],
              iconClassName
            )}
          />
        )}
        <span
          className={cn(
            'text-center text-base font-medium',
            BUTTON_TEXT_VARIANT_CLASSNAMES[variant]
          )}
        >
          {children}
        </span>
        {RightIcon && (
          <RightIcon
            className={cn(
              'h-5 w-5',
              BUTTON_ICON_VARIANT_CLASSNAMES[variant],
              iconClassName
            )}
          />
        )}
      </>
    )}
  </button>
)
