'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { CaptureContactDetailsProps } from './types'

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
  sendActivationCode,
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
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+27..."
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="citizen@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border p-4">
          <input
            type="checkbox"
            checked={contactDetailsConsent}
            onChange={(event) => setContactConsent(event.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">
            Citizen has provided explicit consent to create a FlashID account
            and receive an activation code.
          </span>
        </label>

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
