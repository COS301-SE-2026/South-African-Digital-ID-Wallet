import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { PhoneFrameProps } from './types'

export function PhoneFrame({
  src,
  label,
  className,
  priority = false,
}: PhoneFrameProps) {
  return (
    <div
      className={cn(
        'relative aspect-[1/2] w-full overflow-hidden rounded-[2.25rem] border-[6px] border-deep-green bg-cream-background shadow-[0_24px_50px_-16px_rgba(5,59,44,0.4)] ring-1 ring-deep-green/15',
        className
      )}
    >
      <Image
        src={src}
        alt={label}
        fill
        sizes="(max-width: 640px) 55vw, 260px"
        className="object-contain"
        priority={priority}
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-4 w-[38%] -translate-x-1/2 rounded-b-xl bg-deep-green"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-deep-green/60"
      />
    </div>
  )
}
