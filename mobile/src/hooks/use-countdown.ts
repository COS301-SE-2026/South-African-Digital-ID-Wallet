import { useEffect, useState } from 'react'

const secondsBetween = (expiresAt: string | undefined, now: number) => {
  if (!expiresAt) {
    return 0
  }
  const remaining = new Date(expiresAt).getTime() - now
  return Number.isNaN(remaining) ? 0 : Math.max(Math.round(remaining / 1000), 0)
}

export const useCountdown = (expiresAt: string | undefined) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!expiresAt) {
      return
    }
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  return secondsBetween(expiresAt, now)
}
