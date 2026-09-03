import {
  BadgeCheck,
  Building2,
  Eye,
  IdCard,
  LogIn,
  LogOut,
  RefreshCw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  SquarePen,
  Trash2,
  UserPlus,
} from 'lucide-react-native'

import {
  formatActivityDay,
  formatActivityTime,
  formatActivityTimestamp,
  formatIdDate,
  formatSaId,
  saIdToDateOfBirth,
  isSameDay,
} from '@/lib/format-date'
import { toneForIndex, type CredentialTone } from '@/theme/credential-tones'

import { OFFICIAL_ACTIVITY_LIMIT } from './citizen-dashboard-urls'
import type {
  ActivityEntry,
  ActivityFilter,
  ActivityGroup,
  ActivityPresentation,
  ActivityRange,
  ActivityResponse,
  CredentialField,
  CredentialResponse,
  IdentityStatusSummary,
  OfficialActivityResponse,
  WalletCredential,
  OfficialStats,
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
  accountdeleted: {
    category: 'other',
    Icon: Trash2,
    title: 'Account deleted',
    tone: 'soft-red',
  },
  auditlogviewed: {
    category: 'other',
    Icon: Eye,
    title: 'Audit log viewed',
    tone: 'neutral',
  },
  citizencredentialsactivated: {
    category: 'other',
    Icon: ShieldCheck,
    title: 'Credentials activated',
    tone: 'soft-green',
  },
  citizencredentialsdeactivated: {
    category: 'other',
    Icon: ShieldAlert,
    title: 'Credentials deactivated',
    tone: 'soft-amber',
  },
  citizencredentialsupdated: {
    category: 'other',
    Icon: RefreshCw,
    title: 'Credentials updated',
    tone: 'soft-green',
  },
  citizenstatusviewed: {
    category: 'verification',
    Icon: Eye,
    title: 'Identity checked',
    tone: 'soft-blue',
  },
  citizenverificationfailed: {
    category: 'verification',
    Icon: ShieldAlert,
    title: 'Identity verification failed',
    tone: 'soft-red',
  },
  citizenverified: {
    category: 'verification',
    Icon: ShieldCheck,
    title: 'Identity verified',
    tone: 'soft-green',
  },
  consentrecorded: {
    category: 'share',
    Icon: Share2,
    title: 'Consent recorded',
    tone: 'soft-blue',
  },
  credentialexpired: {
    category: 'other',
    Icon: ShieldAlert,
    title: 'Credential expired',
    tone: 'soft-amber',
  },
  credentialissued: {
    category: 'other',
    Icon: IdCard,
    title: 'Credential issued',
    tone: 'soft-green',
  },
  credentialreinstated: {
    category: 'other',
    Icon: ShieldCheck,
    title: 'Credential reinstated',
    tone: 'soft-green',
  },
  credentialrevoked: {
    category: 'other',
    Icon: ShieldAlert,
    title: 'Credential revoked',
    tone: 'soft-red',
  },
  credentialverified: {
    category: 'verification',
    Icon: ShieldCheck,
    title: 'Credential verified',
    tone: 'soft-green',
  },
  deviceverificationfailed: {
    category: 'login',
    Icon: ShieldAlert,
    title: 'Device verification failed',
    tone: 'soft-red',
  },
  deviceverificationrequested: {
    category: 'login',
    Icon: ShieldQuestion,
    title: 'Device verification requested',
    tone: 'soft-amber',
  },
  deviceverified: {
    category: 'login',
    Icon: ShieldCheck,
    title: 'Device verified',
    tone: 'soft-green',
  },
  emailaddresschanged: {
    category: 'other',
    Icon: SquarePen,
    title: 'Profile updated',
    tone: 'soft-amber',
  },
  failedloginattempt: {
    category: 'login',
    Icon: ShieldAlert,
    title: 'Failed login attempt',
    tone: 'soft-red',
  },
  institutionregistered: {
    category: 'other',
    Icon: Building2,
    title: 'Institution registered',
    tone: 'soft-green',
  },
  officialverified: {
    category: 'verification',
    Icon: BadgeCheck,
    title: 'Official verified',
    tone: 'soft-green',
  },
  onboardcitizen: {
    category: 'other',
    Icon: UserPlus,
    title: 'Citizen onboarded',
    tone: 'soft-green',
  },
  onboardcitizenfailed: {
    category: 'other',
    Icon: ShieldAlert,
    title: 'Citizen onboarding failed',
    tone: 'soft-red',
  },
  userloggedin: {
    category: 'login',
    Icon: LogIn,
    title: 'Logged in',
    tone: 'soft-green',
  },
  userloggedout: {
    category: 'login',
    Icon: LogOut,
    title: 'Logged out',
    tone: 'soft-green',
  },
  userregistered: {
    category: 'other',
    Icon: UserPlus,
    title: 'Account created',
    tone: 'soft-green',
  },
}

const FALLBACK: ActivityPresentation = {
  category: 'other',
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
      category: presentation.category,
      description: item.title ?? '',
      id: item.id,
      Icon: presentation.Icon,
      occurredAt: item.timestamp,
      time: formatActivityTime(item.timestamp),
      timestamp: formatActivityTimestamp(item.timestamp, now),
      title: presentation.title,
      tone: presentation.tone,
    }
  })

const DAY_MS = 86_400_000

const RANGE_DAYS: Record<ActivityRange, number | null> = {
  all: null,
  '7d': 7,
  '30d': 30,
}

export const filterActivityEntries = (
  entries: ActivityEntry[],
  filter: ActivityFilter,
  now: Date = new Date()
): ActivityEntry[] => {
  const days = RANGE_DAYS[filter.range]
  const cutoff = days === null ? null : now.getTime() - days * DAY_MS
  return entries.filter((entry) => {
    if (filter.category !== 'all' && entry.category !== filter.category) {
      return false
    }
    if (cutoff === null) {
      return true
    }
    const occurred = new Date(entry.occurredAt).getTime()
    return Number.isNaN(occurred) ? false : occurred >= cutoff
  })
}

export const groupActivityEntries = (
  entries: ActivityEntry[],
  now?: Date
): ActivityGroup[] =>
  entries.reduce<ActivityGroup[]>((groups, entry) => {
    const label = formatActivityDay(entry.occurredAt, now)
    const current = groups[groups.length - 1]
    if (current && current.label === label) {
      current.entries.push(entry)
      return groups
    }
    return [...groups, { entries: [entry], label }]
  }, [])

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

export const officialActivityToResponse = (
  data: OfficialActivityResponse | undefined
): ActivityResponse[] =>
  (data?.items ?? []).map((item) => ({
    id: item.id,
    timestamp: item.createdAt,
    title: item.details,
    type: item.eventType,
  }))

export const toOfficialStats = (
  activity: ActivityResponse[] | undefined,
  now: Date = new Date()
): OfficialStats => {
  const items = activity ?? []
  const today = items.filter((item) => isSameDay(item.timestamp, now))
  const verifications = today.filter(
    (item) =>
      (ACTIVITY_PRESENTATION[normalize(item.type)] ?? FALLBACK).category ===
      'verification'
  )
  return {
    isCapped: items.length >= OFFICIAL_ACTIVITY_LIMIT,
    todayCount: verifications.length,
  }
}
