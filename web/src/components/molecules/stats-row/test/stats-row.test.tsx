import { render, screen } from '@testing-library/react'
import { StatsRow } from '../stats-row'
import type { CredentialStats } from '../types'
function textMatches(expected: string) {
  const normalizedExpected = expected.replace(/\s/g, ' ')
  return (_: string, element: Element | null) =>
    element?.textContent?.replace(/\s/g, ' ') === normalizedExpected
}

const mockStats: CredentialStats = {
  total: 248421,
  active: 231842,
  suspended: 3421,
  expiringSoon: 1284,
}

describe('StatsRow', () => {
  it('renders all four stat cards with formatted values', () => {
    render(<StatsRow stats={mockStats} />)
    expect(screen.getByText('Total Credentials')).toBeInTheDocument()
    expect(screen.getByText(textMatches('248 421'))).toBeInTheDocument()
    expect(screen.getByText('Active Credentials')).toBeInTheDocument()
    expect(screen.getByText(textMatches('231 842'))).toBeInTheDocument()
    expect(screen.getByText('93.3% of total')).toBeInTheDocument()
    expect(screen.getByText('Suspended Credentials')).toBeInTheDocument()
    expect(screen.getByText(textMatches('3 421'))).toBeInTheDocument()
    expect(screen.getByText('1.4% of total')).toBeInTheDocument()
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument()
    expect(screen.getByText(textMatches('1 284'))).toBeInTheDocument()
    expect(screen.getByText('Next 30 days')).toBeInTheDocument()
  })

  it('handles a zero total without dividing by zero', () => {
    const zeroStats: CredentialStats = {
      total: 0,
      active: 0,
      suspended: 0,
      expiringSoon: 0,
    }
    render(<StatsRow stats={zeroStats} />)
    const zeroPercentLabels = screen.getAllByText('0%')
    expect(zeroPercentLabels).toHaveLength(2)
  })
})
