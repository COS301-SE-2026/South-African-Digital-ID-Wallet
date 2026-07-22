import { FC } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

import { ConnectorProps } from './types'

const Connector: FC<ConnectorProps> = ({ visible, filled }) => (
  <div
    className={cn(
      'h-0.5 flex-1 overflow-hidden rounded-full bg-border',
      !visible && 'invisible'
    )}
    aria-hidden="true"
  >
    <div
      className={cn(
        'h-full rounded-full bg-primary-green transition-[width] duration-500 ease-out motion-reduce:transition-none',
        filled ? 'w-full' : 'w-0'
      )}
    />
  </div>
)
