import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import { Avatar } from '@/components/atoms/avatar/avatar'
import { TablePagination } from '@/components/molecules/table-pagination'
import type { SearchResultsTableProps } from './types'

export const SearchResultsTable = ({
  rows,
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
  onViewCredentials,
}: SearchResultsTableProps) => {
  if (rows.length === 0) {
    return (
      <div className="relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="rounded-[24px] bg-card p-8 text-center">
          <Text as="span" variant="sub-sm" className="text-muted-text">
            No results found.
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="overflow-hidden rounded-[24px] bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-deep-green">
                <th className="px-6 py-4 text-left first:rounded-tl-[22px]">
                  <Text
                    as="span"
                    variant="caption"
                    className="font-bold uppercase tracking-wide text-white"
                  >
                    Avatar
                  </Text>
                </th>

                <th className="px-6 py-4 text-left">
                  <Text
                    as="span"
                    variant="caption"
                    className="font-bold uppercase tracking-wide text-white"
                  >
                    Name
                  </Text>
                </th>

                <th className="px-6 py-4 text-left">
                  <Text
                    as="span"
                    variant="caption"
                    className="font-bold uppercase tracking-wide text-white"
                  >
                    Surname
                  </Text>
                </th>

                <th className="px-6 py-4 text-left">
                  <Text
                    as="span"
                    variant="caption"
                    className="font-bold uppercase tracking-wide text-white"
                  >
                    ID Number
                  </Text>
                </th>

                <th className="px-6 py-4 text-left">
                  <Text
                    as="span"
                    variant="caption"
                    className="font-bold uppercase tracking-wide text-white"
                  >
                    Date joined
                  </Text>
                </th>

                <th className="px-6 py-4 text-left last:rounded-tr-[22px]">
                  <Text
                    as="span"
                    variant="caption"
                    className="font-bold uppercase tracking-wide text-white"
                  >
                    Credentials
                  </Text>
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={
                    index % 2 === 0 ? 'bg-card' : 'bg-deep-green/[0.035]'
                  }
                >
                  <td className="px-6 py-4">
                    <Avatar initials={row.initials} />
                  </td>

                  <td className="px-6 py-4">
                    <Text
                      as="span"
                      variant="sub-sm"
                      className="font-semibold text-deep-green"
                    >
                      {row.firstName}
                    </Text>
                  </td>

                  <td className="px-6 py-4">
                    <Text
                      as="span"
                      variant="sub-sm"
                      className="font-semibold text-deep-green"
                    >
                      {row.surname}
                    </Text>
                  </td>

                  <td className="px-6 py-4">
                    <Text
                      as="span"
                      variant="sub-sm"
                      className="text-muted-text"
                    >
                      {row.idNumber}
                    </Text>
                  </td>

                  <td className="px-6 py-4">
                    <Text
                      as="span"
                      variant="sub-sm"
                      className="text-muted-text"
                    >
                      {row.dateJoined}
                    </Text>
                  </td>

                  <td className="px-6 py-4">
                    <Button
                      variant="secondary"
                      className="!h-auto !w-auto px-3 py-1.5 text-sm"
                      onClick={() => onViewCredentials(row)}
                      dataCy={`view-credentials-${row.id}`}
                    >
                      View Credentials
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-deep-green/10 bg-card px-6 py-4">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  )
}
