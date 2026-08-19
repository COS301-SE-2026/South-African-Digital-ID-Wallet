import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import type { TablePaginationProps } from './types'

export const TablePagination = ({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
}: TablePaginationProps) => {
  const start = (currentPage - 1) * resultsPerPage + 1
  const end = Math.min(currentPage * resultsPerPage, totalResults)

  const pagesToShow = [1, 2, 3]

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

        {pagesToShow.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 rounded-md text-sm ${
              page === currentPage
                ? 'bg-deep-green text-clean-white'
                : 'text-deep-green hover:bg-deep-green/10'
            }`}
          >
            {page}
          </button>
        ))}

        <Text as="span" variant="sub-sm" className="text-muted-text px-1">
          ...
        </Text>

        <button
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 rounded-md text-sm text-deep-green hover:bg-deep-green/10"
        >
          {totalPages}
        </button>

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
