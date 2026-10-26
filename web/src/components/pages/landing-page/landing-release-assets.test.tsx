import { render, screen } from '@testing-library/react'
import { MobileAppSection } from './mobile-app-section'
import { MobilePreview } from './mobile-preview'

jest.mock('./landing-assets', () => {
  const actual = jest.requireActual('./landing-assets')
  return {
    ...actual,
    ANDROID_APK_URL: 'https://downloads.example.test/flashid.apk',
    MOBILE_REGISTER_SCREEN: {
      src: '/landing/real-register.png',
      isMockup: false,
    },
    MOBILE_SCREENS: actual.MOBILE_SCREENS.map(
      (item: { label: string; src: string }) => ({ ...item, isMockup: false })
    ),
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}))

describe('Configured release assets', () => {
  it('enables the real APK download without duplicating the footer manual link', () => {
    render(<MobileAppSection />)
    const apk = screen.getByRole('link', { name: 'Download Android APK' })
    expect(apk).toHaveAttribute(
      'href',
      'https://downloads.example.test/flashid.apk'
    )
    expect(apk).toHaveAttribute('download')
    expect(
      screen.queryByRole('button', { name: 'APK download coming soon' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Download user manual/ })
    ).not.toBeInTheDocument()
  })

  it('uses the real registration screenshot without a mockup label', () => {
    render(<MobileAppSection />)
    expect(
      screen.getByRole('img', { name: 'FlashID mobile registration screen' })
    ).toHaveAttribute('data-src', '/landing/real-register.png')
    expect(
      screen.queryByRole('img', { name: /mockup/ })
    ).not.toBeInTheDocument()
  })

  it('does not label real carousel screenshots as illustrative mockups', () => {
    render(<MobilePreview />)
    expect(screen.getByRole('img', { name: 'Your wallet' })).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: /illustrative mockup/ })
    ).not.toBeInTheDocument()
  })
})
