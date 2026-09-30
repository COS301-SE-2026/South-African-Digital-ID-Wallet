'use client'

import { useState } from 'react'
import {
  ChevronDown,
  HelpCircle,
  LockKeyhole,
  MessageCircleQuestion,
  ShieldCheck,
} from 'lucide-react'
import { Text } from '@/components/atoms'

const FAQS = [
  {
    question: 'How do I get my digital ID onto FlashID?',
    answer:
      'Government-issued credentials are added to your wallet after your identity has been successfully verified. Once registered, eligible credentials appear automatically.',
  },
  {
    question: 'Is my information safe?',
    answer:
      'FlashID uses encryption and selective disclosure, allowing you to share only the information required for a verification request.',
  },
  {
    question: 'Can institutions trust a shared credential?',
    answer:
      'Credentials are digitally signed by their issuing authority, allowing organisations to verify authenticity without relying on unverified copies.',
  },
  {
    question: 'What happens if I lose my device?',
    answer:
      'You can revoke trusted devices from your account and sign in on a new device after completing the required identity-verification steps.',
  },
  {
    question: 'What is selective disclosure?',
    answer:
      'Selective disclosure lets you share only the specific pieces of information requested, such as your age or student status, instead of revealing your entire credential.',
  },
  {
    question: 'Can I use FlashID offline?',
    answer:
      'Supported offline verification features allow a credential holder to present an offline QR code after the required wallet setup has been completed.',
  },
  {
    question: 'Which credentials can I store?',
    answer:
      'FlashID can store supported government-issued identity documents and credentials issued by trusted organisations such as universities or authorised institutions.',
  },
  {
    question: 'How do I share my credentials?',
    answer:
      'You can generate a secure QR code or verification request that allows a verifier to confirm only the information you choose to share.',
  },
  {
    question: 'Can I delete my account?',
    answer:
      'Yes. You can permanently delete your account from the Manage Account page. You will be asked to confirm your decision before your account is removed.',
  },
  {
    question: 'What happens if a credential expires?',
    answer:
      'Expired credentials remain visible for your records but cannot be used for verification until a new valid credential is issued.',
  },
  {
    question: 'Who can see my personal information?',
    answer:
      'Information is not shared unless you explicitly approve a verification request or another supported authorised flow.',
  },
  {
    question: 'How do I know if a credential is genuine?',
    answer:
      'A credential includes a digital signature that can be checked to confirm that it was issued by a trusted source and has not been altered.',
  },
  {
    question: 'What should I do if I forget my password?',
    answer:
      'Use the Forgot password link on the login page. Follow the emailed verification-code process to choose a new password.',
  },
  {
    question: 'Does FlashID replace my physical ID?',
    answer:
      'FlashID provides a secure digital version of supported credentials, but physical documents may still be required where digital credentials are not yet accepted.',
  },
]

export function HelpMenuSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(6)
  return (
    <section
      id="help"
      className="scroll-mt-28 bg-cream-background py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-32">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-green text-clean-white shadow-lg">
              <HelpCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <Text
              as="p"
              variant="label"
              className="text-sm uppercase tracking-[0.18em]"
            >
              Support, made simple
            </Text>
            <Text
              as="h2"
              variant="h2"
              className="mt-3 max-w-md text-3xl sm:text-4xl"
            >
              Questions before you get started?
            </Text>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-text sm:text-lg">
              Find quick answers about your credentials, privacy, devices, and
              identity verification.
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl bg-deep-green shadow-lg">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gold text-deep-green">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-clean-white">
                      Built around trust
                    </p>
                    <p className="mt-1 text-xs text-clean-white/60">
                      Clear answers for a confident start.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-4 border-t border-clean-white/10 pt-5">
                  <div className="flex items-start gap-3">
                    <LockKeyhole
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-gold"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-6 text-clean-white/75">
                      Understand how your information is shared.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircleQuestion
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-gold"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-6 text-clean-white/75">
                      Browse answers without leaving the page.
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-accent-gold" />
            </div>
          </div>
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-green">
                  Frequently asked questions
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-deep-green sm:text-3xl">
                  How can we help?
                </h3>
              </div>
              <span className="hidden rounded-full bg-clean-white px-3 py-1.5 text-xs font-bold text-muted-text shadow-sm sm:inline-flex">
                {FAQS.length} questions
              </span>
            </div>
            <div className="space-y-3">
              {FAQS.slice(0, visibleCount).map((faq, index) => {
                const isOpen = openFaqIndex === index
                const answerId = `faq-answer-${index}`
                const buttonId = `faq-question-${index}`
                return (
                  <div
                    key={faq.question}
                    className={`overflow-hidden rounded-2xl border bg-clean-white transition ${
                      isOpen
                        ? 'border-primary-green shadow-md'
                        : 'border-border-grey shadow-sm hover:border-primary-green/40 hover:shadow-md'
                    }`}
                  >
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex min-h-16 w-full items-center justify-between gap-5 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-green sm:px-6"
                    >
                      <span className="flex items-center gap-4">
                        <span
                          className={`hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold sm:flex ${
                            isOpen
                              ? 'bg-primary-green text-clean-white'
                              : 'bg-cream-background text-primary-green'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-bold leading-6 text-text-primary sm:text-base">
                          {faq.question}
                        </span>
                      </span>
                      <span
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition ${
                          isOpen
                            ? 'bg-primary-green text-clean-white'
                            : 'bg-cream-background text-primary-green'
                        }`}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        id={answerId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="px-5 pb-5 sm:px-6"
                      >
                        <div className="ml-0 border-l-2 border-accent-gold pl-4 sm:ml-12">
                          <p className="max-w-2xl text-sm leading-7 text-muted-text">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {visibleCount < FAQS.length && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((count) => Math.min(count + 5, FAQS.length))
                  }
                  className="rounded-xl border border-primary-green bg-clean-white px-5 py-3 text-sm font-bold text-primary-green transition hover:bg-primary-green hover:text-clean-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2"
                >
                  Show more questions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
