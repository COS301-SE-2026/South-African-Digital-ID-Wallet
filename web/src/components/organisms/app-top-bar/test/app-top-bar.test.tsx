// START FLASHID — PROFILE AVATAR PHOTO
import { fireEvent, render, screen } from '@testing-library/react'
// END FLASHID — PROFILE AVATAR PHOTO
import { AppTopBar } from '@/components/organisms'

const DEFAULT_USER = { name: 'John Doe', initials: 'JD', subtitle: 'Citizen' }

describe('AppTopBar', () => {
  // START FLASHID — PROFILE AVATAR PHOTO
  it('shows the citizen photo with cover styling when available', () => {
    const { container } = render(
      <AppTopBar
        title="Dashboard"
        description=""
        user={{ ...DEFAULT_USER, photoUrl: 'https://photos.example/kp.jpg' }}
      />
    )

    const photo = container.querySelector(
      'img[src="https://photos.example/kp.jpg"]'
    )
    expect(photo).toHaveClass('object-cover')
    expect(screen.queryByText('JD')).not.toBeInTheDocument()
  })

  it('falls back to initials when the citizen photo fails to load', () => {
    const { container } = render(
      <AppTopBar
        title="Dashboard"
        description=""
        user={{ ...DEFAULT_USER, photoUrl: 'https://photos.example/kp.jpg' }}
      />
    )

    fireEvent.error(
      container.querySelector(
        'img[src="https://photos.example/kp.jpg"]'
      ) as HTMLImageElement
    )

    expect(screen.getByText('JD')).toBeInTheDocument()
  })
  // END FLASHID — PROFILE AVATAR PHOTO

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
