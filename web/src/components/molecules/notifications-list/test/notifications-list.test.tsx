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

    fireEvent.click(screen.getByRole('button', { name: /view all/i }))

    expect(screen.getByText('All Notifications')).toBeInTheDocument()

    expect(
      screen.getAllByText("Driver's Licence expires in 7 days").length
    ).toBeGreaterThan(0)
  })

  it('closes the modal when Close is clicked', () => {
    render(<NotificationsList />)

    fireEvent.click(screen.getByRole('button', { name: /view all/i }))
    expect(screen.getByText('All Notifications')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /close/i }))

    expect(screen.queryByText('All Notifications')).not.toBeInTheDocument()
  })
})
