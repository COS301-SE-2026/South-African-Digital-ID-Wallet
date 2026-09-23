import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'

import { Text } from '@/components/atoms/text'

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
      </div>
    </div>
  )
}