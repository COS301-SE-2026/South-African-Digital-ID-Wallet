'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { Text } from '@/components/atoms'
import {
  credentialService,
  toCredentialView,
} from '@/services/credential-service'

export function CredentialsList() {
  const router = useRouter()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['credentials', 'me'],
    queryFn: () => credentialService.getMine(),
  })

  const credentials = useMemo(() => (data ?? []).map(toCredentialView), [data])

  const viewOnClick = (credentialId: string) => {
    router.push(`/citizen/my-credentials?selected=${credentialId}`)
  }

  return (
    <div className="rounded-3xl border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold sm:text-lg">Credential list</h2>
      </div>

      {isLoading && <Text variant="sub-md">Loading credentials.</Text>}

      {isError && (
        <Text variant="sub-md" className="text-red">
          Failed to load the credentials.
        </Text>
      )}

      {data && credentials.length === 0 && (
        <Text variant="sub-md">No credentials.</Text>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {credentials.map((credential) => {
          const Icon = credential.icon

          return (
            <div
              key={credential.id}
              className="bg-card flex min-h-[9rem] flex-col justify-between rounded-2xl border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <Icon className="mb-3 h-8 w-8 shrink-0" />

                <button
                  type="button"
                  className="text-xs font-semibold text-green-700 hover:text-green-800"
                  onClick={() => viewOnClick(credential.id)}
                >
                  View credential
                </button>
              </div>

              <div className="mt-3 min-w-0">
                <div className="text-sm font-semibold leading-snug">
                  {credential.title}
                </div>

                <div className="text-muted-text mt-1 text-xs">
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
