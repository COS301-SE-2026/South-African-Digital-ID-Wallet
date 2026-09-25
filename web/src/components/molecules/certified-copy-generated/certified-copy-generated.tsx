import { Check, FileText, QrCode } from 'lucide-react'
import { Text } from '@/components/atoms'
import type { CertifiedCopyGeneratedProps } from './types'

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

const getReference = (
  credential: CertifiedCopyGeneratedProps['credential']
) =>
  credential.identityDocument?.idNumber ??
  credential.driversLicense?.licenseNumber ??
  credential.id
export function CertifiedCopyGenerated({
  credential,
  generatedAt,
}: Readonly<CertifiedCopyGeneratedProps>) {
  const reference = getReference(credential)
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-start gap-3">
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
      <div className="rounded-2xl border border-border-grey bg-[#ecebe6] p-4 shadow-inner sm:p-6">
        <div className="mx-auto max-w-[430px] rounded-lg border border-deep-green/40 bg-clean-white p-4 shadow-lg sm:p-5">
          <div className="flex items-center justify-between border-b border-border-grey pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-deep-green text-clean-white">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <Text variant="caption" className="font-bold text-deep-green">
                  FlashID
                </Text>
                <Text variant="caption" className="block text-[9px]">
                  Secure. Verify. Trust.
                </Text>
              </div>
            </div>
            <Text variant="caption" className="font-bold text-deep-green">
              CERTIFIED COPY
            </Text>
          </div>
          <div className="mt-5 flex items-start justify-between gap-5">
            <div className="min-w-0">
              <Text variant="caption" className="font-bold text-deep-green">
                {credential.title}
              </Text>
              <div className="mt-4 space-y-3">
                <div>
                  <Text variant="caption">Reference</Text>
                  <Text
                    variant="sub-sm"
                    className="font-semibold text-deep-green"
                  >
                    {reference}
                  </Text>
                </div>
                <div>
                  <Text variant="caption">Issued by</Text>
                  <Text
                    variant="sub-sm"
                    className="font-semibold text-deep-green"
                  >
                    {credential.issuedBy}
                  </Text>
                </div>
                <div>
                  <Text variant="caption">Generated</Text>
                  <Text
                    variant="sub-sm"
                    className="font-semibold text-deep-green"
                  >
                    {formatDateTime(generatedAt)}
                  </Text>
                </div>
              </div>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center border-4 border-deep-green p-1 text-deep-green">
              <QrCode className="h-full w-full" />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border-grey pt-3">
            <Text variant="caption" className="text-[9px]">
              Scan to verify at flashid.co/verify
            </Text>

            <span className="h-5 w-5 rounded-full border-2 border-deep-green" />
          </div>
        </div>
      </div>
    </div>
  )
}