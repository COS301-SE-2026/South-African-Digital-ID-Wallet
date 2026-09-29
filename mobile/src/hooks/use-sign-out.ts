import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'

import loginService from '@/services/login-service/login-service'
import { useAuthStore } from '@/stores/auth-store'
import { useSecurityResultStore } from '@/stores/security-result-store'

export const useSignOut = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const signOut = useAuthStore((state) => state.signOut)
  const clearSecurityResults = useSecurityResultStore((state) => state.clear)

  return useCallback(async () => {
    await loginService.logout().catch(() => {})
    signOut()
    queryClient.clear()
    clearSecurityResults()
    router.replace('/login')
  }, [clearSecurityResults, queryClient, router, signOut])
}
