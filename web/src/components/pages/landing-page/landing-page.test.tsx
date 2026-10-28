import { ProductShowcase } from './product-showcase'
import {
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import borderStyles from '@/styles/landing-effects.module.css'
import { LandingPageNavbar } from '@/components/organisms/landing-page-navbar/landing-page-navbar'
import { HelpMenuSection } from '@/components/molecules/help-menu-section/help-menu-section'
import { LandingPage, LandingPageContent } from './landing-page'
import { SecuritySection } from './security-section'
import { MobilePreview } from './mobile-preview'
import { MobileAppSection } from './mobile-app-section'
import { LandingPageFooter } from '@/components/organisms/landing-page-footer/landing-page-footer'
import { MOBILE_SCREENS } from './landing-assets'
import { USER_MANUAL_URL } from '@/lib/landing-links'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    priority,
    className,
  }: {
    alt: string
    priority?: boolean
    className?: string
  }) => (
    <span
      role="img"
      aria-label={alt}
      data-priority={String(Boolean(priority))}
      className={className}
    />
  ),
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

  it('supports direct slide selection and shows actual app screenshots', () => {
    render(<MobilePreview />)
    const button = screen.getByRole('button', {
      name: `Show ${MOBILE_SCREENS[2].label}`,
    })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-current', 'true')
    expect(
      screen.getByRole('img', {
        name: 'Controlled sharing',
      })
    ).toBeInTheDocument()
  })
})

