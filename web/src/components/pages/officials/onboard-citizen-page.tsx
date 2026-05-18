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

  return <div></div>
}
