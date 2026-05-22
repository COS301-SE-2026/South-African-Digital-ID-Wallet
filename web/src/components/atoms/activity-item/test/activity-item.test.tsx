import { render, screen } from '@testing-library/react'

import { ActivityItem } from '@/components/atoms'

describe('ActivityItem', () => {
  it('renders title and time', () => {
    render(<ActivityItem title="Login" time="2m ago" />)

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('2m ago')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<ActivityItem title="Login" subtitle="New device" time="2m ago" />)

    expect(screen.getByText('New device')).toBeInTheDocument()
  })
})
