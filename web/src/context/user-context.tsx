'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import loginService from '@/services/login-service/login-service'
import type { User, UserContextValue } from '@/types/user-context.types'

const USER_STORAGE_KEY = 'flashid-user'

const readStoredUser = (): User => {
  if (typeof window === 'undefined') return null
  const storedUser = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!storedUser) return null
  try {
    return JSON.parse(storedUser) as User
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

const writeStoredUser = (nextUser: User) => {
  if (typeof window === 'undefined') return
  if (nextUser) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    return
  }
  window.localStorage.removeItem(USER_STORAGE_KEY)
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  setUser: () => {},
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [user, setUserState] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  const setUser = useCallback<React.Dispatch<React.SetStateAction<User>>>(
    (nextUser) => {
      setUserState((currentUser) => {
        const resolvedUser =
          typeof nextUser === 'function' ? nextUser(currentUser) : nextUser
        writeStoredUser(resolvedUser)
        return resolvedUser
      })
    },
    []
  )

  const fetchMe = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data)
    } catch {
      setUser(readStoredUser())
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
      const storedUser = readStoredUser()
      if (storedUser && mounted) setUser(storedUser)
      try {
        setLoading(true)
        const res = await api.get('/api/auth/me')
        if (mounted) setUser(res.data)
      } catch {
        if (storedUser && mounted) {
          setUser(storedUser)
        } else if (mounted) {
          setUser(null)
        }
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
