import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'
import { FraudAlertDetails } from '../fraud-alert-details'
import { FraudAlertGuidance } from '../fraud-alert-guidance'
import { FraudAlertSummary } from '../fraud-alert-summary'
import type { FraudAlertModalProps } from './types'

export function FraudAlertModal({
  alert,
  layer,
  actionMessage,
  onClose,
  onOpenGuidance,
  onChangePassword,
  onReviewActivity,
  onReviewTrustedDevices,
  onLogoutOtherDevices,
  onDismiss,
}: FraudAlertModalProps) {
  if (layer === 'summary') {
    return (
      <DashboardModal
        open
        title="Suspicious login activity"
        onClose={onClose}
        showBottomClose={false}
      >
        <div className="space-y-6">
          <FraudAlertSummary alert={alert} />
          <FraudAlertDetails alert={alert} onOpenGuidance={onOpenGuidance} />
        </div>
      </DashboardModal>
    )
  }
  return (
    <DashboardModal
      open
      title="Keep your account secure"
      onClose={onClose}
      showBottomClose={false}
    >
      <FraudAlertGuidance
        actionMessage={actionMessage}
        onChangePassword={onChangePassword}
        onReviewActivity={onReviewActivity}
        onReviewTrustedDevices={onReviewTrustedDevices}
        onLogoutOtherDevices={onLogoutOtherDevices}
        onDismiss={onDismiss}
      />
    </DashboardModal>
  )
}
