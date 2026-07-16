'use client'
import { useState } from 'react'
import { ActivationInfoItem } from '@/components/molecules/activation-info-item/activation-info-item'
import { ActivationProgress } from '@/components/molecules/activation-progress-bar'
import { VerifyIdentityCard } from '@/components/organisms/verify-identity-card'
import { ShieldCheck } from 'lucide-react'
import VerifyCitizen from '@/components/pages/activation/verify-citizen-page'

export default function Page() {
  const [saId, setSaId] = useState('')
  const [pin, setPin] = useState('')
  return <VerifyCitizen />
}
