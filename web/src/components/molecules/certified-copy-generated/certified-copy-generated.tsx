import { ArrowLeft, Check, Download, ExternalLink, Mail } from 'lucide-react'
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6 sm:px-6"
      aria-modal="true"
      aria-label="Certified copy generated"
    >
      <div className="max-h-[calc(100dvh-3rem)] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border-grey bg-clean-white p-5 shadow-xl sm:p-6">
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

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="overflow-hidden rounded-xl border border-border-grey bg-soft-grey">
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              title="Certified copy preview"
              className="h-[65vh] min-h-[500px] w-full"
            />
          </div>

          <div className="flex flex-col">
            <Text as="h3" variant="h4" className="mb-1 text-text-primary">
              Certified Copy
            </Text>

            <Text variant="caption">
              Preview your document before downloading it.
            </Text>

            <div className="mt-5  space-y-3">
              <a href={pdfUrl} download={fileName} className="block">
                <Button
                  type="button"
                  variant="primary"
                  className="!w-full"
                  LeftIcon={Download}
                >
                  Download PDF
                </Button>
              </a>

              <Button
                type="button"
                variant="secondary"
                LeftIcon={ExternalLink}
                onClick={handleViewInNewTab}
                className="!w-full justify-center"
              >
                View in New Tab
              </Button>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              LeftIcon={ArrowLeft}
              className="mt-5 !w-full justify-center border border-border-grey text-sm font-semibold text-deep-green hover:border-deep-green hover:bg-primary-green/5 lg:mt-auto"
            >
              Back to My Credentials
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
