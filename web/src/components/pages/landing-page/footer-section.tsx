import { Mail } from 'lucide-react'

const FOOTER_LINKS = ['Privacy Policy', 'Terms of Service', 'Security']

export function LandingPageFooter() {
  return (
    <footer className="border-t border-gray-200 bg-deep-green">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 text-md text-clean-white/70 sm:flex-row lg:px-10">
        <p className="font-medium">© 2024 Flash ID. All rights reserved.</p>

        <ul className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="transition-colors hover:text-primary-green"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <a
            href="mailto:info@flashid.co.za"
            aria-label="Email"
            className="rounded-full bg-primary-green p-2 text-clean-white transition hover:bg-deep-green"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
