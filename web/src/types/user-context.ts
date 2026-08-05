import type React from 'react'

export type User = {
  userId: string
  saId?: string
  email: string
  role: string
  names?: string
  surname?: string
} | null

export type UserContextValue = {
  user: User
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
  setUser: React.Dispatch<React.SetStateAction<User>>
}
