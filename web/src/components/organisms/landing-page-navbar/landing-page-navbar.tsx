'use client'

import { useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FlashIdLogo from '@/assets/images/FlashID-green.png'

const NAV_LINKS = [
  { label: 'About', href: '/#about' },
  { label: 'Features', href: '/#features' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Preview', href: '/#preview' },
  { label: 'Help', href: '/#help' },
]
export function LandingPageNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)
  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-clean-white/10 bg-deep-green">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-6 sm:px-8 lg:px-10">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-deep-green"
          >
            <Image
              src={FlashIdLogo}
              alt="FlashID home"
              width={200}
              height={50}
              className="h-10 w-auto object-contain sm:h-11"
              priority
            />
          </Link>
          <nav aria-label="Primary navigation" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-clean-white/80 transition hover:bg-clean-white/10 hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-bold text-clean-white transition hover:bg-clean-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-lg bg-accent-gold px-4 py-2.5 text-sm font-bold text-deep-green transition hover:bg-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clean-white"
            >
              Create account
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
          <button
            type="button"
            aria-label={
              isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-clean-white transition hover:bg-clean-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold lg:hidden"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-clean-white/10 bg-deep-green px-6 pb-6 pt-3 sm:px-8 lg:hidden"
          >
            <nav aria-label="Mobile navigation">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="block rounded-lg px-3 py-3 text-base font-semibold text-clean-white/85 transition hover:bg-clean-white/10 hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-clean-white/10 pt-4">
              <Link
                href="/login"
                onClick={closeMenu}
                className="rounded-lg border border-clean-white/20 px-4 py-3 text-center text-sm font-bold text-clean-white transition hover:bg-clean-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                className="rounded-lg bg-accent-gold px-4 py-3 text-center text-sm font-bold text-deep-green transition hover:bg-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clean-white"
              >
                Create account
              </Link>
            </div>
          </div>
        )}
      </div>
      <div aria-hidden="true" className="flex h-1 w-full">
        <div className="flex-1 bg-primary-green" />
        <div className="flex-1 bg-accent-gold" />
        <div className="flex-1 bg-text-primary" />
        <div className="flex-1 bg-national-red" />
        <div className="flex-1 bg-national-blue" />
      </div>
    </header>
  )
}
