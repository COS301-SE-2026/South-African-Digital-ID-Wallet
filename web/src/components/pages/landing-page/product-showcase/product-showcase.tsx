'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Expand } from 'lucide-react'
import { Button } from '@/components/atoms'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SHOWCASE_SCREENS } from './screens'
import effects from '../landing-effects.module.css'

export function ProductShowcase() {
  const [active, setActive] = useState(0)
  const touchStart = useRef<number | null>(null)
  const screen = SHOWCASE_SCREENS[active]
  const Icon = screen.icon
  const move = (direction: number) =>
    setActive(
      (current) =>
        (current + direction + SHOWCASE_SCREENS.length) %
        SHOWCASE_SCREENS.length
    )
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Explore the FlashID web experience"
      className="mx-auto w-full lg:w-[94%]"
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          move(-1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          move(1)
        }
      }}
    >
      <div className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-green">
            Take a closer look
          </p>
          <p className="mt-2 text-sm text-muted-text">
            Four views. One connected experience.
          </p>
        </div>
      </div>
      <div
        className={`${effects.flowBorder} overflow-hidden rounded-[1.75rem] bg-clean-white shadow-[0_25px_70px_-45px_rgba(5,59,44,0.4)] sm:rounded-[2rem]`}
      >
        <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_370px]">
          <div
            className="min-w-0 bg-cream-background/60 p-2 sm:p-4 lg:p-5"
            onTouchStart={(event) => {
              touchStart.current = event.touches[0].clientX
            }}
            onTouchEnd={(event) => {
              if (touchStart.current === null) return
              const distance =
                event.changedTouches[0].clientX - touchStart.current
              if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1)
              touchStart.current = null
            }}
          >
            <div className="overflow-hidden rounded-2xl border border-deep-green/10 bg-clean-white shadow-sm">
              <div className="flex min-h-11 items-center justify-between gap-3 border-b border-deep-green/10 bg-clean-white px-4">
                <span className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-green" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-gold" />
                  <span className="h-1.5 w-1.5 rounded-full bg-deep-green/15" />
                </span>
                <span className="text-[10px] font-semibold tracking-wide text-deep-green/60">
                  FlashID / {screen.shortLabel}
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      aria-label="Enlarge current product screenshot"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-green hover:bg-primary-green/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green"
                    >
                      <Expand className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[96vw] max-w-[96vw] gap-3 p-3 sm:max-w-[96vw] sm:p-5">
                    <DialogTitle className="pr-10 text-base font-bold text-deep-green">
                      {screen.shortLabel}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Enlarged FlashID product screenshot. Close this dialog to
                      return to the carousel.
                    </DialogDescription>
                    <div className="relative h-[min(76vh,900px)] w-full">
                      <Image
                        src={screen.image}
                        alt={`${screen.shortLabel} full-size screenshot`}
                        fill
                        sizes="96vw"
                        className="object-contain"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div
                className="relative overflow-hidden"
                data-testid="product-image-stage"
              >
                <div
                  className="flex motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateX(-${active * 100}%)` }}
                >
                  {SHOWCASE_SCREENS.map((item, index) => (
                    <div
                      key={item.shortLabel}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${index + 1} of 4: ${item.shortLabel}`}
                      aria-hidden={index !== active}
                      className="relative aspect-[2560/1447] w-full shrink-0 bg-clean-white"
                    >
                      <Image
                        src={item.image}
                        alt={`${item.shortLabel} screenshot`}
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1280px) calc(100vw - 440px), 94vw"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  variant="custom"
                  aria-label="Previous product screen"
                  onClick={() => move(-1)}
                  className="!absolute left-2 top-1/2 z-20 !h-12 !w-12 -translate-y-1/2 !rounded-full border-2 border-clean-white bg-deep-green !px-0 text-clean-white shadow-[0_4px_18px_rgba(0,0,0,0.35)] ring-1 ring-deep-green/20 transition hover:!bg-primary-green focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-gold sm:left-4 sm:!h-14 sm:!w-14"
                >
                  <ArrowLeft
                    className="h-6 w-6"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </Button>
                <Button
                  variant="custom"
                  aria-label="Next product screen"
                  onClick={() => move(1)}
                  className="!absolute right-2 top-1/2 z-20 !h-12 !w-12 -translate-y-1/2 !rounded-full border-2 border-clean-white bg-deep-green !px-0 text-clean-white shadow-[0_4px_18px_rgba(0,0,0,0.35)] ring-1 ring-deep-green/20 transition hover:!bg-primary-green focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-gold sm:right-4 sm:!h-14 sm:!w-14"
                >
                  <ArrowRight
                    className="h-6 w-6"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>
          </div>
          <div
            className={`${effects.cardSurface} flex flex-col justify-center border-t border-deep-green/10 p-6 sm:p-8 xl:border-l xl:border-t-0`}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-green/10 text-primary-green">
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary-green">
                {screen.shortLabel}
              </span>
            </div>
            <h3 className="text-2xl font-bold leading-tight tracking-tight text-deep-green sm:text-3xl">
              {screen.label}
            </h3>
            <p className="mt-4 text-sm leading-7 text-muted-text">
              {screen.description}
            </p>
            <ul className="mt-6 space-y-3 border-t border-deep-green/10 pt-5">
              {screen.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-start gap-2.5 text-xs leading-6 text-deep-green"
                >
                  <Check
                    className="mt-1 h-3.5 w-3.5 shrink-0 text-primary-green"
                    aria-hidden="true"
                  />
                  {detail}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-7 inline-flex min-h-11 items-center gap-2 self-start rounded-lg text-sm font-bold text-primary-green hover:text-deep-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green"
            >
              Make it your FlashID{' '}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-deep-green/10 sm:grid-cols-4">
          {SHOWCASE_SCREENS.map((item, index) => {
            const ItemIcon = item.icon
            return (
              <button
                key={item.shortLabel}
                type="button"
                aria-label={`View ${item.shortLabel} screen`}
                aria-pressed={active === index}
                onClick={() => setActive(index)}
                className={`relative flex min-h-16 items-center justify-center gap-2 border-deep-green/10 px-3 py-4 text-xs font-semibold transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-green sm:min-h-20 sm:gap-3 sm:text-sm ${active === index ? 'bg-primary-green/[0.06] text-deep-green' : 'bg-clean-white text-muted-text hover:bg-cream-background hover:text-deep-green'}`}
              >
                <ItemIcon
                  className={`h-4 w-4 shrink-0 ${active === index ? 'text-primary-green' : 'text-deep-green/40'}`}
                  aria-hidden="true"
                />
                {item.shortLabel}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-5 bottom-0 h-0.5 rounded-full ${active === index ? 'bg-gradient-to-r from-primary-green to-accent-gold' : 'bg-transparent'}`}
                />
              </button>
            )
          })}
        </div>
      </div>
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {screen.shortLabel}, screen {active + 1} of 4
      </span>
    </div>
  )
}
