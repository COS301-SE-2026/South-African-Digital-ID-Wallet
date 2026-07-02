import { render, screen } from '@testing-library/react'
import { NotificationsList } from '../notifications-list'

describe('NotificationsList', () => {
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
  })
})
