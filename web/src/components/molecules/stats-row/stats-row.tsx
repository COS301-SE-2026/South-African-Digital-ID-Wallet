import { Users, ShieldCheck, PauseCircle, Clock } from 'lucide-react'
import { StatCard } from '../../atoms/stat-card'
import type { StatsRowProps } from './types'

function formatNumber(n: number) {
  return n.toLocaleString('en-ZA')
}

function percentOfTotal(part: number, total: number) {
  if (total === 0) return '0%'
  return `${((part / total) * 100).toFixed(1)}% of total`
}

export function StatsRow({ stats }: Readonly<StatsRowProps>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        tone="neutral"
        label="Total Credentials"
        value={formatNumber(stats.total)}
        subtext="All issued credentials"
      />
      <StatCard
        icon={ShieldCheck}
        tone="green"
        label="Active Credentials"
        value={formatNumber(stats.active)}
        subtext={percentOfTotal(stats.active, stats.total)}
      />
      <StatCard
        icon={PauseCircle}
        tone="gold"
        label="Suspended Credentials"
        value={formatNumber(stats.suspended)}
        subtext={percentOfTotal(stats.suspended, stats.total)}
      />
      <StatCard
        icon={Clock}
        tone="red"
        label="Expiring Soon"
        value={formatNumber(stats.expiringSoon)}
        subtext="Next 30 days"
      />
    </div>
  )
}
