'use client'

import { Search } from 'lucide-react'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Controller, FieldValues, useFormContext } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { Text } from '@/components/atoms'
import {
  FormDropdownProps,
  DropdownOption,
  DropdownProps,
  InnerProps,
} from './types'

const normalizeOptions = (
  options: string[] | DropdownOption[]
): DropdownOption[] =>
  options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option
  )

const DropdownInner = ({
  label,
  required,
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  className = '',
  hasError = false,
  errorMessage,
  disabled = false,
  name,
}: InnerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((option) => option.value === value)
  const displayValue = isOpen ? searchTerm : (selectedOption?.label ?? '')

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleInputFocus = () => {
    if (disabled) return
    setIsOpen(true)
    setSearchTerm('')
  }

  const handleOptionSelect = (option: DropdownOption) => {
    onChange(option.value)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div
      ref={containerRef}
      className={twMerge('flex flex-col gap-1', className)}
    >
      {label && (
        <Text as="label" variant="label">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Text>
      )}

      <div className="relative">
        <div
          className={twMerge(
            'flex items-center gap-2 rounded-md border bg-white px-3 py-2',
            'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1',
            hasError ? 'border-red-500' : 'border-gray-300',
            disabled && 'cursor-not-allowed bg-gray-100 opacity-60'
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            name={name}
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={onBlur}
            autoComplete="off"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
          />
        </div>

        {isOpen && !disabled && (
          <ul
            role="listbox"
            className={twMerge(
              'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200',
              'bg-white shadow-lg'
            )}
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">
                No results found
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      handleOptionSelect(option)
                    }}
                    className={twMerge(
                      'cursor-pointer px-3 py-2 text-sm hover:bg-gray-100',
                      isSelected && 'bg-blue-50 font-medium text-blue-700'
                    )}
                  >
                    {option.label}
                  </li>
                )
              })
            )}
          </ul>
        )}
      </div>

      {hasError && errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  )
}

export const Dropdown = <T extends FieldValues = FieldValues>(
  props: DropdownProps<T>
) => {
  const normalizedOptions = normalizeOptions(props.options)

  if (props.useFormContext) {
    return <FormDropdown<T> {...props} options={normalizedOptions} />
  }

  return (
    <DropdownInner
      label={props.label}
      required={props.required}
      placeholder={props.placeholder}
      options={normalizedOptions}
      value={props.value ?? ''}
      onChange={props.onChange ?? (() => {})}
      className={props.className}
      hasError={props.hasError}
      disabled={props.disabled}
      name={props.name}
    />
  )
}

const FormDropdown = <T extends FieldValues>({
  name,
  label,
  required,
  placeholder,
  options,
  className,
  disabled,
}: FormDropdownProps<T>) => {
  const { control } = useFormContext<T>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <DropdownInner
          name={field.name}
          label={label}
          required={required}
          placeholder={placeholder}
          options={options}
          value={(field.value as string) ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          className={className}
          disabled={disabled}
          hasError={Boolean(fieldState.error)}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  )
}
