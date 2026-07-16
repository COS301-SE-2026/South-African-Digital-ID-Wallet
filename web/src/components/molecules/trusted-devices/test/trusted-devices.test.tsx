import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrustedDevices } from '../trusted-devices'

describe('TrustedDevices', () => {
  it('renders the trusted devices heading', () => {
    render(<TrustedDevices />)

    expect(
      screen.getByRole('heading', { name: /trusted devices/i })
    ).toBeInTheDocument()
  })

  it('renders the list of trusted devices', () => {
    render(<TrustedDevices />)

    expect(screen.getByText(/iphone 16 pro max/i)).toBeInTheDocument()

    expect(screen.getByText(/brave web portal/i)).toBeInTheDocument()

    expect(screen.getByText(/ipad pro/i)).toBeInTheDocument()
  })

  it('renders the device status labels', () => {
    render(<TrustedDevices />)

    expect(screen.getByText(/active/i)).toBeInTheDocument()

    expect(screen.getAllByText(/known/i)).toHaveLength(2)
  })

  it('opens the manage devices modal', async () => {
    const user = userEvent.setup()

    render(<TrustedDevices />)

    await user.click(screen.getByRole('button', { name: /manage/i }))

    expect(
      screen.getAllByRole('heading', { name: /trusted devices/i })
    ).toHaveLength(2)

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('renders an unlink button for each device in the modal', async () => {
    const user = userEvent.setup()

    render(<TrustedDevices />)

    await user.click(screen.getByRole('button', { name: /manage/i }))

    expect(
      screen.getAllByRole('button', { name: /unlink device/i })
    ).toHaveLength(3)
  })

  it('closes the modal when Close is clicked', async () => {
    const user = userEvent.setup()

    render(<TrustedDevices />)

    await user.click(screen.getByRole('button', { name: /manage/i }))

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(
      screen.getAllByRole('heading', { name: /trusted devices/i })
    ).toHaveLength(1)
  })
})
