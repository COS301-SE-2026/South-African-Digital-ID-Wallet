import { useCallback, useEffect, useRef } from 'react'
import { Pressable, View } from 'react-native'

import { Button, Text } from '@/components/atoms'
import { useBiometricUnlock, useSignOut } from '@/hooks'
import { useAuthStore } from '@/stores/auth-store'

export const BiometricLockOverlay = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLocked = useAuthStore((state) => state.isLocked)
  const unlock = useAuthStore((state) => state.unlock)
  const user = useAuthStore((state) => state.user)
  const { unlock: authenticate } = useBiometricUnlock()
  const signOut = useSignOut()
  const isPromptingRef = useRef(false)

  const attempt = useCallback(async () => {
    if (isPromptingRef.current) {
      return
    }
    isPromptingRef.current = true
    try {
      const result = await authenticate('Unlock FlashID')
      if (result === 'unlocked') {
        unlock()
        return
      }
      if (result === 'unavailable') {
        await signOut()
      }
    } finally {
      isPromptingRef.current = false
    }
  }, [authenticate, signOut, unlock])

  useEffect(() => {
    if (isAuthenticated && isLocked) {
      void attempt()
    }
  }, [attempt, isAuthenticated, isLocked])

  if (!isAuthenticated || !isLocked) {
    return null
  }

  return (
    <View
      className="absolute inset-0 items-center justify-center gap-5 bg-deep-green px-8"
      testID="biometric-lock-overlay"
    >
      <Text variant="h2" className="text-clean-white">
        FlashID
      </Text>
      <Text variant="sub-md" className="text-center text-clean-white">
        {user?.names
          ? `Welcome back, ${user.names}. Unlock to continue.`
          : 'Unlock to continue.'}
      </Text>
      <Button
        label="Unlock"
        onPress={() => void attempt()}
        testID="biometric-unlock"
      />
      <Pressable
        accessibilityRole="button"
        hitSlop={6}
        onPress={() => void signOut()}
      >
        <Text variant="caption" className="font-semibold text-accent-gold">
          Sign in as someone else
        </Text>
      </Pressable>
    </View>
  )
}
