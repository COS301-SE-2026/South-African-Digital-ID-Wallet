import { useMemo } from 'react'
import { Users, ShieldCheck, PauseCircle, Clock } from 'lucide-react'
import { StatCard } from '@/components/atoms/stat-card'
import type { CredentialStatsFilterProps, CredentialFilter } from './types'
const DEFAULT_EXPIRING_SOON_DAYS = 30

function isExpiringSoon(expiresOn: string, withinDays: number): boolean {
  const daysUntilExpiry =
    (new Date(expiresOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return daysUntilExpiry >= 0 && daysUntilExpiry <= withinDays
}

export function CredentialStatsFilter({
  rows,
  value,
  onChange,
  expiringSoonDays = DEFAULT_EXPIRING_SOON_DAYS,
}: Readonly<CredentialStatsFilterProps>) {
  const stats = useMemo(() => {
    const total = rows.length
    const active = rows.filter((r) => r.status === 'active').length
    const suspended = rows.filter((r) => r.status === 'suspended').length
    const expiringSoon = rows.filter((r) =>
      isExpiringSoon(r.expiresOn, expiringSoonDays)
    ).length
    return { total, active, suspended, expiringSoon }
  }, [rows, expiringSoonDays])

  const percentOf = (part: number) =>
    stats.total === 0
      ? '0%'
      : `${((part / stats.total) * 100).toFixed(1)}% of total`

  const handleClick = (filter: CredentialFilter) => {
    onChange(value === filter ? 'all' : filter)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        tone="neutral"
        label="Total Credentials"
        value={stats.total.toLocaleString('en-ZA')}
        subtext="All issued credentials"
        isActive={value === 'all'}
        onClick={() => handleClick('all')}
      />
      <StatCard
        icon={ShieldCheck}
        tone="green"
        label="Active Credentials"
        value={stats.active.toLocaleString('en-ZA')}
        subtext={percentOf(stats.active)}
        isActive={value === 'active'}
        onClick={() => handleClick('active')}
      />
      <StatCard
        icon={PauseCircle}
        tone="gold"
        label="Suspended Credentials"
        value={stats.suspended.toLocaleString('en-ZA')}
        subtext={percentOf(stats.suspended)}
        isActive={value === 'suspended'}
        onClick={() => handleClick('suspended')}
      />
      <StatCard
        icon={Clock}
        tone="red"
        label="Expiring Soon"
        value={stats.expiringSoon.toLocaleString('en-ZA')}
        subtext={`Next ${expiringSoonDays} days`}
        isActive={value === 'expiring'}
        onClick={() => handleClick('expiring')}
      />
    </div>
  )
}
