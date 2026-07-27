import { render, screen } from '@testing-library/react'
import { AppShell } from '../app-shell'
import { useUser } from '@/context/user-context'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/officials'),
  useRouter: jest.fn().mockReturnValue({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}))

jest.mock('@/context/user-context', () => ({
  useUser: jest.fn(),
}))

const mockedUseUser = useUser as jest.Mock

describe('AppShell', () => {
  beforeEach(() => {
    mockedUseUser.mockReturnValue({
      user: {
        role: 'Official',
        names: 'Test',
        surname: 'User',
        email: 'test@example.com',
        userId: '12345678',
      },
      loading: false,
      logout: jest.fn(),
    })
  })

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

  it('renders loading state', () => {
    mockedUseUser.mockReturnValue({
      user: null,
      loading: true,
      logout: jest.fn(),
    })

    render(
      <AppShell>
        <div>content</div>
      </AppShell>
    )

    expect(screen.getByText('Load')).toBeInTheDocument()
  })

  it('renders nothing when there is no user', () => {
    mockedUseUser.mockReturnValue({
      user: null,
      loading: false,
      logout: jest.fn(),
    })

    const { container } = render(
      <AppShell>
        <div>content</div>
      </AppShell>
    )

    expect(container.firstChild).toBeNull()
  })
})
