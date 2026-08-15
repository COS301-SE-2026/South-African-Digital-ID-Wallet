import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppSidebar } from '../app-sidebar'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/citizen/citizen-dashboard'),
}))

const DEFAULT_NAV_SECTIONS = [
  {
    title: 'Citizen Portal',
    items: [
      {
        label: 'Dashboard',
        href: '/citizen/citizen-dashboard',
        icon: 'dashboard' as const,
      },
      {
        label: 'My Credentials',
        href: '/credentials',
        icon: 'credentials' as const,
      },
    ],
  },
]

const DEFAULT_USER = {
  name: 'John Doe',
  initials: 'JD',
}

const mockLogout = jest.fn()

describe('AppSidebar', () => {
  beforeEach(() => {
    mockLogout.mockClear()
  })

  it('renders the FlashID logo', () => {
    render(
      <AppSidebar
        navSections={DEFAULT_NAV_SECTIONS}
        user={DEFAULT_USER}
        onLogout={mockLogout}
      />
    )

    expect(screen.getByAltText('FlashID Logo')).toBeInTheDocument()
  })

  it('logo links to the dashboard', () => {
    render(
      <AppSidebar
        navSections={DEFAULT_NAV_SECTIONS}
        user={DEFAULT_USER}
        onLogout={mockLogout}
      />
    )

    expect(
      screen.getByRole('link', {
        name: /go to dashboard/i,
      })
    ).toHaveAttribute('href', '/citizen/citizen-dashboard')
  })

  it('renders nav section titles when expanded', () => {
    render(
      <AppSidebar
        navSections={DEFAULT_NAV_SECTIONS}
        user={DEFAULT_USER}
        onLogout={mockLogout}
      />
    )

    expect(screen.getByText('Citizen Portal')).toBeInTheDocument()
  })

  it('renders nav links', () => {
    render(
      <AppSidebar
        navSections={DEFAULT_NAV_SECTIONS}
        user={DEFAULT_USER}
        onLogout={mockLogout}
      />
    )

    expect(
      screen.getByRole('link', {
        name: /^Dashboard$/,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: /my credentials/i,
      })
    ).toBeInTheDocument()
  })

  it('renders user name when expanded', () => {
    render(
      <AppSidebar
        navSections={DEFAULT_NAV_SECTIONS}
        user={DEFAULT_USER}
        onLogout={mockLogout}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('collapses when the toggle button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <AppSidebar
        navSections={DEFAULT_NAV_SECTIONS}
        user={DEFAULT_USER}
        onLogout={mockLogout}
      />
    )

    await user.click(
      screen.getByRole('button', {
        name: /collapse sidebar/i,
      })
    )

    expect(screen.queryByText('Citizen Portal')).not.toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('expands again after collapsing', async () => {
    const user = userEvent.setup()

    render(
      <AppSidebar
        navSections={DEFAULT_NAV_SECTIONS}
        user={DEFAULT_USER}
        onLogout={mockLogout}
      />
    )

    await user.click(
      screen.getByRole('button', {
        name: /collapse sidebar/i,
      })
    )

    expect(screen.queryByText('Citizen Portal')).not.toBeInTheDocument()

    await user.hover(screen.getByRole('complementary'))

    await user.click(
      screen.getByRole('button', {
        name: /keep sidebar open/i,
      })
    )

    expect(screen.getByText('Citizen Portal')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('still shows user initials when collapsed', async () => {
    const user = userEvent.setup()

    render(
      <AppSidebar
        navSections={DEFAULT_NAV_SECTIONS}
        user={DEFAULT_USER}
        onLogout={mockLogout}
      />
    )

    await user.click(
      screen.getByRole('button', {
        name: /collapse sidebar/i,
      })
    )

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('calls logout when the logout button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <AppSidebar
        navSections={DEFAULT_NAV_SECTIONS}
        user={DEFAULT_USER}
        onLogout={mockLogout}
      />
    )

    await user.click(screen.getByRole('button', { name: /logout/i }))

    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
