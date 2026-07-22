import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { WalletHeroCard } from '../hero-card-citizen-dashboard'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt} />
  ),
}))

describe('WalletHeroCard', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders the dashboard heading', () => {
    render(<WalletHeroCard />)

    expect(
      screen.getByText(/this is your flashid wallet dashboard/i)
    ).toBeInTheDocument()
  })

  it('renders the QR code image', () => {
    render(<WalletHeroCard />)

    expect(screen.getByAltText(/flash id qr code/i)).toBeInTheDocument()
  })

  it('renders the generate QR code button', () => {
    render(<WalletHeroCard />)

    expect(
      screen.getByRole('button', {
        name: /generate qr code/i,
      })
    ).toBeInTheDocument()
  })

  it('shows the initial countdown', () => {
    render(<WalletHeroCard />)

    expect(screen.getByText(/qr expires in 02:00/i)).toBeInTheDocument()
  })

  it('counts down every second', () => {
    render(<WalletHeroCard />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText(/qr expires in 01:59/i)).toBeInTheDocument()
  })

  it('resets the countdown when Generate QR Code is clicked', () => {
    render(<WalletHeroCard />)

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.getByText(/qr expires in 01:55/i)).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: /generate qr code/i,
      })
    )

    expect(screen.getByText(/qr expires in 02:00/i)).toBeInTheDocument()
  })

  it('never counts below 00:00', () => {
    render(<WalletHeroCard />)

    act(() => {
      jest.advanceTimersByTime(130000)
    })

    expect(screen.getByText(/qr expires in 00:00/i)).toBeInTheDocument()
  })
})
