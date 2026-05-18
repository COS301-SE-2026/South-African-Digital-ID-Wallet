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
  return <div></div>
}
