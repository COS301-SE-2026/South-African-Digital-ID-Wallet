import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { Alert, View } from 'react-native'

import { Skeleton, Text } from '@/components/atoms'
import { CredentialList } from '@/components/organisms'
import { WalletScreen } from '@/components/templates'
import { useBiometricUnlock, useWalletCredentials } from '@/hooks'
import type { WalletCredential } from '@/services/citizen-dashboard-service'
import { useCredentialUnlockStore } from '@/stores/credential-unlock-store'

export const CitizenWalletPage = () => {
  const router = useRouter()
  const { credentials, isError, isPending } = useWalletCredentials()
  const grantUnlock = useCredentialUnlockStore((state) => state.unlock)
  const { status, unlock } = useBiometricUnlock()

  const handleSelect = useCallback(
    async (credential: WalletCredential) => {
      if (status === 'checking') {
        return
      }
      const result = await unlock(`Unlock ${credential.title}`)
      if (result === 'unavailable') {
        Alert.alert(
          'Device lock required',
          'Set up Face ID, a fingerprint or a screen lock on this device to view your credentials.'
        )
        return
      }
      if (result !== 'unlocked') {
        return
      }
      grantUnlock(credential.id)
      router.push({
        params: { id: credential.id },
        pathname: '/citizen/wallet/[id]',
      })
    },
    [grantUnlock, router, status, unlock]
  )

  return (
    <WalletScreen
      subtitle="Tap a card and confirm it's you to view it."
      title="Credentials"
    >
      {isPending ? (
        <View className="gap-4" testID="wallet-loading">
          <Skeleton className="h-[150px] rounded-3xl" />
          <Skeleton className="h-[150px] rounded-3xl" />
        </View>
      ) : isError ? (
        <Text
          variant="sub-sm"
          className="text-danger-red"
          testID="wallet-error"
        >
          We could not load your credentials. Pull down to try again.
        </Text>
      ) : credentials.length === 0 ? (
        <Text variant="sub-sm" testID="wallet-empty">
          You have no credentials yet. Once an official issues one it will show
          up here.
        </Text>
      ) : (
        <CredentialList credentials={credentials} onSelect={handleSelect} />
      )}
    </WalletScreen>
  )
}
