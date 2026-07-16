'use client'

import * as React from 'react'
import { IdCard, Car } from 'lucide-react'
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
]

export function CredentialsList() {
  return (
    <div className="bg-card rounded-3xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Credential list</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {credentials.map((credential) => {
          const Icon = credential.icon

          return (
            <div
              key={credential.id}
              className="bg-card rounded-2xl border p-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <Icon className="h-8 w-8 mb-3" />

                <button
                  type="button"
                  className="text-xs font-semibold text-green-700 hover:text-green-800"
                >
                  View credential
                </button>
              </div>

              <div className="mt-3">
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
  )
}
