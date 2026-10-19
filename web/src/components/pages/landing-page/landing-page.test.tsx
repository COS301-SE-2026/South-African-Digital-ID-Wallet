import { ProductShowcase } from './product-showcase'
import { fireEvent, render, screen } from '@testing-library/react'
import borderStyles from './landing-effects.module.css'
import { LandingPageContent } from './landing-page'
import { SecuritySection } from './security-section'
import { MobilePreview } from './mobile-preview'
import { MobileAppSection } from './mobile-app-section'
import { LandingPageFooter } from '@/components/organisms/landing-page-footer/landing-page-footer'
import { MOBILE_SCREENS, USER_MANUAL_URL } from './landing-assets'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

describe('Landing page mobile preview', () => {
  it('moves forwards, backwards and wraps around', () => {
    render(<MobilePreview />)
    const slide = () => screen.getByRole('group', { name: /of 3/ })
    expect(slide()).toHaveAttribute(
      'aria-label',
      `1 of 3: ${MOBILE_SCREENS[0].label}`
    )
    fireEvent.click(screen.getByRole('button', { name: 'Next mobile preview' }))
    expect(slide()).toHaveAttribute(
      'aria-label',
      `2 of 3: ${MOBILE_SCREENS[1].label}`
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Previous mobile preview' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Previous mobile preview' })
    )
    expect(slide()).toHaveAttribute(
      'aria-label',
      `3 of 3: ${MOBILE_SCREENS[2].label}`
    )
  })

  it('supports direct slide selection and labels mockups honestly', () => {
    render(<MobilePreview />)
    const button = screen.getByRole('button', {
      name: `Show ${MOBILE_SCREENS[2].label}`,
    })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-current', 'true')
    expect(
      screen.getByRole('img', {
        name: /Controlled sharing — illustrative mockup/,
      })
    ).toBeInTheDocument()
  })
})

describe('Landing page downloads', () => {
  it('does not offer a broken APK link while the URL is empty', () => {
    render(<MobileAppSection />)
    expect(
      screen.getByRole('button', { name: 'APK download coming soon' })
    ).toBeDisabled()
    expect(
      screen.queryByRole('link', { name: 'Download Android APK' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Download user manual/ })
    ).toHaveAttribute('href', USER_MANUAL_URL)
    expect(
      screen.getByRole('link', { name: /Download user manual/ })
    ).toHaveAttribute('download', 'FlashID-User-Manual.pdf')
  })

  it('uses the same downloadable manual and logo in the footer', () => {
    render(<LandingPageFooter />)
    expect(
      screen.getByRole('link', { name: 'Download user manual' })
    ).toHaveAttribute('href', USER_MANUAL_URL)
    expect(
      screen.getByRole('link', { name: 'Download user manual' })
    ).toHaveAttribute('download')
    expect(
      screen.getByRole('img', { name: 'FlashID home' })
    ).toBeInTheDocument()
  })
})

describe('Requested landing refinements', () => {
  it('moves the same phone elements between positions without swapping their screens', () => {
    const { container } = render(<MobilePreview />)
    const phones = Array.from(container.querySelectorAll('[data-phone]'))
    const wallet = phones[0]
    expect(wallet).toHaveAttribute('data-position', 'center')
    const image = wallet.querySelector('[role="img"]')
    fireEvent.click(screen.getByRole('button', { name: 'Next mobile preview' }))
    expect(container.querySelectorAll('[data-phone]')[0]).toBe(wallet)
    expect(wallet).toHaveAttribute('data-position', 'left')
    expect(wallet.querySelector('[role="img"]')).toBe(image)
    expect(phones[1]).toHaveAttribute('data-position', 'center')
    expect(phones[2]).toHaveAttribute('data-position', 'right')
    expect(
      screen.queryByText(/Illustrative app preview/)
    ).not.toBeInTheDocument()
  })

  it('uses a registration phone and removes the APK explanation', () => {
    render(<MobileAppSection />)
    expect(
      screen.getByRole('img', {
        name: 'FlashID registration screen — illustrative mockup',
      })
    ).toBeInTheDocument()
    expect(screen.queryByText(/Registration preview/)).not.toBeInTheDocument()
    expect(
      screen.queryByText(/The APK is not available here yet/)
    ).not.toBeInTheDocument()
  })

  it('keeps audience and feature cards light with animated borders and lift shadows', () => {
    const { container } = render(<LandingPageContent />)
    const cards = container.querySelectorAll(
      '#about article, #features article'
    )
    expect(cards).toHaveLength(9)
    cards.forEach((card) => {
      expect(card).toHaveClass(
        borderStyles.flowBorder,
        'motion-safe:hover:-translate-y-2'
      )
      expect(card.className).toContain('hover:shadow-')
      expect(card.className).not.toMatch(
        /border-t-4|hover:bg-deep-green|hover:bg-clean-white/
      )
    })
    expect(container.querySelector('#features')).toHaveClass(
      'bg-cream-background'
    )
    expect(
      screen.getByText('Your identity. In a flash.').querySelector('span')
    ).toBeNull()
  })

  it('keeps all five security protections in the redesigned section', () => {
    render(<SecuritySection />)
    expect(
      screen.getByRole('region', { name: 'Security that supports confidence.' })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('Selective disclosure')).toBeInTheDocument()
    expect(screen.getByText('Protected communication')).toBeInTheDocument()
  })
})

