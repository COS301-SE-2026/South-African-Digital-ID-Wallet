'use client'
import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import type { RowActionsMenuProps } from './types'

export const RowActionsMenu = ({ actions }: RowActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="custom"
        LeftIcon={MoreVertical}
        aria-label="Row actions"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-9 w-9 p-0 text-deep-green hover:bg-deep-green/10"
      />
      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-brand-forest/10 bg-white shadow-lg">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick()
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-left hover:bg-brand-cream ${
                action.variant === 'danger'
                  ? 'text-red-600'
                  : 'text-brand-forest'
              }`}
            >
              <Text as="span" variant="sub-sm">
                {action.label}
              </Text>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
