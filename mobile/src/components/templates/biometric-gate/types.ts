import { ReactNode } from 'react'

export type GateStatus = 'checking' | 'locked' | 'unlocked' | 'unavailable'

export type BiometricGateProps = {
  children: ReactNode
  prompt: string
}
