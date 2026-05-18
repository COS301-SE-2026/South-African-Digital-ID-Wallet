'use client'

import { forwardRef, useId } from 'react'

import { cn } from '@/lib/utils'
import { Text } from '@/components/atoms'

import { TextFieldProps } from './types'

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, helperText, error, id, className, ...props }, ref) => {
    const reactId = useId()
    const inputId = id ?? reactId

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Text as="label" variant="label" htmlFor={inputId}>
            {label}
          </Text>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />

        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
TextField.displayName = 'TextField'
