import { useCallback, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { QrCode } from 'lucide-react-native'
import { ActivityIndicator, View } from 'react-native'

import { Button, Text } from '@/components/atoms'
import { CredentialDetailCard } from '@/components/organisms'
import { DetailScreen } from '@/components/templates'
import { useBiometricUnlock, useWalletCredential } from '@/hooks'
import { useAuthStore } from '@/stores/auth-store'
import {
  isUnlockValid,
  useCredentialUnlockStore,
} from '@/stores/credential-unlock-store'
import { colors } from '@/theme/colors'

import type { CredentialDetailPageProps } from './types'

export const CredentialDetailPage = ({ id }: CredentialDetailPageProps) => {
  const router = useRouter()
  const { credential, isPending } = useWalletCredential(id)
  const user = useAuthStore((state) => state.user)
  const grantUnlock = useCredentialUnlockStore((state) => state.unlock)
  const unlockedAt = useCredentialUnlockStore((state) => state.unlockedAt)
  const unlockedId = useCredentialUnlockStore((state) => state.unlockedId)
  const { status, unlock } = useBiometricUnlock()

  const isUnlocked = isUnlockValid(id, unlockedId, unlockedAt)

  useEffect(() => {
    if (isUnlocked || status !== 'idle' || !credential) {
      return
    }
    void unlock(`Unlock ${credential.title}`).then((result) => {
      if (result === 'unlocked') {
        grantUnlock(credential.id)
        return
      }
      router.back()
    })
  }, [credential, grantUnlock, isUnlocked, router, status, unlock])

  const handleBack = useCallback(() => router.back(), [router])

  const holderName = [user?.names, user?.surname].filter(Boolean).join(' ')

  if (isPending || !credential || !isUnlocked) {
    return (
      <View
        className="flex-1 items-center justify-center bg-clean-white"
        testID="credential-detail-loading"
      >
        <ActivityIndicator color={colors.primaryGreen} size="large" />
      </View>
    )
  }

  return (
    <DetailScreen onBack={handleBack} title="My ID">
      <CredentialDetailCard
        fields={credential.fields}
        holderName={holderName || 'Cardholder'}
        isVerified={credential.isVerified}
        issuedBy={credential.issuedBy}
        title={credential.title}
      />
      <Text variant="caption" className="text-center">
        {credential.issuedOn
          ? `Issued on ${credential.issuedOn} · This is your verified digital identity`
          : 'This is your verified digital identity'}
      </Text>
      <Button
        label="Share Identity"
        LeftIcon={QrCode}
        onPress={() =>
          router.push({
            params: { credentialId: credential.id },
            pathname: '/citizen/verify',
          })
        }
        testID="share-identity-button"
      />
    </DetailScreen>
  )
}
