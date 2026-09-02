import { Building2, IdCard, ShieldAlert, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import type { AdminActivityFeedProps } from './types'

const EVENT_CONFIG: Record<string, { icon: LucideIcon; label: string }> = {
  UserRegistered: { icon: User, label: 'New user registered' },
  InstitutionRegistered: { icon: Building2, label: 'Institution registered' },
  OfficialVerified: { icon: User, label: 'Official verified' },
  AccountDeleted: { icon: ShieldAlert, label: 'Account deleted' },
  CredentialIssued: { icon: IdCard, label: 'Credential issued' },
  CredentialRevoked: { icon: IdCard, label: 'Credential revoked' },
  EmailAddressChanged: { icon: User, label: 'Email address changed' },
  FailedLoginAttempt: { icon: ShieldAlert, label: 'Failed login attempt' },
}

const DEFAULT_CONFIG = {
  icon: ShieldAlert,
  label: 'Activity',
}

const formatRelativeTime = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} mins ago`
  const diffHours = Math.round(diffMins / 60)
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
  })
}

export const AdminActivityFeed = ({
  items,
  isLoading,
}: AdminActivityFeedProps) => {
  return (
    <div className="h-full rounded-[24px] border-2 border-black bg-card p-6">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between">
          <Text
            as="h2"
            variant="h4"
            className="!text-lg font-extrabold text-deep-green"
          >
            Activity Feed
          </Text>
        </div>
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Text as="p" variant="sub-sm" className="!text-sm text-muted-text">
              Loading…
            </Text>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Text as="p" variant="sub-sm" className="!text-sm text-muted-text">
              No recent activity.
            </Text>
          </div>
        ) : (
          <div className="mt-2 flex min-h-0 flex-col divide-y divide-black/10 overflow-y-auto max-h-[410px]">
            {items.map((item) => {
              const config = EVENT_CONFIG[item.eventType] ?? DEFAULT_CONFIG
              const Icon = config.icon
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-5 first:pt-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5 text-text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <Text
                        as="p"
                        variant="sub-sm"
                        className="!text-sm font-bold text-text-primary"
                      >
                        {config.label}
                      </Text>
                      <Text
                        as="p"
                        variant="sub-sm"
                        className="mt-0.5 !text-xs text-muted-text truncate"
                      >
                        {item.details}
                      </Text>
                    </div>
                  </div>
                  <Text
                    as="span"
                    variant="caption"
                    className="shrink-0 whitespace-nowrap !text-xs text-muted-text"
                  >
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
