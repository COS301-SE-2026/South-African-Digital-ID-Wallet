import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppSidebar } from '../app-sidebar'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/citizen'),
}))

const DEFAULT_NAV_SECTIONS = [
  {
    title: 'Citizen Portal',
    items: [
      { label: 'Dashboard', href: '/citizen', icon: 'dashboard' as const },
      {
        label: 'My Credentials',
        href: '/credentials',
        icon: 'credentials' as const,
      },
    ],
  },
]

const DEFAULT_USER = { name: 'John Doe', initials: 'JD', idLabel: 'ID: 123456' }

describe('AppSidebar', () => {
  it('renders the Flash ID logo', () => {
    render(
      <AppSidebar navSections={DEFAULT_NAV_SECTIONS} user={DEFAULT_USER} />
    )
    expect(screen.getByAltText('Flash ID logo')).toBeInTheDocument()
  })

  it('renders nav section titles when expanded', () => {
    render(
      <AppSidebar navSections={DEFAULT_NAV_SECTIONS} user={DEFAULT_USER} />
    )
    expect(screen.getByText('Citizen Portal')).toBeInTheDocument()
  })

  it('renders nav links', () => {
    render(
      <AppSidebar navSections={DEFAULT_NAV_SECTIONS} user={DEFAULT_USER} />
    )
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /my credentials/i })
    ).toBeInTheDocument()
  })

  it('renders user name and idLabel when expanded', () => {
    render(
      <AppSidebar navSections={DEFAULT_NAV_SECTIONS} user={DEFAULT_USER} />
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('ID: 123456')).toBeInTheDocument()
  })

  it('collapses when the toggle button is clicked', async () => {
    const userEvent_ = userEvent.setup()
    render(
      <AppSidebar navSections={DEFAULT_NAV_SECTIONS} user={DEFAULT_USER} />
    )
    await userEvent_.click(
      screen.getByRole('button', { name: 'Collapse sidebar' })
    )
    expect(screen.queryByText('Citizen Portal')).not.toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('expands again after collapsing', async () => {
    const userEvent_ = userEvent.setup()
    render(
      <AppSidebar navSections={DEFAULT_NAV_SECTIONS} user={DEFAULT_USER} />
    )
    await userEvent_.click(
      screen.getByRole('button', { name: 'Collapse sidebar' })
    )
    await userEvent_.click(
      screen.getByRole('button', { name: 'Expand sidebar' })
    )
    expect(screen.getByText('Citizen Portal')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('still shows user initials when collapsed', async () => {
    const userEvent_ = userEvent.setup()
    render(
      <AppSidebar navSections={DEFAULT_NAV_SECTIONS} user={DEFAULT_USER} />
    )
    await userEvent_.click(
      screen.getByRole('button', { name: 'Collapse sidebar' })
    )
    expect(screen.getByText('JD')).toBeInTheDocument()
  })
})
