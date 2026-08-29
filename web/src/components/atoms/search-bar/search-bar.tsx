'use client'
import { Search } from 'lucide-react'
import type { SearchBarProps } from './types'

export const SearchBar = ({
  value,
  placeholder = 'Search...',
  onChange,
  className = '',
  disabled = false,
}: Readonly<SearchBarProps>) => {
  return (
    <div
      className={`flex h-12 w-full items-center gap-3 rounded-lg border border-border bg-white px-4 transition focus-within:border-deep-green focus-within:ring-2 focus-within:ring-deep-green/10 ${className}`}
    >
      <Search className="h-5 w-5 shrink-0 text-muted-text" />

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-muted-text disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}
