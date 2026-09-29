'use client'

import { useState } from 'react'
import {
  ArrowRight,
  History,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/molecules/text-field/text-field'
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
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-auto w-full justify-start gap-3 whitespace-normal rounded-2xl border border-primary-green/10 bg-primary-green/5 p-4 text-left transition hover:bg-primary-green/10"
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
    </Button>
  )
}
type PasswordAction = 'logout' | 'dismiss' | null
export function FraudAlertGuidance({
  actionMessage,
  onChangePassword,
  onReviewActivity,
  onReviewTrustedDevices,
  onLogoutOtherDevices,
  onDismiss,
}: FraudAlertGuidanceProps) {
  const [passwordAction, setPasswordAction] = useState<PasswordAction>(null)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const closePasswordPrompt = () => {
    setPasswordAction(null)
    setPassword('')
    setSubmitting(false)
  }
  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    if (!password.trim()) {
      return
    }
    setSubmitting(true)
    const succeeded =
      passwordAction === 'logout'
        ? await onLogoutOtherDevices(password)
        : await onDismiss(password)
    setSubmitting(false)
    if (succeeded) {
      closePasswordPrompt()
    }
  }
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
          <Text as="p" variant="sub-sm" className="mt-1">
            Here are some steps you can take to help protect your
            account.
          </Text>
        </div>
      </div>
      {actionMessage && (
        <div
          role="status"
          className="rounded-2xl border border-accent-gold/30 bg-accent-gold/10 p-4"
        >
          <Text as="p" variant="sub-sm" className="text-text-primary">
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
      </div>
      <div className="rounded-2xl bg-primary-green/10 p-4">
        <Text
          as="p"
          variant="sub-sm"
          className="font-bold text-deep-green"
        >
          Need more help?
        </Text>
        <Text as="p" variant="sub-sm" className="mt-1">
          If you are still unsure or notice anything suspicious,
          contact the support team.
        </Text>
      </div>
      <Button
        type="button"
        variant="destructive"
        className="w-full"
        onClick={() => setPasswordAction('logout')}
      >
        Log out from all other devices
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setPasswordAction('dismiss')}
      >
        Dismiss security alert
      </Button>
      {passwordAction && (
        <div className="rounded-2xl border border-border-grey p-4">
          <Text
            as="p"
            variant="sub-sm"
            className="font-bold text-deep-green"
          >
            {passwordAction === 'logout'
              ? 'Confirm logout from other devices'
              : 'Confirm dismissing this alert'}
          </Text>
          <Text as="p" variant="caption" className="mt-1">
            Enter your current password to continue.
          </Text>
          <form
            className="mt-4 space-y-4"
            onSubmit={handlePasswordSubmit}
          >
            <TextField
              label="Current password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className="flex gap-3">
              <Button
                type="submit"
                variant={
                  passwordAction === 'logout'
                    ? 'destructive'
                    : 'default'
                }
                disabled={submitting || !password.trim()}
              >
                {submitting ? 'Processing...' : 'Confirm'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={closePasswordPrompt}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}