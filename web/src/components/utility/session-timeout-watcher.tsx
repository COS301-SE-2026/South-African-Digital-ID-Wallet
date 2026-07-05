'use client'

import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useUser } from '@/context/user-context'

const SESSION_EXPIRY_KEY = 'flashid-session-expires-at'
const WARNING_MINUTES_BEFORE_EXPIRY = 5
const CHECK_INTERVAL_MS = 60 * 1000

export const SessionTimeoutWatcher = () => {
  const { user, logout } = useUser()
  const hasWarnedRef = useRef(false)

  useEffect(() => {
    if (!user) {
      hasWarnedRef.current = false
      return
    }

    const checkExpiry = () => {
      const expiresAtRaw = window.localStorage.getItem(SESSION_EXPIRY_KEY)
      if (!expiresAtRaw) return

      const expiresAt = new Date(expiresAtRaw).getTime()
      const now = Date.now()
      const minutesRemaining = (expiresAt - now) / (1000 * 60)

      if (minutesRemaining <= 0) {
        toast.error('Your session has expired. Please log in again.')
        window.localStorage.removeItem(SESSION_EXPIRY_KEY)
        logout()
        return
      }

      if (
        minutesRemaining <= WARNING_MINUTES_BEFORE_EXPIRY &&
        !hasWarnedRef.current
      ) {
        hasWarnedRef.current = true
        toast(
          `Your session will expire in about ${Math.ceil(minutesRemaining)} minute(s). Please save your work.`,
          { duration: 8000 }
        )
      }
    }

    checkExpiry()
    const interval = setInterval(checkExpiry, CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [user, logout])

  return null
}
