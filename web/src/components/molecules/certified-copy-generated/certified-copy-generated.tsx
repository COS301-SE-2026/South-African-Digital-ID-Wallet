import { ArrowLeft, Check, Download, ExternalLink } from 'lucide-react'
import { Button, Text } from '@/components/atoms'
import type { CertifiedCopyGeneratedProps } from './types'

export function CertifiedCopyGenerated({
  pdfUrl,
  fileName,
  onBack,
}: Readonly<CertifiedCopyGeneratedProps>) {
  const handleViewInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }
  return (
    <dialog
      open
      className="fixed inset-0 z-50 m-0 flex min-h-dvh w-screen max-w-none items-center justify-center overflow-hidden bg-black/20 px-3 py-3 sm:px-5 sm:py-4"
      aria-modal="true"
      aria-label="Certified copy generated"
    >
      <div className="w-full max-w-5xl rounded-[18px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="flex h-[calc(100dvh-1.5rem)] max-h-[760px] w-full flex-col overflow-hidden rounded-2xl bg-clean-white p-3 shadow-xl sm:h-[calc(100dvh-2rem)] sm:p-5">
          <div className="mb-3 flex shrink-0 items-start gap-2 sm:mb-4 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-green text-clean-white sm:h-10 sm:w-10">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <Text
                as="h2"
                variant="h4"
                className="text-base text-text-primary sm:text-lg"
              >
                Your Certified Copy is Ready!
              </Text>
              <Text variant="caption" className="mt-0.5">
                Here is your digitally generated and verifiable document.
              </Text>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border-grey bg-soft-grey">
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              title="Certified copy preview"
              className="h-full min-h-0 w-full"
            />
          </div>
          <div className="mt-3 shrink-0 sm:mt-4">
            <Text
              as="h3"
              variant="h4"
              className="text-base text-text-primary sm:text-lg"
            >
              Certified Copy
            </Text>
            <Text variant="caption" className="mt-0.5">
              Preview your document before choosing an action.
            </Text>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              <a
                href={pdfUrl}
                download={fileName}
                className="block w-full"
              >
                <Button
                  type="button"
                  variant="primary"
                  LeftIcon={Download}
                  className="!h-10 !w-full sm:!h-11"
                >
                  Download PDF
                </Button>
              </a>
              <Button
                type="button"
                variant="secondary"
                LeftIcon={ExternalLink}
                onClick={handleViewInNewTab}
                className="!h-10 !w-full justify-center sm:!h-11"
              >
                View in New Tab
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                LeftIcon={ArrowLeft}
                className="!h-10 !w-full justify-center border border-deep-green text-sm font-semibold text-deep-green hover:border-deep-green hover:bg-deep-green sm:!h-11"
              >
                Back to My Credentials
              </Button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
}