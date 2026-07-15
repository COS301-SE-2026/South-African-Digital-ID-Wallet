'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck, Send, ShieldAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { CaptureContactDetailsProps } from './types'
import { UserRoundPlus } from 'lucide-react'

import toast from 'react-hot-toast'

export const CaptureContactDetails = ({
  record,
  phone,
  setPhone,
  email,
  setEmail,
  contactDetailsConsent,
  setContactConsent,
  idConsent,
  createPendingAccount,
  accountCreated,
  //sendActivationCode,
  errors,
  setErrors,
  onboardResponse,
}: CaptureContactDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {' '}
          <ClipboardCheck className="h-5 w-5" /> Capture Contact Details{' '}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+27..."
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value)

                  setErrors({
                    ...errors,
                    phone: '',
                  })
                }}
              />
            </div>

            {errors.phone && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-danger-red/55 bg-danger-red/5 px-3 py-2">
                <span className="text-danger-red">
                  <ShieldAlert className="h=1 w=1" />
                </span>
                <p className="whitespace-pre-line text-sm font-medium text-danger-red">
                  {errors.phone}
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="citizen@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrors({
                    ...errors,
                    email: '',
                  })
                }}
              />
            </div>

            {errors.email && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-danger-red/55 bg-danger-red/5 px-3 py-2">
                <span className="text-danger-red">
                  <ShieldAlert className="h=1 w=1" />
                </span>
                <p className="text-sm font-medium text-danger-red">
                  {errors.email}
                </p>
              </div>
            )}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border p-4">
          <input
            type="checkbox"
            checked={contactDetailsConsent}
            onChange={(event) => {
              setContactConsent(event.target.checked)
              setErrors({
                ...errors,
                contactDetailsConsent: '',
              })
            }}
            className="mt-1"
          />
          <span className="text-sm">
            Citizen has provided explicit consent to create a FlashID account
            and receive an activation code.
          </span>
        </label>

        {errors.contactDetailsConsent && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-danger-red/55 bg-danger-red/5 px-3 py-2">
            <span className="text-danger-red">
              <ShieldAlert className="h=1 w=1" />
            </span>
            <p className="text-sm font-medium text-danger-red">
              {errors.contactDetailsConsent}
            </p>
          </div>
        )}

        <Button
          className="w-full bg-deep-green text-clean-white hover:bg-deep-green/70"
          onClick={createPendingAccount}
          disabled={
            !record ||
            !idConsent ||
            !contactDetailsConsent ||
            (!phone && !email)
          }
        >
          Create Pending FlashID Account
        </Button>

        {accountCreated && onboardResponse && (
          <div className="rounded-2xl border border-success-green/70 bg-success-green/10 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-15 w-15 items-center justify-center rounded-full bg-success-green/20">
                <span className="text-xl text-success-green/100">
                  <UserRoundPlus className="h=10 w=10" />
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-success-green/100">
                  Citizen onboarded successfully
                </h3>

                <p className="text-sm text-success-green/90">
                  The pending FlashID account has been created.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-text">
                  SA ID
                </p>
                <p className="mt-1 font-medium text-muted-text">
                  {onboardResponse?.saId}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-text">
                  Status
                </p>
                <p className="mt-1 font-medium text-muted-text">
                  {onboardResponse?.status}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-text">
                  Activation PIN
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded-md bg-white px-3 py-2 text-lg font-semibold tracking-widest text-muted-text">
                    {onboardResponse?.activationPin}
                  </code>

                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        onboardResponse?.activationPin ?? ''
                      )

                      toast.success('Activation PIN copied')
                    }}
                    className="rounded-md border border-success-green/50 bg-white px-3 py-2 text-sm font-medium text-success-green/80 hover:bg-success-green/10"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-text">
                  Expires
                </p>

                <p className="mt-1 font-medium text-muted-text">
                  {new Date(
                    onboardResponse?.activationExpiresAt ?? ''
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* <Button
          className="w-full"
          onClick={sendActivationCode}
          disabled={!accountCreated}
        >
          <Send className="mr-2 h-4 w-4" />
          Send Activation Code
        </Button> */}
      </CardContent>
    </Card>
  )
}
