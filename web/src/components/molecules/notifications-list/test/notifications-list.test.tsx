import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationsList } from '../notifications-list'

describe('NotificationsList', () => {
  it('renders the heading and the preview list', () => {
    render(<NotificationsList />)

    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(
      screen.getByText("Driver's Licence expires in 7 days")
    ).toBeInTheDocument()
    expect(screen.getByText('Passport expires in 3 months')).toBeInTheDocument()
  })

  it('opens the full notifications modal when "View all" is clicked', () => {
    render(<NotificationsList />)

    fireEvent.click(screen.getByRole('button', { name: 'View all' }))

    expect(screen.getByText('All Notifications')).toBeInTheDocument()
    expect(screen.getByText('SARS filing reminder6')).toBeInTheDocument()
  })

  it('closes the modal when Close is clicked', () => {
    render(<NotificationsList />)

    fireEvent.click(screen.getByRole('button', { name: 'View all' }))
    expect(screen.getByText('All Notifications')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('All Notifications')).not.toBeInTheDocument()
  })
})
