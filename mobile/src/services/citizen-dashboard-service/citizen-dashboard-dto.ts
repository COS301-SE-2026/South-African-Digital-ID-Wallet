import {
  IdCard,
  LogIn,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'
import {
  formatActivityTimestamp,
  formatIdDate,
  formatSaId,
  saIdToDateOfBirth,
} from '@/lib/format-date'
import { toneForIndex, type CredentialTone } from '@/theme/credential-tones'

import type {
  ActivityEntry,
  ActivityResponse,
  CredentialResponse,
  IdentityStatusSummary,
  CredentialField,
  WalletCredential,
  ActivityPresentation,
} from './types'

const IDENTITY_DOCUMENT = 'identitydocument'

const normalize = (value: string | undefined) =>
  (value ?? '').trim().toLowerCase()

const VERIFIED: IdentityStatusSummary = {
  description: 'Your identity is fully verified',
  label: 'Identity Status',
  status: 'verified',
  tone: 'soft-green',
  value: 'Verified',
}

const PENDING: IdentityStatusSummary = {
  description: 'Activate your credentials to finish setup',
  label: 'Identity Status',
  status: 'pending',
  tone: 'soft-amber',
  value: 'Pending',
}

const ATTENTION: IdentityStatusSummary = {
  description: 'We could not confirm your identity documents',
  label: 'Identity Status',
  status: 'attention',
  tone: 'soft-red',
  value: 'Needs attention',
}

const TONE_BY_TYPE: Record<string, CredentialTone> = {
  identitydocument: 'green',
  driverslicense: 'blue',
}

export const toIdentityStatus = (
  credentials: CredentialResponse[] | undefined
): IdentityStatusSummary => {
  const identity = (credentials ?? []).filter(
    (credential) => normalize(credential.type) === IDENTITY_DOCUMENT
  )
  if (identity.length === 0) {
    return ATTENTION
  }
  if (
    identity.some((credential) => normalize(credential.status) === 'active')
  ) {
    return VERIFIED
  }
  if (
    identity.some((credential) =>
      ['revoked', 'expired'].includes(normalize(credential.status))
    )
  ) {
    return ATTENTION
  }
  return PENDING
}

const ACTIVITY_PRESENTATION: Record<string, ActivityPresentation> = {
  userloggedin: { Icon: LogIn, title: 'Logged in', tone: 'soft-green' },
  userloggedout: { Icon: LogIn, title: 'Logged out', tone: 'soft-green' },
  failedloginattempt: {
    Icon: ShieldAlert,
    title: 'Failed login attempt',
    tone: 'soft-red',
  },
  credentialissued: {
    Icon: IdCard,
    title: 'Credential issued',
    tone: 'soft-green',
  },
  credentialverified: {
    Icon: ShieldCheck,
    title: 'Credential verified',
    tone: 'soft-green',
  },
  credentialrevoked: {
    Icon: ShieldAlert,
    title: 'Credential revoked',
    tone: 'soft-red',
  },
  credentialexpired: {
    Icon: ShieldAlert,
    title: 'Credential expired',
    tone: 'soft-amber',
  },
  citizencredentialsactivated: {
    Icon: ShieldCheck,
    title: 'Credentials activated',
    tone: 'soft-green',
  },
  deviceverified: {
    Icon: ShieldCheck,
    title: 'Device verified',
    tone: 'soft-green',
  },
  deviceverificationrequested: {
    Icon: ShieldQuestion,
    title: 'Device verification requested',
    tone: 'soft-amber',
  },
}

const FALLBACK: ActivityPresentation = {
  Icon: ShieldQuestion,
  title: 'Account activity',
  tone: 'neutral',
}

export const toActivityEntries = (
  activity: ActivityResponse[] | undefined,
  now?: Date
): ActivityEntry[] =>
  (activity ?? []).map((item) => {
    const presentation = ACTIVITY_PRESENTATION[normalize(item.type)] ?? FALLBACK
    return {
      description: item.title ?? '',
      id: item.id,
      Icon: presentation.Icon,
      timestamp: formatActivityTimestamp(item.timestamp, now),
      title: presentation.title,
      tone: presentation.tone,
    }
  })

const hasValue = (field: CredentialField) => field.value !== ''

const toFields = (credential: CredentialResponse): CredentialField[] => {
  const identity = credential.identityDocument
  if (identity) {
    return [
      { label: 'ID Number', value: formatSaId(identity.idNumber) },
      { label: 'Date of Birth', value: saIdToDateOfBirth(identity.idNumber) },
      { label: 'Nationality', value: identity.nationality },
      { label: 'Citizenship', value: identity.citizenship },
      { label: 'Country of Birth', value: identity.countryOfBirth },
    ].filter(hasValue)
  }
  const licence = credential.driversLicense
  if (licence) {
    return [
      { label: 'Licence Number', value: licence.licenseNumber },
      { label: 'Licence Code', value: licence.licenseCode },
      { label: 'Restrictions', value: licence.restrictions || 'None' },
      { label: 'Expires', value: formatIdDate(licence.expiryDate) },
    ].filter(hasValue)
  }
  return []
}

export const toWalletCredentials = (
  credentials: CredentialResponse[] | undefined
): WalletCredential[] =>
  (credentials ?? []).map((credential, index) => ({
    fields: toFields(credential),
    id: credential.id,
    isVerified: normalize(credential.status) === 'active',
    issuedBy: credential.issuedBy || 'Republic of South Africa',
    issuedOn: formatIdDate(credential.issueDate),
    status: credential.status,
    title: credential.title,
    tone: TONE_BY_TYPE[normalize(credential.type)] ?? toneForIndex(index),
    type: credential.type,
  }))
