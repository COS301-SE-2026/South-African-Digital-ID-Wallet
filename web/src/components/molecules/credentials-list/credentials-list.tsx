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
    <div className="bg-card rounded-3xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Credential list</h2>
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

      <div className="mt-4 grid grid-cols-2 gap-4">
        {credentials.map((credential) => {
          const Icon = credential.icon

          return (
            <div
              key={credential.id}
              className="bg-card rounded-2xl border p-4 h-30 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <Icon className="h-8 w-8 mb-3" />

                <button
                  type="button"
                  className="text-xs font-semibold text-green-700 hover:text-green-800"
                  onClick={() => viewOnClick(credential.id)}
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
