'use client'

import { ScanFace, ShieldCheck, Smartphone, Sun } from 'lucide-react'

import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import { Modal } from '@/components/atoms/modal'

import type { ReadyToVerifyProps } from './types'

function ChecklistItem({
  icon: Icon,
  title,
  description,
}: Readonly<{
  icon: typeof Sun
  title: string
  description: string
}>) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-black/10 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-green/10">
        <Icon className="h-5 w-5 text-deep-green" />
      </div>

      <div>
        <Text
          as="p"
          variant="sub-sm"
          className="!text-sm font-bold text-deep-green"
        >
          {title}
        </Text>

        <Text as="p" variant="sub-sm" className="!text-sm text-muted-text">
          {description}
        </Text>
      </div>
    </div>
  )
}

export const ReadyToVerify = ({
  isOpen,
  onClose,
  onStartVerification,
  onCancel,
  userName,
  userInitials,
}: Readonly<ReadyToVerifyProps>) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      dataCy="ready-to-verify-modal"
      className="!max-w-md !bg-transparent !p-0"
    >
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="rounded-[24px] bg-white">
          <div className="flex flex-col gap-6 p-6">
            {/* Shield */}
            <div className="flex items-center justify-center">
              <ShieldCheck className="h-10 w-10 text-primary-green" />
            </div>

            {/* Heading */}
            <div className="text-center">
              <Text
                as="h2"
                variant="sub-sm"
                className="text-xl font-bold text-deep-green"
              >
                Ready to verify
              </Text>

              <Text
                as="p"
                variant="sub-sm"
                className="mt-2 !text-sm text-muted-text"
              >
                We&apos;ll guide you through a few quick steps.
                <br />
                Make sure:
              </Text>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-3">
              <ChecklistItem
                icon={Sun}
                title="You're in a well-lit area"
                description="Natural light works best."
              />

              <ChecklistItem
                icon={ScanFace}
                title="Your face is clearly visible"
                description="No sunglasses, hats or masks."
              />

              <ChecklistItem
                icon={Smartphone}
                title="You're using the front camera"
                description="Hold your device at eye level."
              />
            </div>
            <Button
              variant="primary"
              className="!flex !h-12 !w-full !max-w-none !items-center !justify-center !bg-deep-green"
              onClick={onStartVerification}
              dataCy="start-verification"
            >
              Start Verification
            </Button>
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-semibold text-deep-green hover:underline"
              data-cy="cancel-verification"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
