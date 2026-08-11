'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  institutionService,
  GetInstitutionResponse,
} from '@/services/institution-service'
import { Text, Button } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { Card, CardContent } from '@/components/ui/card'

export const ViewInstitutionsPage = () => {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => institutionService.getAll(),
  })

  const { mutate: regenerateKey, isPending: isRegenerating } = useMutation({
    mutationFn: (institutionId: string) =>
      institutionService.regenerateApiKey(institutionId),
    onSuccess: (_data, institutionId) => {
      toast.success('API key regenerated. A new reveal link has been emailed.')
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
      setRegeneratingId(null)
      void institutionId
    },
    onError: () => {
      toast.error('Could not regenerate the API key. Please try again.')
      setRegeneratingId(null)
    },
  })

  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const handleRegenerate = (institution: GetInstitutionResponse) => {
    const confirmed = window.confirm(
      `Regenerate the API key for "${institution.name}"? The current key will stop working immediately, and a new one-time reveal link will be emailed.`
    )
    if (!confirmed) return
    setRegeneratingId(institution.institutionId)
    regenerateKey(institution.institutionId)
  }

  const filtered = data
    ? data.filter(
        (i: GetInstitutionResponse) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.verificationNumber.toLowerCase().includes(search.toLowerCase()) ||
          i.type.toLowerCase().includes(search.toLowerCase())
      )
    : []

  return (
    <main className="h-full bg-cream-background text-deep-green p-6">
      <Text variant="h1" className="mb-6">
        Registered Institutions
      </Text>

      <div className="w-full mb-6">
        <TextField
          placeholder="Search by name, type or verification number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {isLoading && <Text variant="sub-md">Loading institutions...</Text>}

      {isError && (
        <Text variant="sub-md" className="text-red-500">
          Failed to load institutions. Make sure the backend is running.
        </Text>
      )}

      {data && filtered.length === 0 && (
        <Text variant="sub-md">No institutions found.</Text>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col gap-4">
          {filtered.map((institution: GetInstitutionResponse) => (
            <Card key={institution.institutionId} className="rounded-2xl">
              <CardContent className="p-4 flex flex-col gap-1">
                <Text variant="h4">{institution.name}</Text>
                <Text variant="sub-sm" className="text-gray-500">
                  Type: {institution.type}
                </Text>
                <Text variant="sub-sm" className="text-gray-500">
                  Verification Number: {institution.verificationNumber}
                </Text>
                <Text variant="sub-sm" className="text-gray-500">
                  Registered:{' '}
                  {new Date(institution.createdAt).toLocaleDateString()}
                </Text>
                <div className="mt-2">
                  <Button
                    variant="secondary"
                    isLoading={
                      isRegenerating &&
                      regeneratingId === institution.institutionId
                    }
                    onClick={() => handleRegenerate(institution)}
                  >
                    Regenerate API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
