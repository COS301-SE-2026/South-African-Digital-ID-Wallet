import { Check, User } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { Modal } from '@/components/atoms/modal/modal'
import type { VerificationSuccessProps } from './types'

export const VerificationSuccess = ({
  isOpen,
  onClose,
  onContinue,
  fullName,
  maskedId,
  verifiedAt,
  verificationMethod,
}: VerificationSuccessProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-md">
      <div className="flex flex-col items-center px-8 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <Text
          as="h1"
          variant="h3"
          className="mt-4 !text-2xl font-extrabold text-text-primary"
        >
          Identity Verified
        </Text>
        <Text as="p" variant="sub-sm" className="mt-1 !text-sm text-muted-text">
          Your identity has been successfully verified with FlashID.
        </Text>

        <div className="mt-6 w-full rounded-[18px] bg-black/[0.03] p-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
              <User className="h-4 w-4" />
            </div>
            <div>
              <Text
                as="p"
                variant="sub-sm"
                className="!text-sm font-bold text-text-primary"
              >
                {fullName}
              </Text>
              <Text
                as="p"
                variant="sub-sm"
                className="!text-xs text-muted-text"
              >
                ID {maskedId}
              </Text>
            </div>
          </div>
          <div className="mt-4 h-px w-full bg-black/10" />
          <div className="mt-4 flex items-center gap-1.5">
            <Check className="h-4 w-4 text-primary-green" />
            <Text
              as="span"
              variant="sub-sm"
              className="!text-sm font-semibold text-primary-green"
            >
              Verified
            </Text>
          </div>
          <Text
            as="p"
            variant="sub-sm"
            className="mt-0.5 !text-xs text-muted-text"
          >
            {verifiedAt}
          </Text>
          <Text
            as="p"
            variant="sub-sm"
            className="mt-4 !text-xs text-muted-text"
          >
            Verification method
          </Text>
          <Text
            as="p"
            variant="sub-sm"
            className="!text-sm font-semibold text-text-primary"
          >
            {verificationMethod}
          </Text>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="mt-6 w-full rounded-full bg-deep-green py-3 text-sm font-semibold text-clean-white transition-opacity hover:opacity-90"
        >
          Continue to Credentials
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-sm font-medium text-muted-text hover:text-text-primary"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
