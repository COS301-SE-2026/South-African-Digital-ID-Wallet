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
    <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="rounded-[24px] bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-deep-green">
            Credential list
          </h2>
        </div>

        {isLoading && (
          <Text variant="sub-md" className="mt-4 text-muted-text">
            Loading credentials.
          </Text>
        )}

        {isError && (
          <Text variant="sub-md" className="mt-4 text-national-red">
            Failed to load the credentials.
          </Text>
        )}

        {data && credentials.length === 0 && (
          <Text variant="sub-md" className="mt-4 text-muted-text">
            No credentials.
          </Text>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4">
          {credentials.map((credential, index) => {
            const Icon = credential.icon

            const accent =
              index % 4 === 0
                ? 'text-deep-green'
                : index % 4 === 1
                  ? 'text-deep-green'
                  : index % 4 === 2
                    ? 'text-primary-green'
                    : 'text-national-red'

            return (
              <div
                key={credential.id}
                className="relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl border border-border-grey bg-clean-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-deep-green/50 hover:shadow-md"
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${
                    index % 4 === 0
                      ? 'bg-deep-green'
                      : index % 4 === 1
                        ? 'bg-deep-green'
                        : index % 4 === 2
                          ? 'bg-primary-green'
                          : 'bg-national-red'
                  }`}
                />

                <div className="flex items-start justify-between">
                  <Icon className={`h-7 w-7 ${accent}`} />
                  <button
                    type="button"
                    className="text-xs font-bold text-deep-green transition-colors hover:text-primary-green"
                    onClick={() => viewOnClick(credential.id)}
                  >
                    View credential
                  </button>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-bold leading-snug text-text-primary">
                    {credential.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-text">
                    {credential.issuer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
