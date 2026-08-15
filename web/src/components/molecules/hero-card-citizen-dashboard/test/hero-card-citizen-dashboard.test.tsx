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

    const hasFullHeadingText = (element: Element | null) =>
      element?.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() ===
      'this is your flashid wallet dashboard.'

    expect(
      screen.getByText((_, element) => {
        if (!hasFullHeadingText(element)) return false
        return Array.from(element?.children ?? []).every(
          (child) => !hasFullHeadingText(child)
        )
      })
    ).toBeInTheDocument()
  })

  it('renders the QR code image', () => {
    render(<WalletHeroCard />)

    expect(screen.getByAltText(/flashid qr code/i)).toBeInTheDocument()
  })
})
