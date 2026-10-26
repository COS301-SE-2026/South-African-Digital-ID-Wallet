'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/atoms'
import { MOBILE_SCREENS } from '../landing-assets'
import { PhoneFrame } from './phone-frame'

export function MobilePreview() {
  const [active, setActive] = useState(0)
  const previous = (active + MOBILE_SCREENS.length - 1) % MOBILE_SCREENS.length
  const next = (active + 1) % MOBILE_SCREENS.length
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="FlashID mobile app preview"
      className="relative min-w-0"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 bottom-24 top-12 rounded-full bg-primary-green/10 blur-3xl"
      />
      <div className="relative mx-auto aspect-square w-full max-w-[500px] [perspective:1100px]">
        {MOBILE_SCREENS.map((screen, index) => {
          const position =
            (index - active + MOBILE_SCREENS.length) % MOBILE_SCREENS.length
          const centered = position === 0
          const transform = centered
            ? 'translateX(-50%) translateY(0) rotate(0deg) scale(1)'
            : position === 1
              ? 'translateX(5%) translateY(12%) rotate(0deg) scale(0.8)'
              : 'translateX(-105%) translateY(12%) rotate(0deg) scale(0.8)'
          return (
            <div
              key={screen.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${MOBILE_SCREENS.length}: ${screen.label}`}
              aria-hidden={!centered}
              data-phone={screen.src}
              data-position={
                centered ? 'center' : position === 1 ? 'right' : 'left'
              }
              className="absolute left-1/2 top-3 w-[48%] origin-center motion-safe:transition-[transform,opacity] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                transform,
                zIndex: centered ? 30 : position === 1 ? 20 : 10,
                opacity: centered ? 1 : 0.7,
              }}
            >
              <PhoneFrame
                src={screen.src}
                label={`${screen.label}${screen.isMockup ? ' — illustrative mockup' : ''}`}
                priority
              />
            </div>
          )
        })}
      </div>
      <div className="relative mt-4 flex items-center justify-center gap-5">
        <Button
          variant="custom"
          aria-label="Previous mobile preview"
          onClick={() => setActive(previous)}
          className="!h-10 !w-10 !rounded-full border border-deep-green/20 bg-clean-white !px-0 text-deep-green hover:bg-deep-green hover:text-clean-white focus-visible:ring-2 focus-visible:ring-primary-green"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="flex items-center" aria-label="Choose a mobile preview">
          {MOBILE_SCREENS.map((screen, index) => (
            <button
              key={screen.src}
              type="button"
              aria-label={`Show ${screen.label}`}
              aria-current={active === index ? 'true' : undefined}
              onClick={() => setActive(index)}
              className="flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green"
            >
              <span
                className={`h-2 rounded-full motion-safe:transition-all ${active === index ? 'w-6 bg-primary-green' : 'w-2 bg-deep-green/25 hover:bg-deep-green'}`}
              />
            </button>
          ))}
        </div>
        <Button
          variant="custom"
          aria-label="Next mobile preview"
          onClick={() => setActive(next)}
          className="!h-10 !w-10 !rounded-full border border-deep-green/20 bg-clean-white !px-0 text-deep-green hover:bg-deep-green hover:text-clean-white focus-visible:ring-2 focus-visible:ring-primary-green"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {MOBILE_SCREENS[active].label}
      </span>
    </div>
  )
}
