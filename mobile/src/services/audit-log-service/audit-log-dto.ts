import { Eye, ShieldAlert, ShieldCheck } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'
import { formatActivityTime, formatSaId } from '@/lib/format-date'

import type { AuditLogEntry, AuditLogItemResponse } from './types'

type OutcomePresentation = {
  Icon: LucideIcon
  tone: IconTileTone
}

const OUTCOME_PRESENTATION: Record<string, OutcomePresentation> = {
  Access: { Icon: Eye, tone: 'soft-blue' },
  Failed: { Icon: ShieldAlert, tone: 'soft-red' },
  Success: { Icon: ShieldCheck, tone: 'soft-green' },
}

const FALLBACK_PRESENTATION: OutcomePresentation = OUTCOME_PRESENTATION.Success

const UNINFORMATIVE_IPS = ['system', 'unknown', '']

const toIpAddress = (value: string | null): string | null =>
  value !== null && !UNINFORMATIVE_IPS.includes(value.trim().toLowerCase())
    ? value
    : null

export const humanizeAction = (action: string): string => {
  const spaced = (action ?? '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim()
  if (spaced === '') {
    return 'Audit event'
  }
  return `${spaced.charAt(0).toUpperCase()}${spaced.slice(1).toLowerCase()}`
}

export const toAuditLogEntry = (item: AuditLogItemResponse): AuditLogEntry => {
  const presentation =
    OUTCOME_PRESENTATION[item.outcome] ?? FALLBACK_PRESENTATION
  return {
    actor: item.performedBy,
    details: item.details,
    id: item.id,
    Icon: presentation.Icon,
    ipAddress: toIpAddress(item.ipAddress),
    outcome: item.outcome,
    saId: item.citizenSaId ? formatSaId(item.citizenSaId) : null,
    subject: item.citizenName,
    time: formatActivityTime(item.createdAt),
    title: humanizeAction(item.action),
    tone: presentation.tone,
  }
}

export const toAuditLogEntries = (
  items: AuditLogItemResponse[] | undefined
): AuditLogEntry[] => (items ?? []).map(toAuditLogEntry)
