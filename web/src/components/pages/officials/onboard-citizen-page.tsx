'use client'

import { useState } from 'react'
import {
  Search,
  CheckCircle2,
  Send,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

type IdentityRecord = {
  idNumber: string
  fullName: string
  dateOfBirth: string
  status: 'Verified' | 'Not Found'
}

export default function OnboardCitizenPage() {
  const [idNumber, setIdNumber] = useState('')
  const [record, setRecord] = useState<IdentityRecord | null>(null)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [idConsent, setConsent] = useState(false)
  const [contactDetailsConsent, setContactConsent] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [activationSent, setActivationSent] = useState(false)
  const [registrationMethod, setRegistrationMethod] = useState<
    'activation' | 'physical' | null
  >(null)

  {
    /* TODO: Retrieve actual record !!!!*/
  }

  function retrieveIdentityRecord() {
    setRecord({
      idNumber,
      fullName: 'Thando Mokoena',
      dateOfBirth: '1998-04-12',
      status: 'Verified',
    })
  }

  function createPendingAccount() {
    setAccountCreated(true)
  }

  function sendActivationCode() {
    setActivationSent(true)
  }

  return (
    <main className="min-h-full bg-background p-6 pb-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <p className="font-medium ">Retrieve Identity Record</p>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="idNumber"> Citizen ID Number </Label>

                <Input
                  id="idNumber"
                  placeholder="Enter South African ID number"
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                />

                <label className="flex items-start gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    checked={idConsent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    Citizen has provided explicit consent to retrieve Identity
                    Record.
                  </span>
                </label>

                <Button
                  className="bg-deep-green text-clean-white hover:bg-deep-green/70"
                  onClick={retrieveIdentityRecord}
                  disabled={!idNumber}
                >
                  Retrieve from Government Registry
                </Button>

                {record && (
                  <div className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">
                        Verified Identity Record
                      </h3>
                      <Badge
                        className={
                          record.status === 'Verified'
                            ? 'bg-success-green text-clean-white'
                            : 'bg-danger-red text-clean-white'
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>

                    <div className="grid gap-2 text-sm md:grid-cols-3">
                      <p>
                        <strong>Name:</strong> {record.fullName}
                      </p>
                      <p>
                        <strong>ID:</strong> {record.idNumber}
                      </p>
                      <p>
                        <strong>DOB:</strong> {record.dateOfBirth}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Onboarding Status
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <StatusItem label="Identity record retrieved" done={!!record} />
              <StatusItem
                label="Consent captured"
                done={idConsent && contactDetailsConsent}
              />
              <StatusItem
                label="Contact details captured"
                done={!!phone || !!email}
              />
              <StatusItem
                label="Pending account created"
                done={accountCreated}
              />
              <StatusItem label="Activation code sent" done={activationSent} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {' '}
              <ClipboardCheck className="h-5 w-5" /> Capture Contact
              Details{' '}
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
                Citizen has provided explicit consent to create a FlashID
                account and receive an activation code.
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
            <Button
              className="w-full"
              onClick={sendActivationCode}
              disabled={!accountCreated}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Activation Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Log Preview</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              {accountCreated ? (
                <div className="space-y-2">
                  <p>
                    <strong>Action:</strong> Citizen onboarding initiated
                  </p>
                  <p>
                    <strong>Actor:</strong> Home Affairs Official
                  </p>
                  <p>
                    <strong>Citizen:</strong> {record?.fullName}
                  </p>
                  <p>
                    <strong>Status:</strong> Pending activation
                  </p>
                  <p>
                    <strong>Timestamp:</strong> {new Date().toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Audit log will appear once a pending FlashID account is
                  created.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

type StatusItemProps = {
  label: string
  done: boolean
}

function StatusItem({ label, done }: Readonly<StatusItemProps>) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        className={`h-4 w-4 ${done ? 'text-success-green' : 'text-muted-text'}`}
      />

      <span
        className={`text-sm ${
          done ? 'font-semibold text-text-primary' : 'text-muted-text'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
