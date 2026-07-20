'use client'
import { useState } from 'react'
import VerifyCitizen from '@/components/pages/activation/verify-citizen-page'

export default function Page() {
  const [saId, setSaId] = useState('')
  const [pin, setPin] = useState('')
  return <VerifyCitizen />
}
