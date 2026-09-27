'use client'
import { Car, Download, FileText } from 'lucide-react'
import { Button, StatusPill, Text } from '@/components/atoms'
import type { CredentialResponse } from '@/services/credential-service'
import type { CertifiedCredentialCardProps } from './types'

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
const getReference = (credential: CredentialResponse) =>
  credential.identityDocument?.idNumber ??
  credential.driversLicense?.licenseNumber ??
  'Not available'
const getReferenceLabel = (credential: CredentialResponse) => credential.type === 'DriversLicense' ? 'License number' : 'ID number'
const getExpiryDate = (credential: CredentialResponse) =>
  credential.driversLicense?.expiryDate
    ? formatDate(credential.driversLicense.expiryDate)
    : 'Not provided'

export function CertifiedCredentialCard({
  credential,
  onViewCredential,
  onGenerateCertifiedCopy,
}: Readonly<CertifiedCredentialCardProps>) {
  const Icon = credential.type === 'DriversLicense' ? Car : FileText
  return (
    <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-deep-green/10">
      <div className="flex h-full flex-col rounded-[24px] bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary-green/20 bg-primary-green/10 text-primary-green">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <Text
                as="h2"
                variant="sub-sm"
                className="truncate font-bold text-text-primary"
              >
                {credential.title}
              </Text>
              <Text variant="caption" className="mt-0.5">
                <span aria-hidden="true">🇿🇦</span> South African document
              </Text>
            </div>
          </div>
          <StatusPill intent={credential.status === 'Active' ? 'active' : 'inactive'} className="shrink-0 px-3 py-1 text-xs">
            {credential.status}
          </StatusPill>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border-grey pt-4">
          <div className="min-w-0">
            <Text variant="caption">{getReferenceLabel(credential)}</Text>
            <Text variant="sub-sm" className="mt-1 truncate font-semibold text-deep-green">
              {getReference(credential)}
            </Text>
          </div>
          <div className="min-w-0">
            <Text variant="caption">Issued</Text>
            <Text
              variant="sub-sm"
              className="mt-1 truncate font-semibold text-deep-green"
            >
              {formatDate(credential.issueDate)}
            </Text>
          </div>
          <div className="min-w-0">
            <Text variant="caption">Expires</Text>
            <Text
              variant="sub-sm"
              className="mt-1 truncate font-semibold text-deep-green"
            >
              {getExpiryDate(credential)}
            </Text>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-auto min-w-0 flex-1"
            onClick={() => onViewCredential(credential)}
          >
            View Credential
          </Button>
          <Button
            type="button"
            variant="primary"
            LeftIcon={Download}
            className="w-auto min-w-0 flex-1"
            onClick={() => onGenerateCertifiedCopy(credential)}
          >
            Generate Certified Copy
          </Button>
        </div>
      </div>
    </div>
  )
}