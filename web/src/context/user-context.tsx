'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import loginService from '@/services/login-service/login-service'
import type { User, UserContextValue } from '@/types/user-context.types'

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  setUser: () => {},
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)

    try {
      await loginService.logout()
    } catch {
      // Ignore network issues and clear local auth state anyway.
    } finally {
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
        window.sessionStorage.clear()
      }

      setUser(null)
      router.replace('/')
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/auth/me')
        if (mounted) setUser(res.data)
      } catch {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [setUser])

  return (
    <UserContext.Provider
      value={{ user, loading, refresh: fetchMe, logout, setUser }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
