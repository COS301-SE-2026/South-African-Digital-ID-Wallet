import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchResultsTable } from '../search-results-table'

jest.mock('@/components/atoms/button', () => ({
  Button: ({
    children,
    dataCy,
    variant: _variant,
    ...props
  }: any) => (
    <button {...props} data-cy={dataCy}>
      {children}
    </button>
  ),
}))
jest.mock('@/components/atoms/text', () => ({
  Text: ({
    children,
    as: Component = 'span',
    variant: _variant,
    ...props
  }: any) => <Component {...props}>{children}</Component>,
}))
jest.mock('@/components/atoms/avatar/avatar', () => ({
  Avatar: ({ initials }: any) => <div>{initials}</div>,
}))
jest.mock('@/components/molecules/table-pagination', () => ({
  TablePagination: ({ onPageChange }: any) => (
    <button onClick={() => onPageChange(2)}>Next Page</button>
  ),
}))
const row = {
  id: '1',
  initials: 'JD',
  firstName: 'John',
  surname: 'Doe',
  idNumber: '9001015009087',
  dateJoined: '2026-01-01',
}
const createProps = (overrides = {}) =>
  ({
    rows: [row],
    currentPage: 1,
    totalPages: 2,
    totalResults: 1,
    resultsPerPage: 10,
    onPageChange: jest.fn(),
    onViewCredentials: jest.fn(),
    ...overrides,
  }) as any
describe('SearchResultsTable', () => {
  it('displays the empty state when there are no results', () => {
    render(<SearchResultsTable {...createProps({ rows: [] })} />)
    expect(screen.getByText('No results found.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
  it('renders search results', () => {
    render(<SearchResultsTable {...createProps()} />)
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Doe')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByText('9001015009087')).toBeInTheDocument()
    expect(screen.getByText('2026-01-01')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'View Credentials' })
    ).toBeInTheDocument()
  })
  it('handles viewing credentials and changing pages', async () => {
    const user = userEvent.setup()
    const props = createProps()
    render(<SearchResultsTable {...props} />)
    await user.click(
      screen.getByRole('button', { name: 'View Credentials' })
    )
    await user.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(props.onViewCredentials).toHaveBeenCalledWith(row)
    expect(props.onPageChange).toHaveBeenCalledWith(2)
  })
})