describe('Gradient headings', () => {
  it('keeps the green-to-gold fill without letter outlines', () => {
    const { container } = render(<LandingPageContent />)
    const gradientText = container.querySelectorAll(
      'h1 span.text-transparent, h2 span.text-transparent, h3 span.text-transparent'
    )
    expect(gradientText.length).toBeGreaterThanOrEqual(8)
    gradientText.forEach((span) => {
      expect(span).toHaveClass('from-primary-green', 'to-accent-gold')
      expect(span.className).not.toContain('text-stroke')
      expect(span.className).not.toContain('paint-order')
    })
  })
})

describe('Wider layout and selective hover effects', () => {
  it('only enables the swipe on smaller cards, not the large panels', () => {
    const { container } = render(<LandingPageContent />)
    const small = container.querySelectorAll(
      '#about article, #features article'
    )
    small.forEach((card) =>
      expect(card).toHaveClass(borderStyles.smallCardSwipe)
    )
    const phoneCard = container.querySelector('#mobile-app > div > div')
    expect(phoneCard).not.toHaveClass(borderStyles.smallCardSwipe)
    const security = screen.getByRole('region', {
      name: 'Security that supports confidence.',
    })
    const cards = security.querySelectorAll('li')
    expect(cards[0]).not.toHaveClass(borderStyles.smallCardSwipe)
    Array.from(cards)
      .slice(1)
      .forEach((card) => expect(card).toHaveClass(borderStyles.smallCardSwipe))
  })

  it('removes the narrow desktop content caps while retaining side padding', () => {
    const { container } = render(<LandingPageContent />)
    const sections = container.querySelectorAll(
      '#home > div:last-child, #about > div, #features > div, #preview > div, #mobile-app > div, #help > div'
    )
    expect(sections.length).toBe(6)
    sections.forEach((section) =>
      expect(section).toHaveClass('w-full', 'max-w-none')
    )
  })
})

describe('FlashID principles panel', () => {
  it('presents all four principles in a labelled responsive list', () => {
    render(<LandingPageContent />)
    const panel = screen.getByRole('region', { name: 'FlashID principles' })
    expect(panel.querySelectorAll('li')).toHaveLength(4)
    panel
      .querySelectorAll('li')
      .forEach((card) => expect(card).toHaveClass(borderStyles.flowBorder))
    expect(panel).toHaveTextContent('Everyday confidence.')
    expect(panel).toHaveTextContent('Secure by design')
    expect(panel).toHaveTextContent('Instant verification')
    expect(panel).toHaveTextContent('Privacy protected')
    expect(panel).toHaveTextContent('Built for South Africa')
    expect(panel.querySelector('ul')).toHaveClass(
      'grid-cols-2',
      'lg:grid-cols-2'
    )
  })
})

describe('Product showcase carousel', () => {
  it('slides forwards, backwards and wraps without replacing screenshot elements', () => {
    render(<ProductShowcase />)
    const slide = () => screen.getByRole('group', { name: /of 4/ })
    const firstImage = screen.getByRole('img', { name: 'Dashboard screenshot' })
    expect(slide()).toHaveAttribute('aria-label', '1 of 4: Dashboard')
    fireEvent.click(screen.getByRole('button', { name: 'Next product screen' }))
    expect(slide()).toHaveAttribute('aria-label', '2 of 4: Your account')
    fireEvent.click(
      screen.getByRole('button', { name: 'Previous product screen' })
    )
    expect(screen.getByRole('img', { name: 'Dashboard screenshot' })).toBe(
      firstImage
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Previous product screen' })
    )
    expect(slide()).toHaveAttribute('aria-label', '4 of 4: Verification')
  })

  it('supports direct selection and keyboard navigation', () => {
    render(<ProductShowcase />)
    const button = screen.getByRole('button', {
      name: 'View Credentials screen',
    })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('heading', {
        name: 'Important credentials. One clear home.',
      })
    ).toBeInTheDocument()
    fireEvent.keyDown(button, { key: 'ArrowRight' })
    expect(
      screen.getByRole('group', { name: '4 of 4: Verification' })
    ).toBeInTheDocument()
  })

  it('opens the selected screenshot in an accessible enlarged dialog', () => {
    render(<ProductShowcase />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Enlarge current product screenshot' })
    )
    expect(
      screen.getByRole('dialog', { name: 'Dashboard' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Dashboard full-size screenshot' })
    ).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Visible screenshot controls', () => {
  it('places both arrows on the image stage without the visible numeric counter', () => {
    render(<ProductShowcase />)
    const stage = screen.getByTestId('product-image-stage')
    expect(stage).toContainElement(
      screen.getByRole('button', { name: 'Previous product screen' })
    )
    expect(stage).toContainElement(
      screen.getByRole('button', { name: 'Next product screen' })
    )
    expect(
      screen.getByRole('button', { name: 'Next product screen' })
    ).toHaveClass('bg-deep-green', 'text-clean-white', '!absolute')
    expect(screen.queryByText('04')).not.toBeInTheDocument()
  })
})
