'use client'
import { useState } from 'react'
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { Button } from '@/components/ui/button'
import { UpdatePasswordModal } from '@/components/molecules/update-password-modal'
import { FraudAlertModal } from '../fraud-alert-modal'
import type {
  FraudAlertFlowProps,
  SecurityAlertLayer,
} from './types'

export function FraudAlertFlow({ alert }: FraudAlertFlowProps) {
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

  return (
    <>
      <section aria-label="Security alert" className="rounded-[26px] border-2 border-danger-red bg-danger-red/10 p-[2px]">
        <div className="rounded-[24px] bg-card p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-red text-clean-white">
              <AlertTriangle className="hidden h-5 w-5 shrink-0  sm:block" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Text as="h2" variant="h4" className="text-danger-red">
                  Suspicious activity detected
                </Text>
                <Text as="span" variant="caption" className="rounded-full bg-danger-red/10 px-2.5 py-1 font-bold uppercase tracking-wide text-danger-red">
                  High risk
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
          onViewDetails={() => {
            setActionMessage('')
            setLayer('details')
          }}
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
          onUnavailableAction={(message) => {
            setActionMessage(message)
          }}
        />
      )}

      <UpdatePasswordModal
        open={passwordOpen}
        onCloseAction={() => setPasswordOpen(false)}
      />
    </>
  )
}