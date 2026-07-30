'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import FlashIdLogo from '@/assets/images/FlashID-green.png'
import { Text } from '@/components/atoms'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Features and How It Works', href: '/#features&how-it-works' },
  { label: 'Help', href: '/#help' },
  { label: 'Preview', href: '/#preview' },
]

export function LandingPageNavbar() {
  const pathname = usePathname()
  const isBrandStyleGuide = pathname === '/brand-style-guide'

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-clean-white bg-deep-green">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src={FlashIdLogo}
              alt="FlashID"
              width={200}
              height={50}
              className="h-11 w-auto transition-transform duration-300"
            />
            <Text as="h1" variant="h3" className="text-clean-white"></Text>
          </Link>

          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const href = link.href
                const isAnchorLink = link.href.includes('#')
                const finalHref =
                  isBrandStyleGuide && isAnchorLink ? link.href : link.href

                return (
                  <li key={link.label}>
                    <Link
                      href={finalHref}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-clean-white/90 transition-all duration-200 hover:bg-clean-white/20 hover:text-clean-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-clean-white hover:bg-clean-white/20 rounded-lg"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-primary-green bg-clean-white rounded-lg shadow-lg hover:shadow-xl"
            >
              Register
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex h-1 w-full">
        <div className="flex-1 bg-deep-green" />
        <div className="flex-1 bg-accent-gold" />
        <div className="flex-1 bg-text-primary" />
        <div className="flex-1 bg-national-red" />
        <div className="flex-1 bg-national-blue" />
      </div>
    </header>
  )
}
