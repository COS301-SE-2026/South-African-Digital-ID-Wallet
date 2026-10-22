import { Check, FileText } from 'lucide-react'
import { Button, Text } from '@/components/atoms'
import type { AuthenticResultProps } from './types'

const formatCredentialType = (credentialType?: string | null) => {
  switch (credentialType) {
    case 'IdentityDocument':
      return 'South African Identity Document'
    case 'DriversLicense':
      return "South African Driver's Licence"
    default:
      return credentialType || 'Certified Credential'
  }
}

const maskIdNumber = (idNumber?: string | null) => {
  if (!idNumber) return 'Not available'

  return `${'*'.repeat(Math.max(idNumber.length - 2, 0))}${idNumber.slice(-2)}`
}

const formatDateTime = (date?: string | null) => {
  if (!date) return 'Not available'

  return new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function AuthenticResult({
  result,
  onVerifyAnotherDocument,
}: Readonly<AuthenticResultProps>) {
  return (
    <div className="flex w-full max-w-xl flex-col">
      <div className="rounded-2xl bg-success-green/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-green text-clean-white">
            <Check className="h-5 w-5" strokeWidth={3} />
          </div>
          <div>
            <Text as="h2" variant="h4" className="text-deep-green">
              Document Authentic
            </Text>
            <Text variant="caption" className="mt-1">
              This certified copy is valid and unchanged.
            </Text>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border-grey bg-clean-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-green/10 text-primary-green">
            <FileText className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <Text variant="sub-sm" className="font-bold text-deep-green">
              {formatCredentialType(result.credentialType)}
            </Text>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow label="Issued to" value={result.fullName} />

              <DetailRow
                label="ID Number"
                value={maskIdNumber(result.idNumber)}
                valueClassName="font-mono tracking-[0.08em]"
              />

              <DetailRow
                label="Generated"
                value={formatDateTime(result.generatedAt)}
              />

              <DetailRow
                label="Certification ID"
                value={result.certificationId}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <Button
          type="button"
          variant="secondary"
          onClick={onVerifyAnotherDocument}
          className="!h-11 !w-full rounded-xl px-5"
        >
          Verify Another Document
        </Button>
      </div>
    </div>
  )
}
function DetailRow({
  label,
  value,
  valueClassName = '',
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div>
      <Text variant="caption">{label}</Text>
      <Text
        variant="sub-sm"
        className={`font-semibold text-deep-green ${valueClassName}`}
      >
        {value}
      </Text>
    </div>
  )
}