describe('Landing review regressions', () => {
  it('prioritizes only the centered mobile screenshot as slides change', () => {
    const { container } = render(<MobilePreview />)
    const assertCenteredPriority = () => {
      expect(container.querySelectorAll('[data-priority="true"]')).toHaveLength(
        1
      )
      expect(
        container.querySelector('[data-position="center"] [role="img"]')
      ).toHaveAttribute('data-priority', 'true')
      container
        .querySelectorAll(
          '[data-position]:not([data-position="center"]) [role="img"]'
        )
        .forEach((image) =>
          expect(image).toHaveAttribute('data-priority', 'false')
        )
    }
    assertCenteredPriority()
    fireEvent.click(screen.getByRole('button', { name: 'Next mobile preview' }))
    assertCenteredPriority()
  })

  it('aligns both footer containers with the navbar and avoids logo scaling', () => {
    const { container } = render(
      <>
        <LandingPageNavbar />
        <LandingPageFooter />
      </>
    )
    const navbar = container.querySelector('header .max-w-7xl')!
    expect(navbar).toHaveClass('max-w-7xl', 'px-6', 'sm:px-8', 'lg:px-10')
    const footerContainers = container.querySelectorAll('footer .mx-auto')
    expect(footerContainers).toHaveLength(2)
    footerContainers.forEach((element) => {
      expect(element).toHaveClass('max-w-7xl', 'px-6', 'sm:px-8', 'lg:px-10')
      expect(element).not.toHaveClass('max-w-none')
    })
    const logo = within(screen.getByRole('banner')).getByRole('img', {
      name: 'FlashID home',
    })
    expect(logo).toHaveClass('sm:h-16')
    expect(logo.className).not.toContain('scale-')
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
      screen.queryByRole('link', { name: /Download user manual/ })
    ).not.toBeInTheDocument()
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
        name: 'FlashID mobile registration screen',
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
      screen.getByText('Your identity. In a flash.').querySelector('svg')
    ).toHaveClass('lucide-shield')
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

describe('Landing heading colours', () => {
  it('keeps only the hero heading gradient and makes other gradient titles deep green', () => {
    const { container } = render(<LandingPageContent />)
    const gradientText = container.querySelectorAll(
      'h1 span.text-transparent, h2 span.text-transparent, h3 span.text-transparent'
    )
    expect(gradientText).toHaveLength(2)
    gradientText.forEach((span) => {
      expect(span.closest('h1')).not.toBeNull()
    })
    const sectionTitles = container.querySelectorAll('h2 span, h3 span')
    sectionTitles.forEach((span) => {
      if (span.textContent !== 'Everyday confidence.') {
        expect(span).toHaveClass('text-deep-green')
      }
    })
    expect(container.querySelector('#home > div.grid > div')).toHaveClass(
      'lg:pl-16',
      'xl:pl-28'
    )
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
  it('slightly narrows the desktop showcase while keeping mobile full-width', () => {
    render(<ProductShowcase />)
    expect(
      screen.getByRole('region', { name: 'Explore the FlashID web experience' })
    ).toHaveClass('mx-auto', 'w-full', 'lg:w-[94%]')
  })

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

describe('Remaining showcase interactions', () => {
  it('moves backwards with ArrowLeft and ignores unrelated keys', () => {
    render(<ProductShowcase />)
    const region = screen.getByRole('region', {
      name: 'Explore the FlashID web experience',
    })
    fireEvent.keyDown(region, { key: 'ArrowLeft' })
    expect(
      screen.getByRole('group', { name: '4 of 4: Verification' })
    ).toBeInTheDocument()
    fireEvent.keyDown(region, { key: 'Tab' })
    expect(
      screen.getByRole('group', { name: '4 of 4: Verification' })
    ).toBeInTheDocument()
  })

  it('handles left and right swipes, short gestures, and unpaired touch ends', () => {
    render(<ProductShowcase />)
    const touchArea = screen.getByTestId('product-image-stage').parentElement!
      .parentElement!
    const slide = () => screen.getByRole('group', { name: /of 4/ })
    fireEvent.touchEnd(touchArea, { changedTouches: [{ clientX: 40 }] })
    expect(slide()).toHaveAttribute('aria-label', '1 of 4: Dashboard')
    fireEvent.touchStart(touchArea, { touches: [{ clientX: 200 }] })
    fireEvent.touchEnd(touchArea, { changedTouches: [{ clientX: 80 }] })
    expect(slide()).toHaveAttribute('aria-label', '2 of 4: Your account')
    fireEvent.touchStart(touchArea, { touches: [{ clientX: 80 }] })
    fireEvent.touchEnd(touchArea, { changedTouches: [{ clientX: 200 }] })
    expect(slide()).toHaveAttribute('aria-label', '1 of 4: Dashboard')
    for (const end of [130, 150, 170]) {
      fireEvent.touchStart(touchArea, { touches: [{ clientX: 150 }] })
      fireEvent.touchEnd(touchArea, { changedTouches: [{ clientX: end }] })
      expect(slide()).toHaveAttribute('aria-label', '1 of 4: Dashboard')
    }
    fireEvent.touchEnd(touchArea, { changedTouches: [{ clientX: 0 }] })
    expect(slide()).toHaveAttribute('aria-label', '1 of 4: Dashboard')
  })

  it('keeps enlarged screenshots in sync with each selected view', () => {
    render(<ProductShowcase />)
    for (const name of ['Your account', 'Credentials', 'Verification']) {
      fireEvent.click(
        screen.getByRole('button', { name: `View ${name} screen` })
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Enlarge current product screenshot',
        })
      )
      expect(screen.getByRole('dialog', { name })).toBeInTheDocument()
      expect(
        screen.getByRole('img', { name: `${name} full-size screenshot` })
      ).toBeInTheDocument()
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    }
  })
})

describe('Landing FAQs', () => {
  it('opens, switches, and closes an answer with accessible relationships', () => {
    render(<HelpMenuSection />)
    const first = screen.getByRole('button', {
      name: /How do I get my digital ID/,
    })
    const second = screen.getByRole('button', {
      name: /Is my information safe/,
    })
    expect(first).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(first)
    const answer = screen.getByRole('region', {
      name: /How do I get my digital ID/,
    })
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(first).toHaveAttribute('aria-controls', answer.id)
    expect(answer).toHaveTextContent('Government-issued credentials are added')
    fireEvent.click(second)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.queryByRole('region', { name: /How do I get my digital ID/ })
    ).not.toBeInTheDocument()
    fireEvent.click(second)
    expect(second).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('region', { name: /Is my information safe/ })
    ).not.toBeInTheDocument()
  })

  it('loads every remaining question in batches and removes the show-more button at the end', () => {
    render(<HelpMenuSection />)
    const questions = () =>
      screen
        .getAllByRole('button')
        .filter((button) => button.hasAttribute('aria-expanded'))
    expect(questions()).toHaveLength(6)
    fireEvent.click(screen.getByRole('button', { name: 'Show more questions' }))
    expect(questions()).toHaveLength(11)
    fireEvent.click(screen.getByRole('button', { name: 'Show more questions' }))
    expect(questions()).toHaveLength(14)
    expect(
      screen.queryByRole('button', { name: 'Show more questions' })
    ).not.toBeInTheDocument()
    for (const button of questions()) {
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
      const answer = document.getElementById(
        button.getAttribute('aria-controls')!
      )!
      expect(answer).toBeInTheDocument()
      expect(answer.textContent!.length).toBeGreaterThan(20)
    }
  })
})

describe('Full landing page and navigation', () => {
  it('renders the complete page with navigation, main content, and footer', () => {
    render(<LandingPage />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Your official identity,ready when you are.'
    )
    expect(
      within(
        screen.getByRole('navigation', { name: 'Primary navigation' })
      ).getByRole('link', { name: 'Mobile app' })
    ).toHaveAttribute('href', '/#mobile-app')
  })

  it('opens the mobile menu, exposes all destinations, and closes with its close button', async () => {
    render(<LandingPageNavbar />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' })
    )
    const menu = screen.getByRole('navigation', { name: 'Mobile navigation' })
    for (const [name, href] of [
      ['About', '/#about'],
      ['Features', '/#features'],
      ['How it works', '/#how-it-works'],
      ['Preview', '/#preview'],
      ['Mobile app', '/#mobile-app'],
      ['Help', '/#help'],
      ['Sign in', '/login'],
      ['Create account', '/register'],
    ]) {
      expect(within(menu).getByRole('link', { name })).toHaveAttribute(
        'href',
        href
      )
    }
    fireEvent.click(
      screen.getByRole('button', { name: 'Close navigation menu' })
    )
    await waitFor(() =>
      expect(
        screen.queryByRole('navigation', { name: 'Mobile navigation' })
      ).not.toBeInTheDocument()
    )
  })
})
