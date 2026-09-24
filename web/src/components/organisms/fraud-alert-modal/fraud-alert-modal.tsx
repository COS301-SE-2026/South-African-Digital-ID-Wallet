import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'

import { FraudAlertSummary } from '../fraud-alert-summary'
import { FraudAlertDetails } from '../fraud-alert-details'
import { FraudAlertGuidance } from '../fraud-alert-guidance'

import type { FraudAlertModalProps } from './types'

export function FraudAlertModal({
  alert,
  layer,
  actionMessage,
  onClose,
  onViewDetails,
  onOpenGuidance,
  onChangePassword,
  onReviewActivity,
  onReviewTrustedDevices,
  onUnavailableAction,
}: FraudAlertModalProps) {
  if (layer === 'summary') {
    return (
      <DashboardModal
        open
        title="Suspicious login activity"
        onClose={onClose}
      >
        <FraudAlertSummary
          alert={alert}
          onViewDetails={onViewDetails}
        />
      </DashboardModal>
    )
  }

  if (layer === 'details') {
    return (
      <DashboardModal
        open
        title="Security event details"
        onClose={onClose}
      >
        <FraudAlertDetails
          alert={alert}
          onOpenGuidance={onOpenGuidance}
        />
      </DashboardModal>
    )
  }

  return (
    <DashboardModal
      open
      title="Keep your account secure"
      onClose={onClose}
    >
      <FraudAlertGuidance
        actionMessage={actionMessage}
        onChangePassword={onChangePassword}
        onReviewActivity={onReviewActivity}
        onReviewTrustedDevices={onReviewTrustedDevices}
        onUnavailableAction={onUnavailableAction}
      />
    </DashboardModal>
  )
}