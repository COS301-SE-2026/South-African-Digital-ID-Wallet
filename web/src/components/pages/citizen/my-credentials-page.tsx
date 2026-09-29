'use client'

import { useMemo, useState, FC } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import {
  credentialService,
  toCredentialView,
} from '@/services/credential-service'
import { CredentialDetailCard } from '@/components/molecules'
import { Text } from '@/components/atoms'

export const MyCredentialsPage: FC = () => {
  const searchParams = useSearchParams()
  const preselected = searchParams.get('selected')

  const [selectedId, setSelectedId] = useState<string | null>(preselected)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['credentials', 'me'],
    queryFn: () => credentialService.getMine(),
  })

  const views = useMemo(() => (data ?? []).map(toCredentialView), [data])
  const selected = views.find((v) => v.id === selectedId) ?? views[0]

  return (
    <main className="min-h-screen bg-cream-background px-4 py-4 text-deep-green sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6">
        {isLoading && <Text variant="sub-md">Loading credentials.</Text>}

        {isError && (
          <Text variant="sub-md" className="text-red">
            Failed to load the credentials.
          </Text>
        )}

        {data && views.length === 0 && (
          <Text variant="sub-md">No credentials.</Text>
        )}

        {views.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {views.map((view) => {
                const Icon = view.icon
                const isActive = view.id === selected?.id

                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setSelectedId(view.id)}
                    className={`bg-card flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${isActive ? 'border-deep-green shadow-sm' : 'hover:border-deep-green'}`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-green/10">
                      <Icon className="h-6 w-6 text-primary-green" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Text
                        as="p"
                        variant="sub-sm"
                        className="truncate font-semibold text-deep-green"
                      >
                        {view.title}
                      </Text>
                      <Text as="p" variant="sub-sm" className="truncate">
                        {view.issuer}
                      </Text>
                    </div>
                  </button>
                )
              })}
            </div>

            {selected && (
              <CredentialDetailCard key={selected.id} credential={selected} />
            )}
          </div>
        )}
      </div>
    </main>
  )
}
