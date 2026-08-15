import { render, screen } from '@testing-library/react'
import { WalletHeroCard } from '../hero-card-citizen-dashboard'

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
  it('renders the dashboard heading', () => {
    render(<WalletHeroCard />)

    expect(
      screen.getByText(/this is your flashid wallet dashboard/i)
    ).toBeInTheDocument()
  })

  it('renders the QR code image', () => {
    render(<WalletHeroCard />)

    expect(screen.getByAltText(/flashid qr code/i)).toBeInTheDocument()
  })
})
