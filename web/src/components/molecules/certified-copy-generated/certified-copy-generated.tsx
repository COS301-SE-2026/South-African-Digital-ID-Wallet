import {
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  Mail,
} from 'lucide-react'
import { Button, Text } from '@/components/atoms'
import type { CertifiedCopyGeneratedProps } from './types'

export function CertifiedCopyGenerated({
  onBack,
}: Readonly<CertifiedCopyGeneratedProps>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Certified copy generated"
    >
      <div className="max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border-grey bg-clean-white p-4 shadow-xl sm:p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-green text-clean-white">
            <Check className="h-5 w-5" strokeWidth={3} />
          </div>
          <div>
            <Text as="h2" variant="h4" className="text-text-primary">
              Your Certified Copy is Ready!
            </Text>
            <Text variant="caption" className="mt-1">
              Here is your digitally generated and verifiable document.
            </Text>
          </div>
        </div>
        <div className="mt-5">
          <Button
            type="button"
            variant="primary"
            className="!w-full"
            LeftIcon={Download}
          >
            Download PDF
          </Button>
        </div>
        <div className="mt-5 border-t border-border-grey pt-4">
          <div className="space-y-2">
            <Button
              type="button"
              variant="secondary"
              LeftIcon={Mail}
              className="!w-full justify-start border-0 bg-transparent px-2 py-1.5 text-left text-sm font-normal text-deep-green hover:bg-deep-green"
            >
              Send to Email
            </Button>
            <Button
              type="button"
              variant="secondary"
              LeftIcon={ExternalLink}
              className="!w-full justify-start border-0 bg-transparent px-2 py-1.5 text-left text-sm font-normal text-deep-green hover:bg-deep-green"
            >
              View in New Tab
            </Button>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          LeftIcon={ArrowLeft}
          className="mt-5 !w-full justify-center border border-border-grey text-sm font-semibold text-deep-green hover:border-deep-green hover:bg-primary-green/5"
        >
          Back to My Credentials
        </Button>
      </div>
    </div>
  )
}