import { Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

export function LandingPageFooter() {
  return (
    <footer className="bg-deep-green text-clean-white">
      <div aria-hidden="true" className="flex h-1 w-full">
        <div className="flex-1 bg-primary-green" />
        <div className="flex-1 bg-accent-gold" />
        <div className="flex-1 bg-text-primary" />
        <div className="flex-1 bg-national-red" />
        <div className="flex-1 bg-national-blue" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
        <div>
          <Link
            href="/"
            className="inline-flex rounded-lg text-2xl font-bold tracking-tight text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
          >
            Flash<span className="text-accent-gold">ID</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-clean-white/65">
            A secure digital identity wallet for simpler, trusted verification
            in South Africa.
          </p>
          <div className="mt-5 space-y-3 text-sm text-clean-white/70">
            <a
              href="mailto:t3chtitansgo@gmail.com"
              className="flex items-center gap-3 transition hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              <Mail className="h-4 w-4 text-accent-gold" aria-hidden="true" />
              t3chtitansgo@gmail.com
            </a>
            <span className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-accent-gold" aria-hidden="true" />
              Pretoria, South Africa
            </span>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-accent-gold">
            Explore
          </h2>
          <nav
            aria-label="Footer navigation"
            className="mt-4 space-y-3 text-sm text-clean-white/70"
          >
            <Link
              href="/#about"
              className="block transition hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              About FlashID
            </Link>
            <Link
              href="/#features"
              className="block transition hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              Features
            </Link>
            <Link
              href="/#preview"
              className="block transition hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              Product preview
            </Link>
            <Link
              href="/#help"
              className="block transition hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              Help and FAQs
            </Link>
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-accent-gold">
            Account
          </h2>
          <nav
            aria-label="Account navigation"
            className="mt-4 space-y-3 text-sm text-clean-white/70"
          >
            <Link
              href="/login"
              className="block transition hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="block transition hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              Create an account
            </Link>
            <Link
              href="https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/blob/main/docs/demo4/User%20Help%20Manual.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block transition hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              User manual
            </Link>
            <Link
              href="/brand-style-guide"
              className="block transition hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              Brand style guide
            </Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-clean-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4 text-xs text-clean-white/50 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>© {new Date().getFullYear()} FlashID. All rights reserved.</p>
          <p>Secure identity, made clearer.</p>
        </div>
      </div>
    </footer>
  )
}
