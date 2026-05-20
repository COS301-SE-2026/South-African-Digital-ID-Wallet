import { render, screen } from '@testing-library/react'
import { AppTopBar } from '@/components/organisms'

const DEFAULT_USER = { name: 'John Doe', initials: 'JD', subtitle: 'Citizen' }

describe('AppTopBar', () => {
  it('renders the title and description', () => {
    render(
      <AppTopBar
        title="Dashboard"
        description="Welcome back"
        user={DEFAULT_USER}
      />
    )
    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument()
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders the user name and initials', () => {
    render(<AppTopBar title="Dashboard" description="" user={DEFAULT_USER} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders the user subtitle when provided', () => {
    render(<AppTopBar title="Dashboard" description="" user={DEFAULT_USER} />)
    expect(screen.getByText('Citizen')).toBeInTheDocument()
  })

  it('does not render the subtitle when not provided', () => {
    const user = { name: 'Jane', initials: 'J' }
    render(<AppTopBar title="Dashboard" description="" user={user} />)
    expect(screen.queryByText('Citizen')).not.toBeInTheDocument()
  })

  it('shows the notification button by default', () => {
    render(<AppTopBar title="Dashboard" description="" user={DEFAULT_USER} />)
    expect(
      screen.getByRole('button', { name: 'Notifications' })
    ).toBeInTheDocument()
  })

  it('hides the notification button when showNotifications is false', () => {
    render(
      <AppTopBar
        title="Dashboard"
        description=""
        user={DEFAULT_USER}
        showNotifications={false}
      />
    )
    expect(
      screen.queryByRole('button', { name: 'Notifications' })
    ).not.toBeInTheDocument()
  })

  it('shows the notification count badge when notificationCount is greater than 0', () => {
    render(
      <AppTopBar
        title="Dashboard"
        description=""
        user={DEFAULT_USER}
        notificationCount={5}
      />
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not show a badge when notificationCount is 0', () => {
    render(
      <AppTopBar
        title="Dashboard"
        description=""
        user={DEFAULT_USER}
        notificationCount={0}
      />
    )
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
