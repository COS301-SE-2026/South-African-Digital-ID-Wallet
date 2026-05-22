'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  institutionService,
  GetInstitutionResponse,
} from '@/services/institution-service'
import { Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { Card, CardContent } from '@/components/ui/card'

export const ViewInstitutionsPage = () => {
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => institutionService.getAll(),
  })

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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
