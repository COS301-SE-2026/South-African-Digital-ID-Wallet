'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '@/lib/api'

type User = {
  userId: string
  email: string
  role: string
  names?: string
  surname?: string
} | null

type ContextValue = {
  user: User
  loading: boolean
  refresh: () => Promise<void>
}

const UserContext = createContext<ContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
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
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, refresh: fetchMe }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
