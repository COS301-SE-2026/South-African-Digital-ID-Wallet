'use client'

import { ArrowRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FlashIdLogo from '@/assets/images/FlashID-green.png'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const NAV_LINKS = [
  { label: 'About', href: '/#about' },
  { label: 'Features', href: '/#features' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Preview', href: '/#preview' },
  { label: 'Help', href: '/#help' },
]
export function LandingPageNavbar() {
  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-clean-white/10 bg-deep-green">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-6 sm:px-8 lg:px-10">
          <Link
            href="/"
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
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-clean-white transition hover:bg-clean-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-[min(20rem,85vw)] bg-deep-green p-0 text-clean-white"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav
                aria-label="Mobile navigation"
                className="flex h-full flex-col bg-deep-green px-4 pb-5 pt-5"
              >
                <div className="relative mb-5 flex items-center justify-center border-b border-clean-white/15 pb-5">
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                  >
                    <Image
                      src={FlashIdLogo}
                      alt="FlashID home"
                      width={180}
                      height={45}
                      className="h-10 w-auto object-contain"
                    />
                  </Link>
                  <SheetClose asChild>
                    <button
                      type="button"
                      aria-label="Close navigation menu"
                      className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-xl text-clean-white/70 transition hover:bg-accent-gold/10 hover:text-accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </SheetClose>
                </div>
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.label}>
                      <SheetClose asChild>
                        <Link
                          href={link.href}
                          className="block rounded-2xl border border-transparent px-4 py-3 text-base font-semibold text-clean-white/75 transition hover:border-accent-gold hover:bg-clean-white/10 hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto space-y-4">
                  <div className="rounded-[26px] bg-accent-gold p-[2px]">
                    <div className="rounded-[24px] bg-deep-green p-4">
                      <p className="text-sm font-extrabold text-clean-white">
                        Your identity, in your hands.
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-clean-white/60">
                        Store, share and verify official credentials securely.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 border-t border-clean-white/10 pt-4">
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="rounded-2xl border border-clean-white/20 px-4 py-3 text-center text-sm font-bold text-clean-white transition hover:bg-clean-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                      >
                        Sign in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/register"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-gold px-4 py-3 text-sm font-bold text-deep-green transition hover:bg-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clean-white"
                      >
                        Create account
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
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
