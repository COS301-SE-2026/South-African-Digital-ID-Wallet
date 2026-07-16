const NAV_LINKS = ['Features', 'Solutions', 'Pricing', 'Resources', 'Security']

export function LandingPageNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-deep-green">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white bg-brand-gold text-md font-bold text-clean-white">
            ID
          </span>

          <span className="text-md font-bold text-clean-white">VerifyID</span>
        </div>

        {/* Navigation */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="text-md font-medium text-clean-white transition-colors hover:text-brand-gold"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <a
            href="#sign-in"
            className="hidden text-md font-medium text-clean-white transition-colors hover:text-brand-gold sm:block"
          >
            Sign In
          </a>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white bg-brand-forest px-6 py-3 text-md font-semibold text-clean-white transition-all duration-200 hover:bg-brand-forestDark hover:border-brand-gold"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}
