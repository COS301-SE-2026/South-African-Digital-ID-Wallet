'use client'

import { useEffect, useState } from 'react'
import { Car, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const DEFAULT_REVEAL_AFTER_MS = 12_000

export function PageSkeleton({
  revealAfterMs = DEFAULT_REVEAL_AFTER_MS,
}: {
  revealAfterMs?: number
}) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), revealAfterMs)
    return () => clearTimeout(timer)
  }, [revealAfterMs])

  return (
    <div className="relative p-6">
      <div
        aria-hidden="true"
        className={cn(
          'transition-opacity duration-1000 ease-out',
          revealed ? 'opacity-20' : 'opacity-100'
        )}
      >
        <div className="grid grid-cols-3 gap-6">
          {[0, 1, 2].map((tile) => (
            <Card key={tile} size="sm">
              <CardHeader>
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-12 gap-6">
          <Card className="col-span-8">
            <CardHeader>
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[0, 1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[0, 1, 2, 3].map((row) => (
                <Skeleton key={row} className="h-3 w-full" />
              ))}
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
      <div
        role="status"
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-out',
          revealed ? 'opacity-100' : 'opacity-0'
        )}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-primary-green shadow-md ring-1 ring-foreground/5">
          <Sparkles className="h-4 w-4" />
          Coming soon
        </span>
      </div>
    </div>
  )
}
