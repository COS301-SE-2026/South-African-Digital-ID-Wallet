import { useLocalSearchParams } from 'expo-router'
import { usePreventScreenCapture } from 'expo-screen-capture'

import { QrGenerationPage } from '@/components/pages'
import { BiometricGate } from '@/components/templates'
import {
  isUnlockValid,
  useCredentialUnlockStore,
} from '@/stores/credential-unlock-store'

export default function Present() {
  usePreventScreenCapture()
  const { credentialId } = useLocalSearchParams<{ credentialId: string }>()
  const unlockedAt = useCredentialUnlockStore((state) => state.unlockedAt)
  const unlockedId = useCredentialUnlockStore((state) => state.unlockedId)

  if (isUnlockValid(credentialId, unlockedId, unlockedAt)) {
    return <QrGenerationPage credentialId={credentialId} />
  }

  return (
    <BiometricGate prompt="Confirm your identity to show your digital ID.">
      <QrGenerationPage credentialId={credentialId} />
    </BiometricGate>
  )
}
