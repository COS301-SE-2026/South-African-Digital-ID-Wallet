'use client'
import { FileText, Info, User as UserIcon } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { StatusPill } from '@/components/atoms/status-pill'
import { Modal } from '@/components/atoms/modal'
import type { GovAdminAuditLogDetailsPanelProps } from './types'

function DetailRow({
  label,
  value,
}: Readonly<{ label: string; value: React.ReactNode }>) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-center justify-between py-2">
      <Text as="span" variant="sub-sm" className="!text-xs text-muted-text">
        {label}
      </Text>
      <Text
        as="span"
        variant="sub-sm"
        className="!text-xs font-semibold text-deep-green"
      >
        {value}
      </Text>
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  children,
}: Readonly<{ icon: typeof Info; children: React.ReactNode }>) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <Icon className="h-4 w-4 text-deep-green" />
      <Text
        as="span"
        variant="sub-sm"
        className="!text-xs font-bold text-deep-green"
      >
        {children}
      </Text>
    </div>
  )
}

export const GovAdminAuditLogDetailsPanel = ({
  row,
  isOpen,
  onClose,
}: Readonly<GovAdminAuditLogDetailsPanelProps>) => {
  if (!row) {
    return null
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      dataCy="audit-log-details-modal"
      className="!max-w-lg"
    >
      <div className="flex max-h-[95vh] flex-col overflow-y-auto p-6">
        <Text
          as="h2"
          variant="sub-sm"
          className="mb-4 text-xl font-bold text-deep-green"
        >
          Audit Log Details
        </Text>
        <div className="space-y-6">
          <section>
            <SectionHeading icon={FileText}>Overview</SectionHeading>
            <div className="divide-y divide-border">
              <DetailRow label="Action" value={row.action} />
              <DetailRow label="Entity" value={row.entityType} />
              <DetailRow label="Entity ID" value={row.entityId} />
              <DetailRow
                label="Status"
                value={
                  <StatusPill
                    intent={row.outcome === 'Success' ? 'active' : 'danger'}
                  >
                    {row.outcome}
                  </StatusPill>
                }
              />
              <DetailRow label="Description" value={row.description} />
            </div>
          </section>
          <section>
            <SectionHeading icon={UserIcon}>User Information</SectionHeading>
            <div className="divide-y divide-border">
              <DetailRow label="User" value={row.userName} />
              <DetailRow label="Role" value={row.role} />
            </div>
          </section>
        </div>
      </div>
    </Modal>
  )
}
