import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import type { TablePaginationProps } from './types'

function getPagesToShow(currentPage: number, totalPages: number): number[] {
  const maxVisible = 3
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  let start = Math.max(1, currentPage - 1)
  const end = Math.min(totalPages, start + maxVisible - 1)
  start = Math.max(1, end - maxVisible + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export const TablePagination = ({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
}: TablePaginationProps) => {
  const start = totalResults === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1
  const end = Math.min(currentPage * resultsPerPage, totalResults)
  const pagesToShow = getPagesToShow(currentPage, totalPages)
  const showLeadingEllipsis = pagesToShow[0] > 1
  const showTrailingEllipsis = pagesToShow[pagesToShow.length - 1] < totalPages

  return (
    <div className="flex items-center justify-between">
      <Text as="span" variant="sub-sm" className="text-muted-text">
        Showing {start} to {end} of {totalResults} results
      </Text>
      <div className="flex items-center gap-1">
        <Button
          variant="text"
          LeftIcon={ChevronLeft}
          className="!h-8 !w-8 !p-0"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          dataCy="pagination-prev"
        >
          <span className="sr-only">Previous page</span>
        </Button>

        {showLeadingEllipsis && (
          <>
            <PageButton page={1} isActive={false} onClick={onPageChange} />
            <Text as="span" variant="sub-sm" className="text-muted-text px-1">
              ...
            </Text>
          </>
        )}

        {pagesToShow.map((page) => (
          <PageButton
            key={page}
            page={page}
            isActive={page === currentPage}
            onClick={onPageChange}
          />
        ))}

        {showTrailingEllipsis && (
          <>
            <Text as="span" variant="sub-sm" className="text-muted-text px-1">
              ...
            </Text>
            <PageButton
              page={totalPages}
              isActive={false}
              onClick={onPageChange}
            />
          </>
        )}

        <Button
          variant="text"
          LeftIcon={ChevronRight}
          className="!h-8 !w-8 !p-0"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          dataCy="pagination-next"
        >
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  )
}

function PageButton({
  page,
  isActive,
  onClick,
}: {
  page: number
  isActive: boolean
  onClick: (page: number) => void
}) {
  return (
    <button
      onClick={() => onClick(page)}
      className={`h-8 w-8 rounded-md text-sm ${
        isActive
          ? 'bg-deep-green text-clean-white'
          : 'text-deep-green hover:bg-deep-green/10'
      }`}
    >
      {page}
    </button>
  )
}
