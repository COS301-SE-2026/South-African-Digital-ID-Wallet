'use client'

import { HelpCircle, MessageCircleQuestion, ChevronDown } from 'lucide-react'
import { useState } from 'react'
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
      'Yes. FlashID uses strong encryption and selective disclosure, allowing you to share only the information required for a verification request.',
  },
  {
    question: 'Can institutions trust a shared credential?',
    answer:
      'Yes. Every credential is digitally signed by its issuing authority, allowing organisations to verify authenticity instantly without contacting the issuer.',
  },
  {
    question: 'What happens if I lose my device?',
    answer:
      'You can revoke trusted devices from your account and sign in on a new device after completing identity verification.',
  },
  {
    question: 'What is selective disclosure?',
    answer:
      'Selective disclosure lets you share only the specific pieces of information requested, such as your age or student status, instead of revealing your entire credential.',
  },
  {
    question: 'Can I use FlashID offline?',
    answer:
      'Some credentials can be viewed offline, but internet access is required when verifying credentials or receiving new ones from issuing authorities.',
  },
  {
    question: 'Which credentials can I store?',
    answer:
      'FlashID can store government-issued identity documents as well as credentials issued by trusted organisations, such as universities or other authorised institutions.',
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
    question: 'How do I update my email address?',
    answer:
      'Navigate to the Manage Account page, enter your new email address, and verify it using the confirmation process.',
  },
  {
    question: 'What happens if a credential expires?',
    answer:
      'Expired credentials remain visible for your records but cannot be used for verification until a new valid credential is issued.',
  },
  {
    question: 'Who can see my personal information?',
    answer:
      'Only you control who can access your credentials. No information is shared unless you explicitly approve a verification request.',
  },
  {
    question: 'Is FlashID accessible?',
    answer:
      'Yes. FlashID is designed to meet WCAG 2.2 AA accessibility guidelines, supporting keyboard navigation, screen readers, sufficient colour contrast, and reduced-motion preferences.',
  },
  {
    question: 'How do I know if a credential is genuine?',
    answer:
      'Every credential includes a cryptographic digital signature that can be verified instantly to confirm it has not been altered.',
  },
  {
    question: 'What should I do if I forget my password?',
    answer:
      'Use the "Forgot Password" option on the login page to receive a secure password reset link sent to your registered email address.',
  },
  {
    question: 'Does FlashID replace my physical ID?',
    answer:
      'FlashID provides a secure digital version of supported credentials, but physical documents may still be required in situations where digital credentials are not yet accepted.',
  },
]

export function HelpMenuSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(5)

  return (
    <section id="help" className="py-12 sm:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <HelpCircle className="h-5 w-5" strokeWidth={2.25} />
            </div>
          </div>

          <Text
            variant="h2"
            as="h2"
            className="mb-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900"
          >
            Need a Hand?
          </Text>

          <p className="text-lg leading-relaxed text-gray-600">
            Find answers to common questions below.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-emerald-600 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <MessageCircleQuestion className="h-5 w-5" strokeWidth={2.25} />
            </div>

            <Text variant="h3">FAQs</Text>
          </div>

          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {FAQS.slice(0, visibleCount).map((faq, index) => {
              const isOpen = openFaqIndex === index

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {faq.question}
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <p className="pb-3 text-sm leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {visibleCount < FAQS.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((count) => Math.min(count + 5, FAQS.length))
                }
                className="rounded-lg border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                Show More
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
