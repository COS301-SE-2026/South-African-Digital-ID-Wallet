import { render, screen, fireEvent } from '@testing-library/react'
import { CredentialStatsFilter } from '../credential-stats-filter'
import type { SearchResultRow } from '@/components/organisms/search-results-table/types'

const mockRows: SearchResultRow[] = [
  {
    id: '1',
    initials: 'TS',
    firstName: 'Thabo',
    surname: 'Ndlovu',
    idNumber: '860101 5385 088',
    dateJoined: '12 May 2024',
    expiresOn: '2034-05-12',
    status: 'active',
  },
  {
    id: '2',
    initials: 'JM',
    firstName: 'Jabulani',
    surname: 'Mthembu',
    idNumber: '920303 5678 083',
    dateJoined: '18 Apr 2024',
    expiresOn: '2034-04-18',
    status: 'suspended',
  },
]

describe('CredentialStatsFilter', () => {
  it('renders computed totals', () => {
    render(
      <CredentialStatsFilter rows={mockRows} value="all" onChange={jest.fn()} />
    )
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1', { exact: true })).toBeInTheDocument()
  })

  it('calls onChange with the clicked filter', () => {
    const onChange = jest.fn()
    render(
      <CredentialStatsFilter rows={mockRows} value="all" onChange={onChange} />
    )
    fireEvent.click(screen.getByText('Active Credentials'))
    expect(onChange).toHaveBeenCalledWith('active')
  })

  it('clears back to "all" when the active filter is clicked again', () => {
    const onChange = jest.fn()
    render(
      <CredentialStatsFilter
        rows={mockRows}
        value="active"
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByText('Active Credentials'))
    expect(onChange).toHaveBeenCalledWith('all')
  })

  it('marks the currently selected filter as pressed', () => {
    render(
      <CredentialStatsFilter
        rows={mockRows}
        value="suspended"
        onChange={jest.fn()}
      />
    )

    const suspendedCard = screen
      .getByText('Suspended Credentials')
      .closest('[role="button"]')
    const activeCard = screen
      .getByText('Active Credentials')
      .closest('[role="button"]')
    expect(suspendedCard).toHaveAttribute('aria-pressed', 'true')
    expect(activeCard).toHaveAttribute('aria-pressed', 'false')
  })

  it('supports keyboard activation via Enter', () => {
    const onChange = jest.fn()
    render(
      <CredentialStatsFilter rows={mockRows} value="all" onChange={onChange} />
    )
    const expiringCard = screen
      .getByText('Expiring Soon')
      .closest('[role="button"]') as HTMLElement
    fireEvent.keyDown(expiringCard, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('expiring')
  })
})
