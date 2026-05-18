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
  const [consent, setConsent] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [activationSent, setActivationSent] = useState(false)
  const [registrationMethod, setRegistrationMethod] = useState<
    'activation' | 'physical' | null
  >(null)

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
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-text" />
                <p className="font-medium text-muted-text">
                  Retrieve Identity Record
                </p>
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

                <Button onClick={retrieveIdentityRecord} disabled={!idNumber}>
                  Retrieve from Government Registry
                </Button>

                {record && (
                  <div className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">
                        Verified Identity Record
                      </h3>
                      <Badge>{record.status}</Badge>
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
        </div>
      </div>
    </main>
  )
}
