import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { WalletHeroCard } from '../hero-card-citizen-dashboard'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    <img {...props} alt={props.alt} />
  ),
}))

describe('WalletHeroCard', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    pushMock.mockClear()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
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

  it('navigates to the QR page when Generate QR Code is clicked', () => {
    render(<WalletHeroCard />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /generate qr code/i,
      })
    )

    expect(pushMock).toHaveBeenCalledWith('/citizen/qr')
  })

  it('loops back to the start once the countdown reaches zero', () => {
    render(<WalletHeroCard />)

    act(() => {
      jest.advanceTimersByTime(130000)
    })

    expect(screen.getByText(/qr expires in 01:50/i)).toBeInTheDocument()
  })
})
