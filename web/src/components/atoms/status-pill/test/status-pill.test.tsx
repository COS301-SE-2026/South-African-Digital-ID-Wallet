import { render, screen } from '@testing-library/react'

import { StatusPill } from '@/components/atoms'

describe('StatusPill', () => {
  it('renders active intent by default', () => {
    render(<StatusPill>Active</StatusPill>)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders inactive intent', () => {
    render(<StatusPill intent="inactive">Inactive</StatusPill>)

    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
