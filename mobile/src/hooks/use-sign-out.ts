import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'

import loginService from '@/services/login-service/login-service'
import { useAuthStore } from '@/stores/auth-store'

export const useSignOut = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const signOut = useAuthStore((state) => state.signOut)

  return useCallback(async () => {
    await loginService.logout().catch(() => {})
    signOut()
    queryClient.clear()
    router.replace('/login')
  }, [queryClient, router, signOut])
}
