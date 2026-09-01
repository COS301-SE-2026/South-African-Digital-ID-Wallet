import {
  IdCard,
  LogIn,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'
import { formatActivityTimestamp } from '@/lib/format-date'

import type {
  ActivityEntry,
  ActivityResponse,
  CredentialResponse,
  IdentityStatusSummary,
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

type ActivityPresentation = {
  Icon: LucideIcon
  title: string
  tone: IconTileTone
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
