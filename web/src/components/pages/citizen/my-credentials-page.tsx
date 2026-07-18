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
    <main className="h-full bg-cream-background text-deep-green p-6">
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
        <div className="space-y-1">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {views.map((view) => {
              const Icon = view.icon
              const isActive = view.id === selected?.id

              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setSelectedId(view.id)}
                  className={`bg-card flex w-auto shrink-0 snap-start items-center gap-3 rounded-2xl border p-4 text-left transition ${isActive ? 'border-deep-green' : 'hover:border-deep-green'}`}
                >
                  <Icon className="h-6 w-6" />
                  <div>
                    <Text
                      as="p"
                      variant="sub-sm"
                      className="text-deep-green font-semibold"
                    >
                      {view.title}
                    </Text>
                    <Text as="p" variant="sub-sm">
                      {view.issuer}
                    </Text>
                  </div>
                </button>
              )
            })}
          </div>

          {selected && <CredentialDetailCard credential={selected} />}
        </div>
      )}
    </main>
  )
}
