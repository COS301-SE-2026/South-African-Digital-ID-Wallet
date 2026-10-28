import { ArrowDownToLine, Check, Smartphone } from 'lucide-react'
import { Button, Text } from '@/components/atoms'
import { ANDROID_APK_URL, MOBILE_REGISTER_SCREEN } from './landing-assets'
import { PhoneFrame } from './mobile-preview'
import borderStyles from '@/styles/landing-effects.module.css'

export function MobileAppSection() {
  return (
    <section
      id="mobile-app"
      className={`${borderStyles.ambientSection} scroll-mt-28 bg-cream-background px-6 py-20 sm:px-8 lg:px-10`}
    >
      <div className="relative mx-auto grid w-full max-w-none items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div
          className={`${borderStyles.flowBorder} ${borderStyles.cardSurface} relative z-10 rounded-[2rem] bg-clean-white p-7 shadow-[0_20px_50px_-35px_rgba(5,59,44,0.3)] sm:p-10 lg:p-12`}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-green/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-green">
            <Smartphone className="h-4 w-4" aria-hidden="true" /> FlashID on
            Android
          </span>
          <Text
            as="h2"
            variant="h2"
            className="mt-6 max-w-lg text-3xl leading-tight sm:text-4xl"
          >
            <span className="inline-block text-deep-green">
              Your next move.
            </span>
            <br />
            <span className="inline-block text-deep-green">
              Your wallet, with you.
            </span>
          </Text>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-text">
            Meet the mobile side of FlashID. A dedicated home for your digital
            identity, designed to keep everyday credential sharing close at
            hand.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-deep-green">
            {[
              'A mobile-first wallet experience',
              'Credentials in one organised place',
              'Thoughtful, controlled sharing',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check
                  className="h-4 w-4 text-primary-green"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {ANDROID_APK_URL ? (
              <a
                href={ANDROID_APK_URL}
                download
                className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-primary-green px-5 py-3 font-bold text-clean-white transition hover:bg-deep-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2"
              >
                <ArrowDownToLine className="h-5 w-5" aria-hidden="true" />
                Download Android APK
              </a>
            ) : (
              <Button
                disabled
                variant="custom"
                className="!h-12 !w-auto rounded-xl bg-deep-green px-5 text-clean-white"
                LeftIcon={Smartphone}
              >
                APK download coming soon
              </Button>
            )}
          </div>
        </div>
        <div className="relative flex min-h-[540px] items-center justify-center px-4 py-6 sm:min-h-[660px]">
          <div className="relative w-[250px] max-w-full -rotate-2 sm:w-[300px] lg:w-[310px]">
            <PhoneFrame
              src={MOBILE_REGISTER_SCREEN.src}
              screenAspectRatio={MOBILE_REGISTER_SCREEN.aspectRatio}
              label="FlashID mobile registration screen"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
