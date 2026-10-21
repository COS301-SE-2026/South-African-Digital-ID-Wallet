import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityCard } from '../activity-card'
import type { OfficialActivityItem } from '../types'

const item = (index: number): OfficialActivityItem => ({
  id: String(index),
  eventType: 'CredentialVerified',
  details: `raw details ${index}`,
  summary: `Identity Document · ${index} fields disclosed`,
  createdAt: '2026-10-11T14:57:00Z',
})

const items = (count: number) =>
  Array.from({ length: count }, (_, i) => item(i + 1))

describe('ActivityCard', () => {
  it('shows the summary, not the raw details', () => {
    render(<ActivityCard activity={items(1)} />)
    expect(
      screen.getByText('Identity Document · 1 fields disclosed')
    ).toBeInTheDocument()
    expect(screen.queryByText('raw details 1')).not.toBeInTheDocument()
  })

  it('shows the empty state when there is no work', () => {
    render(<ActivityCard activity={[]} />)
    expect(screen.getByText('No citizen work yet.')).toBeInTheDocument()
  })

  it('hides "View all" when everything already fits on the card', () => {
    render(<ActivityCard activity={items(5)} />)
    expect(
      screen.queryByRole('button', { name: 'View all' })
    ).not.toBeInTheDocument()
  })

  it('shows 5 on the card and all of them in "View all"', async () => {
    const user = userEvent.setup()
    render(<ActivityCard activity={items(8)} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(5)

    await user.click(screen.getByRole('button', { name: 'View all' }))

    const dialog = screen.getByRole('dialog', { name: 'My recent work' })
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(8)
  })
})
