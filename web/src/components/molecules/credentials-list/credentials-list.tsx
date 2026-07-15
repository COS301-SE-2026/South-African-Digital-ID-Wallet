'use client'

import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  IdCard,
  Car,
  Truck,
  BookUser,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Credential } from '@/components/molecules/credentials-list/types'

const credentials: Credential[] = [
  {
    id: 'national-id',
    title: 'National ID Card',
    issuer: 'Department of Home Affairs',
    status: 'Verified',
    icon: IdCard,
    tone: 'blue',
  },
  {
    id: 'drivers-licence',
    title: "Driver's Licence",
    issuer: 'Class B',
    status: 'Verified',
    icon: Car,
    tone: 'red',
  },
  {
    id: 'vehicle-reg',
    title: 'Vehicle Registration',
    issuer: 'CA 123-456',
    status: 'Verified',
    icon: Truck,
    tone: 'orange',
  },
  {
    id: 'passport',
    title: 'Passport',
    issuer: 'South African',
    status: 'Verified',
    icon: BookUser,
    tone: 'purple',
  },
  {
    id: 'passport-2',
    title: 'Passport',
    issuer: 'South African',
    status: 'Verified',
    icon: BookUser,
    tone: 'purple',
  },
]

const ITEMS_VISIBLE = 3

export function CredentialsList() {
  const [page, setPage] = React.useState(0)

  const maxPage = credentials.length - ITEMS_VISIBLE

  return (
    <div className="bg-card rounded-3xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Credential list</h2>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="Previous credentials"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(calc(-${page} * (100% / 3)))`,
            }}
          >
            {credentials.map((credential) => {
              const Icon = credential.icon

              return (
                <div
                  key={credential.id}
                  className="min-w-[calc((100%-2rem)/3)] flex-shrink-0 bg-card rounded-2xl border p-4 flex flex-col justify-between"
                >
                  <div className="mt-3">
                    <Icon className="h-8 w-8 mb-3" />

                    <div className="font-semibold text-sm leading-snug">
                      {credential.title}
                    </div>

                    <div className="text-muted-text text-xs mt-1">
                      {credential.issuer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label="Next credentials"
          disabled={page === maxPage}
          onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
          className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4">
        {Array.from({ length: maxPage + 1 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === page ? 'w-4 bg-green-700' : 'w-1.5 bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  )
}
