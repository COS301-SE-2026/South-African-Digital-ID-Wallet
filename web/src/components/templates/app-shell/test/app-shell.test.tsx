import { render, screen } from '@testing-library/react'
import { AppShell } from '../app-shell'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/officials'),
}))

describe('AppShell', () => {
  it('renders the correct page header for the current pathname', () => {
    render(
      <AppShell>
        <div>content</div>
      </AppShell>
    )
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <AppShell>
        <div>page content</div>
      </AppShell>
    )
    expect(screen.getByText('page content')).toBeInTheDocument()
  })
})
