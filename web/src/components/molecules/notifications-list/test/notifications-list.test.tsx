import { render, screen } from '@testing-library/react'
import { NotificationsList } from '../notifications-list'

describe('NotificationsList', () => {
  it('renders the heading and default notifications', () => {
    render(<NotificationsList />)

    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Credential review available')).toBeInTheDocument()
    expect(screen.getByText('Security alert')).toBeInTheDocument()
  })

  it('renders custom notifications when provided', () => {
    render(
      <NotificationsList
        notifications={[
          {
            id: 'n3',
            title: 'Profile updated',
            subtitle: 'Home address changed',
            time: 'Now',
          },
        ]}
      />
    )
    expect(screen.getByText('Profile updated')).toBeInTheDocument()
    expect(screen.queryByText('Security alert')).not.toBeInTheDocument()
  })
})
