import { useCallback, useRef } from 'react'
import { useRouter } from 'expo-router'
import { Alert, View } from 'react-native'

import { Skeleton, Text } from '@/components/atoms'
import {
  CREDENTIAL_LIST_CARD_HEIGHT,
  CredentialList,
} from '@/components/organisms'
import { WalletScreen } from '@/components/templates'
import { useBiometricUnlock, useWalletCredentials } from '@/hooks'
import type { WalletCredential } from '@/services/citizen-dashboard-service'
import { useCredentialUnlockStore } from '@/stores/credential-unlock-store'

const SKELETON_STYLE = { height: CREDENTIAL_LIST_CARD_HEIGHT }

export const CitizenWalletPage = () => {
  const router = useRouter()
  const { credentials, isError, isPending } = useWalletCredentials()
  const grantUnlock = useCredentialUnlockStore((state) => state.unlock)
  const { unlock } = useBiometricUnlock()
  const isUnlocking = useRef(false)

  const handleSelect = useCallback(
    async (credential: WalletCredential) => {
      if (isUnlocking.current) {
        return
      }
      isUnlocking.current = true
      try {
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
      } finally {
        isUnlocking.current = false
      }
    },
    [grantUnlock, router, unlock]
  )

  return (
    <WalletScreen
      subtitle="Tap a card and confirm it's you to view it."
      title="Credentials"
    >
      {isPending ? (
        <View className="gap-4" testID="wallet-loading">
          <Skeleton
            className="rounded-3xl"
            style={SKELETON_STYLE}
            testID="wallet-skeleton"
          />
          <Skeleton
            className="rounded-3xl"
            style={SKELETON_STYLE}
            testID="wallet-skeleton"
          />
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
