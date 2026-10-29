// START FLASHID — CITIZEN PHOTOGRAPH
import { fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
// END FLASHID — CITIZEN PHOTOGRAPH
import { WalletHeroCard } from '../hero-card-citizen-dashboard'

// START FLASHID — CITIZEN PHOTOGRAPH
jest.mock('next/image', () => ({
  __esModule: true,
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean
      priority?: boolean
      unoptimized?: boolean
    }
  ) =>
    createElement('img', {
      alt: props.alt,
      className: props.className,
      onError: props.onError,
      src: props.src,
    }),
}))
// END FLASHID — CITIZEN PHOTOGRAPH

describe('WalletHeroCard', () => {
  // START FLASHID — CITIZEN DASHBOARD STATUS
  const defaultProps = {
    status: 'Pending' as const,
    isUnlinkedCitizen: false,
    isStatusLoading: false,
    isStatusError: false,
    photoUrl: null,
    isCredentialsLoading: false,
    isCredentialsError: false,
  }
  // END FLASHID — CITIZEN DASHBOARD STATUS

  // START FLASHID — CITIZEN DASHBOARD STATUS
  it('preserves the original copy and hero styling', () => {
    render(<WalletHeroCard {...defaultProps} />)

    expect(
      screen.getByRole('heading', {
        name: 'This is your FlashID wallet dashboard.',
      })
    ).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl')
    expect(
      screen.getByText(
        'Present your secure QR code whenever an authorised service provider needs to verify your identity.'
      )
    ).toHaveClass('mt-3', 'max-w-lg', 'text-sm', 'md:text-base')
    expect(document.querySelector('.bg-deep-green')).toHaveClass(
      'rounded-[26px]',
      'px-6',
      'py-7',
      'md:px-8',
      'md:py-8'
    )
    expect(document.querySelector('.md\\:flex-row')).toHaveClass('gap-8')
    expect(
      screen.getByRole('heading').querySelector('.text-accent-gold')
    ).toHaveTextContent(/wallet dashboard\./)
  })

  it('shows the styled Link Citizen Record button for Pending citizens', () => {
    render(<WalletHeroCard {...defaultProps} status="Pending" />)

    const link = screen.getByRole('link', { name: 'Link Citizen Record' })
    expect(link).toHaveAttribute('href', '/citizen/verify-identity')
    expect(link).toHaveClass(
      'bg-gray-100',
      'border-gray-200',
      'hover:bg-gray-200',
      'focus-visible:ring-2'
    )
    expect(link).toHaveTextContent('Link Citizen Record')
    expect(link).not.toHaveTextContent('Verify My Identity')
    expect(link.querySelector('svg')).toHaveClass('text-gray-700')
  })

  it('links an explicitly unlinked citizen to identity verification', () => {
    render(<WalletHeroCard {...defaultProps} status={null} isUnlinkedCitizen />)

    expect(
      screen.getByRole('link', { name: 'Link Citizen Record' })
    ).toHaveAttribute('href', '/citizen/verify-identity')
  })

  it('links Verified citizens to credential activation', () => {
    render(
      <>
        <WalletHeroCard {...defaultProps} status="Verified" />
        <WalletHeroCard {...defaultProps} status="Pending" />
      </>
    )

    const activateLink = screen.getByRole('link', {
      name: 'Activate Credentials',
    })
    const recordLink = screen.getByRole('link', {
      name: 'Link Citizen Record',
    })
    expect(activateLink).toHaveAttribute(
      'href',
      '/citizen/activate-credentials'
    )
    expect(activateLink.className).toBe(recordLink.className)
    expect(activateLink.querySelector('svg')).toHaveClass(
      'h-11',
      'w-11',
      'text-gray-700'
    )
  })

  it('renders the actual photograph for Activated citizens', () => {
    render(
      <WalletHeroCard
        {...defaultProps}
        status="Activated"
        photoUrl="https://photos.example/id.png"
      />
    )

    expect(screen.getByAltText('Citizen identity photograph')).toHaveAttribute(
      'src',
      'https://photos.example/id.png'
    )
    expect(screen.getByAltText('Citizen identity photograph')).toHaveClass(
      'object-cover'
    )
  })

  it('shows a neutral fallback for Activated citizens without a photograph', () => {
    render(<WalletHeroCard {...defaultProps} status="Activated" />)

    expect(screen.getByText('Photograph unavailable')).toBeInTheDocument()
  })

  it('shows a neutral fallback when the photograph fails to load', () => {
    render(
      <WalletHeroCard
        {...defaultProps}
        status="Activated"
        photoUrl="https://photos.example/id.png"
      />
    )

    fireEvent.error(screen.getByAltText('Citizen identity photograph'))

    expect(screen.getByText('Photograph unavailable')).toBeInTheDocument()
  })

  it.each(['Suspended', 'Deactivated'] as const)(
    'does not show navigation for %s citizens',
    (status) => {
      render(<WalletHeroCard {...defaultProps} status={status} />)

      expect(screen.getByText('Account unavailable')).toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    }
  )

  it('shows a neutral state while account status is loading', () => {
    render(<WalletHeroCard {...defaultProps} status={null} isStatusLoading />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading...')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows a neutral state when account status fails to load', () => {
    render(<WalletHeroCard {...defaultProps} status={null} isStatusError />)

    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows a neutral state when credentials fail for an Activated citizen', () => {
    render(
      <WalletHeroCard {...defaultProps} status="Activated" isCredentialsError />
    )

    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
  // END FLASHID — CITIZEN DASHBOARD STATUS
})
