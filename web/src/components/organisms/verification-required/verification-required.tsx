import { Lock } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { Modal } from '@/components/atoms/modal/modal'
import type { VerificationRequiredProps } from './types'

export const VerificationRequired = ({
  isOpen,
  onClose,
  onVerifyIdentity,
  onLearnMore,
}: VerificationRequiredProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-md">
      <div className="flex flex-col items-center px-8 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-national-red/10 text-national-red">
          <Lock className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <Text
          as="h1"
          variant="h3"
          className="mt-4 !text-2xl font-extrabold text-text-primary"
        >
          Identity Verification Required
        </Text>
        <Text as="p" variant="sub-sm" className="mt-1 !text-sm text-muted-text">
          We need to verify that you are the owner of this FlashID account.
        </Text>
        <button
          type="button"
          onClick={onVerifyIdentity}
          className="mt-6 w-full rounded-full bg-national-red py-3 text-sm font-semibold text-clean-white transition-opacity hover:opacity-90"
        >
          Verify Identity
        </button>
        {onLearnMore && (
          <button
            type="button"
            onClick={onLearnMore}
            className="mt-3 text-sm font-medium text-national-blue hover:underline"
          >
            Why do I need to verify?
          </button>
        )}
      </div>
    </Modal>
  )
}
