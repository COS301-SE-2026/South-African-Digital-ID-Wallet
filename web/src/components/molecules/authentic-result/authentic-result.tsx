import {
  Check,
  FileText,
  ShieldCheck,
} from 'lucide-react'
import { Text } from '@/components/atoms'
import { VerificationCheck } from '../verification-check'
import type { AuthenticResultProps } from './types'

export function AuthenticResult({
  onViewCredentialDetails,
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
            <Text
              as="h2"
              variant="h4"
              className="text-deep-green"
            >
              Document Authentic
            </Text>
            <Text variant="caption" className="mt-1">
              This certified copy is valid and unchanged.
            </Text>
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-4 rounded-2xl border border-border-grey bg-clean-white p-5">
        <VerificationCheck
          title="Certification record"
          status="Valid"
          description="Found in FlashID"
        />
        <VerificationCheck
          title="Document integrity"
          status="Valid"
          description="Exact match to the original PDF"
        />
        <VerificationCheck
          title="Source credential"
          status="Active"
          description="Credential is current and valid"
        />
      </div>
      <div className="mt-5 rounded-2xl border border-border-grey bg-clean-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-green/10 text-primary-green">
            <FileText className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <Text
              variant="sub-sm"
              className="font-bold text-deep-green"
            >
              South African Identity Document
            </Text>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <DetailRow
                label="Issued to"
                value="Verified citizen"
              />
              <DetailRow
                label="ID Number"
                value="••••••••••••"
              />
              <DetailRow
                label="Generated"
                value="16 May 2025 · 10:24"
              />
              <DetailRow
                label="Certification ID"
                value="FC-8F42A91C-37D-4E2F"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={onViewCredentialDetails}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-deep-green px-5 text-sm font-semibold text-clean-white transition-colors hover:bg-primary-green"
        >
          <ShieldCheck className="h-4 w-4" />
          View Credential Details
        </button>
        <button
          type="button"
          onClick={onVerifyAnotherDocument}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-deep-green px-5 text-sm font-semibold text-deep-green transition-colors hover:bg-primary-green/5"
        >
          Verify Another Document
        </button>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <Text variant="caption">{label}</Text>
      <Text
        variant="sub-sm"
        className="font-semibold text-deep-green"
      >
        {value}
      </Text>
    </div>
  )
}