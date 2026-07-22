import { LandingPageNavbar } from '../navbar-section'
import { LandingPageContent } from './content-section'
import { LandingPageFooter } from '../footer-section'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <LandingPageNavbar />
      <LandingPageContent />
      <LandingPageFooter />
    </div>
  )
}
