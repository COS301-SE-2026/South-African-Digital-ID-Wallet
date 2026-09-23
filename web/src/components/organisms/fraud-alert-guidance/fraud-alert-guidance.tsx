import {
  ArrowRight,
  History,
  Laptop2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { Button } from '@/components/ui/button'
import type {
  FraudAlertGuidanceProps,
  SecurityActionProps,
} from './types'

function SecurityAction({
  icon: Icon,
  title,
  description,
  onClick,
}: SecurityActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-primary-green/10 bg-primary-green/5 p-4 text-left transition hover:bg-primary-green/10"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-green text-clean-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <Text
          as="p"
          variant="sub-sm"
          className="font-bold text-deep-green"
        >
          {title}
        </Text>
        <Text
          as="p"
          variant="caption"
          className="mt-1 leading-5 text-muted-text"
        >
          {description}
        </Text>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-deep-green" />
    </button>
  )
}

export function FraudAlertGuidance({
  actionMessage,
  onChangePassword,
  onReviewActivity,
  onReviewTrustedDevices,
  onUnavailableAction,
}: FraudAlertGuidanceProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-green text-clean-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <Text
            as="p"
            variant="sub-sm"
            className="font-bold text-deep-green"
          >
            We detected unusual activity on your account.
          </Text>
          <Text
            as="p"
            variant="sub-sm"
            className="mt-1"
          >
            Here are some steps you can take to help protect your account.
          </Text>
        </div>
      </div>
      {actionMessage && (
        <div
          role="status"
          className="rounded-2xl border border-accent-gold/30 bg-accent-gold/10 p-4"
        >
          <Text
            as="p"
            variant="sub-sm"
            className="text-text-primary"
          >
            {actionMessage}
          </Text>
        </div>
      )}
      <div className="space-y-3">
        <SecurityAction
          icon={LockKeyhole}
          title="Change your password"
          description="Use a strong, unique password for your account."
          onClick={onChangePassword}
        />
        <SecurityAction
          icon={ShieldCheck}
          title="Enable two-factor authentication"
          description="Add an extra layer of security to your account."
          onClick={() =>
            onUnavailableAction(
              'Two-factor authentication is not available in this frontend demo yet.'
            )
          }
        />
        <SecurityAction
          icon={Smartphone}
          title="Review trusted devices"
          description="Check which devices have access to your account."
          onClick={onReviewTrustedDevices}
        />
        <SecurityAction
          icon={History}
          title="Check recent activity"
          description="Look for any unfamiliar logins or actions."
          onClick={onReviewActivity}
        />
        <SecurityAction
          icon={Laptop2}
          title="Keep your device secure"
          description="Use a PIN, fingerprint or face ID and keep your device updated."
          onClick={() =>
            onUnavailableAction(
              'Device-security guidance is informational only in this frontend demo.'
            )
          }
        />
      </div>
      <div className="rounded-2xl bg-primary-green/10 p-4">
        <Text
          as="p"
          variant="sub-sm"
          className="font-bold text-deep-green"
        >
          Need more help?
        </Text>
        <Text
          as="p"
          variant="sub-sm"
          className="mt-1"
        >
          If you are still unsure or notice anything suspicious, contact the
          support team.
        </Text>
      </div>
      <Button
        type="button"
        variant="destructive"
        className="w-full"
        onClick={() =>
          onUnavailableAction(
            'Logging out from all other devices is not available in this frontend demo yet.'
          )
        }
      >
        Log out from all other devices
      </Button>
    </div>
  )
}