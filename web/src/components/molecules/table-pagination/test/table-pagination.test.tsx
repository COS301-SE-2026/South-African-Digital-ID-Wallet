import { render, screen, fireEvent } from '@testing-library/react'
import { TablePagination } from '../table-pagination'

const defaultProps = {
  currentPage: 1,
  totalPages: 50,
  totalResults: 248,
  resultsPerPage: 5,
  onPageChange: jest.fn(),
}

describe('TablePagination', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the results summary text', () => {
    render(<TablePagination {...defaultProps} />)
    expect(
      screen.getByText('Showing 1 to 5 of 248 results')
    ).toBeInTheDocument()
  })

  it('renders page number buttons', () => {
    render(<TablePagination {...defaultProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('calls onPageChange with the next page when next is clicked', () => {
    const onPageChange = jest.fn()
    render(
      <TablePagination
        {...defaultProps}
        currentPage={1}
        onPageChange={onPageChange}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with the previous page when previous is clicked', () => {
    const onPageChange = jest.fn()
    render(
      <TablePagination
        {...defaultProps}
        currentPage={2}
        onPageChange={onPageChange}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('disables the previous button on the first page', () => {
    render(<TablePagination {...defaultProps} currentPage={1} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  })

  it('disables the next button on the last page', () => {
    render(
      <TablePagination {...defaultProps} currentPage={50} totalPages={50} />
    )
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('calls onPageChange when a specific page number is clicked', () => {
    const onPageChange = jest.fn()
    render(<TablePagination {...defaultProps} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByText('2'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange when the last page number is clicked', () => {
    const onPageChange = jest.fn()
    render(<TablePagination {...defaultProps} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByText('50'))
    expect(onPageChange).toHaveBeenCalledWith(50)
  })
})
