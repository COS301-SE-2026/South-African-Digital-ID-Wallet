import type React from 'react'

export type User = {
  userId: string
  email: string
  role: string
  names?: string
  surname?: string
} | null

export type UserContextValue = {
  user: User
  loading: boolean
  refresh: () => Promise<void>
  setUser: React.Dispatch<React.SetStateAction<User>>
}
