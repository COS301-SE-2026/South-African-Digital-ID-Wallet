import { render, screen } from '@testing-library/react'
import { AppShell } from '../app-shell'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/officials'),
  useRouter: jest.fn().mockReturnValue({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}))

jest.mock('@/context/user-context', () => ({
  useUser: jest.fn().mockReturnValue({
    user: {
      role: 'Official',
      names: 'Test',
      surname: 'User',
      email: 'test@example.com',
      userId: '12345678',
    },
    loading: false,
    logout: jest.fn(),
  }),
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
