'use client'
import { useState } from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { Button } from '@/components/ui/button'
import { UpdatePasswordModal } from '@/components/molecules/update-password-modal'
import { FraudAlertModal } from '../fraud-alert-modal'
import { fraudDetectionService } from '@/services/fraud-detection-service'
import type {
  FraudAlertFlowProps,
  SecurityAlertLayer,
} from './types'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'We could not complete that security action. Please try again.'
}
export function FraudAlertFlow({
  alert,
  onResolved,
}: FraudAlertFlowProps) {
  const [layer, setLayer] = useState<SecurityAlertLayer | null>(null)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const closeAlert = () => {
    setLayer(null)
    setActionMessage('')
  }
  const scrollToSection = (id: string) => {
    closeAlert()
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 0)
  }
  const handleLogoutOtherDevices = async (
    password: string
  ): Promise<boolean> => {
    try {
      const result = await fraudDetectionService.secureAccount(
        alert.id,
        {
          action: 'LogOutOtherDevices',
          password,
        }
      )
      setActionMessage(
        result.message || 'All other devices have been logged out.'
      )
      await onResolved?.()
      return true
    } catch (error) {
      setActionMessage(getErrorMessage(error))
      return false
    }
  }
  const handleDismiss = async (
    password: string
  ): Promise<boolean> => {
    try {
      await fraudDetectionService.dismissAlert(alert.id, {
        password,
      })
      setActionMessage('The security alert has been dismissed.')
      await onResolved?.()
      return true
    } catch (error) {
      setActionMessage(getErrorMessage(error))
      return false
    }
  }
  return (
    <>
      <section
        aria-label="Security alert"
        className="rounded-[26px] border-2 border-danger-red bg-danger-red/10 p-[2px]"
      >
        <div className="rounded-[24px] bg-card p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-red text-clean-white">
              <AlertTriangle className="h-5 w-5 shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Text
                  as="h2"
                  variant="h4"
                  className="text-danger-red"
                >
                  Suspicious activity detected
                </Text>
                <Text
                  as="span"
                  variant="caption"
                  className={`rounded-full px-2.5 py-1 font-bold uppercase tracking-wide ${
                    alert.severity === 'high'
                      ? 'bg-danger-red/10 text-danger-red'
                      : alert.severity === 'medium'
                        ? 'bg-accent-gold/20 text-deep-green'
                        : 'bg-primary-green/10 text-deep-green'
                  }`}
                >
                  {alert.severity === 'high'
                    ? 'High risk'
                    : alert.severity === 'medium'
                      ? 'Medium risk'
                      : 'Low risk'}
                </Text>
              </div>
              <Text as="p" variant="sub-sm" className="mt-2">
                {alert.summary}
              </Text>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setActionMessage('')
                  setLayer('summary')
                }}
              >
                Review security event
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      {layer && (
        <FraudAlertModal
          alert={alert}
          layer={layer}
          actionMessage={actionMessage}
          onClose={closeAlert}
          onOpenGuidance={() => {
            setActionMessage('')
            setLayer('guidance')
          }}
          onChangePassword={() => {
            closeAlert()
            setPasswordOpen(true)
          }}
          onReviewActivity={() => {
            scrollToSection('activity-overview')
          }}
          onReviewTrustedDevices={() => {
            scrollToSection('trusted-devices-overview')
          }}
          onLogoutOtherDevices={handleLogoutOtherDevices}
          onDismiss={handleDismiss}
        />
      )}
      <UpdatePasswordModal
        open={passwordOpen}
        onCloseAction={() => setPasswordOpen(false)}
        onSuccess={() => {
          void onResolved?.()
        }}
      />
    </>
  )
}