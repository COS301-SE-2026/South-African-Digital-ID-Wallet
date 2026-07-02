import { Button } from '@/components/atoms'

import type { TrustedDevicesProps } from '@/components/molecules/trusted-devices/types'

//template info. change it out with real data from back end
const defaultDevices = [
  { id: 'dev-1', name: 'Samsung Galaxy A54', lastSeen: 'Today, 09:14' },
  { id: 'dev-2', name: 'iPhone 12', lastSeen: '16 May 2025' },
]

export const TrustedDevices = ({
  devices = defaultDevices,
}: TrustedDevicesProps) => {}

export default TrustedDevices
