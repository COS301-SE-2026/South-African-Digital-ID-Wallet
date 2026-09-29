'use client'
import { useState } from 'react'
import {
  Building2,
  ChevronDown,
  IdCard,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { Sparkline } from '@/components/atoms/sparkline/sparkline'
import type { AnalyticsOverviewProps, AnalyticsRange } from './types'

const RANGE_LABELS: Record<AnalyticsRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

const METRICS = [
  {
    key: 'verifications',
    label: 'Verifications',
    icon: ShieldCheck,
    color: '#1a7a3c',
  },
  {
    key: 'credentialsIssued',
    label: 'Credentials Issued',
    icon: IdCard,
    color: '#2563eb',
  },
  {
    key: 'activeOfficials',
    label: 'Active Officials',
    icon: Users,
    color: '#7c3aed',
  },
  {
    key: 'activeInstitutions',
    label: 'Active Institutions',
    icon: Building2,
    color: '#d97706',
  },
] as const

export const AnalyticsOverview = ({
  data,
  range,
  onRangeChange,
  isLoading,
}: AnalyticsOverviewProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="rounded-[24px] bg-card p-6">
        <div className="flex items-center justify-between">
          <Text
            as="h2"
            variant="h4"
            className="!text-lg font-extrabold text-deep-green"
          >
            Analytics Overview
          </Text>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-text-primary"
            >
              {RANGE_LABELS[range]}
              <ChevronDown className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-black/10 bg-card shadow-lg">
                {(Object.keys(RANGE_LABELS) as AnalyticsRange[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onRangeChange(key)
                      setMenuOpen(false)
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-black/5"
                  >
                    {RANGE_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map(({ key, label, icon: Icon, color }) => {
            const metric = data?.[key]
            const isUp = (metric?.changePct ?? 0) >= 0
            return (
              <div key={key} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}1A`, color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <Text
                    as="p"
                    variant="sub-sm"
                    className="!text-sm text-muted-text"
                  >
                    {label}
                  </Text>
                </div>
                <Text
                  as="p"
                  variant="h3"
                  className="!text-2xl font-extrabold text-text-primary"
                >
                  {isLoading || !metric
                    ? '—'
                    : metric.value.toLocaleString('en-ZA')}
                </Text>
                {metric && (
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {isUp ? (
                      <TrendingUp className="h-3.5 w-3.5 text-primary-green" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-national-red" />
                    )}
                    <span
                      className={
                        isUp ? 'text-primary-green' : 'text-national-red'
                      }
                    >
                      {Math.abs(metric.changePct)}% from last{' '}
                      {data?.rangeDays ?? ''} days
                    </span>
                  </div>
                )}
                <Sparkline data={metric?.series ?? []} color={color} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
