'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, IdCard, Landmark, UploadCloud } from 'lucide-react'
import {
  institutionService,
  formatInstitutionType,
  GetInstitutionResponse,
} from '@/services/institution-service'
import { Text } from '@/components/atoms/text'
import { SearchBar } from '@/components/atoms/search-bar'
import { AdminStatCard } from '@/components/molecules/admin-stat-card/admin-stat-card'
import type { AdminStatItem } from '@/components/molecules/admin-stat-card/types'
import { QuickActionsRow } from '@/components/organisms/quick-action-row/quick-action-row'

const QUICK_ACTIONS = [
  {
    key: 'upload-institution',
    icon: <UploadCloud className="h-5 w-5" />,
    title: 'Upload Institution',
    description: 'Register a new institution',
    href: '/gov-admin/upload-institution',
  },
]

export const ViewInstitutionsPage = () => {
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => institutionService.getAll(),
  })

  const institutions: GetInstitutionResponse[] = data ?? []
  const query = search.toLowerCase()
  const filtered = institutions.filter(
    (i: GetInstitutionResponse) =>
      i.name.toLowerCase().includes(query) ||
      i.verificationNumber.toLowerCase().includes(query) ||
      i.type.toLowerCase().includes(query)
  )

  const statItems: AdminStatItem[] = [
    {
      icon: Building2,
      label: 'Total Institutions',
      value: institutions.length,
    },
    {
      icon: Landmark,
      label: 'Home Affairs',
      value: institutions.filter((i) => i.type === 'HomeAffairs').length,
    },
    {
      icon: IdCard,
      label: 'Licensing Departments',
      value: institutions.filter((i) => i.type === 'LicensingDepartment')
        .length,
    },
  ]

  return (
    <div className="flex min-h-full overflow-x-hidden bg-cream-background">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-4">
            <QuickActionsRow actions={QUICK_ACTIONS} />
            <AdminStatCard items={statItems} />
          </div>

          <section className="min-h-0 min-w-0 lg:col-span-8">
            <div className="flex h-full flex-col rounded-[24px] border-2 border-black bg-card p-6">
              <div className="flex shrink-0 items-center justify-between gap-4">
                <Text
                  as="h2"
                  variant="h4"
                  className="!text-lg font-extrabold text-deep-green"
                >
                  Registered Institutions
                </Text>
                <Text
                  as="span"
                  variant="caption"
                  className="shrink-0 whitespace-nowrap !text-xs text-muted-text"
                >
                  {filtered.length} of {institutions.length}
                </Text>
              </div>

              <SearchBar
                className="mt-4 shrink-0"
                value={search}
                placeholder="Search by name, type or verification number..."
                onChange={(e) => setSearch(e.target.value)}
              />

              {isLoading ? (
                <div className="flex flex-1 items-center justify-center py-10">
                  <Text
                    as="p"
                    variant="sub-sm"
                    className="!text-sm text-muted-text"
                  >
                    Loading institutions…
                  </Text>
                </div>
              ) : isError ? (
                <div className="flex flex-1 items-center justify-center py-10">
                  <p className="text-sm text-national-red" role="alert">
                    Failed to load institutions. Make sure the backend is
                    running.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-10">
                  <Text
                    as="p"
                    variant="sub-sm"
                    className="!text-sm text-muted-text"
                  >
                    No institutions found.
                  </Text>
                </div>
              ) : (
                <ul className="mt-2 flex max-h-[520px] min-h-0 flex-col divide-y divide-black/10 overflow-y-auto">
                  {filtered.map((institution: GetInstitutionResponse) => (
                    <li
                      key={institution.institutionId}
                      className="flex items-center justify-between gap-4 py-5 first:pt-4"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <Text
                            as="p"
                            variant="sub-sm"
                            className="truncate !text-sm font-bold text-text-primary"
                          >
                            {institution.name}
                          </Text>
                          <Text
                            as="p"
                            variant="sub-sm"
                            className="mt-0.5 truncate !text-xs text-muted-text"
                          >
                            {formatInstitutionType(institution.type)} ·{' '}
                            {institution.verificationNumber}
                          </Text>
                        </div>
                      </div>
                      <Text
                        as="span"
                        variant="caption"
                        className="shrink-0 whitespace-nowrap !text-xs text-muted-text"
                      >
                        {new Date(institution.createdAt).toLocaleDateString(
                          'en-ZA',
                          { day: 'numeric', month: 'short', year: 'numeric' }
                        )}
                      </Text>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
