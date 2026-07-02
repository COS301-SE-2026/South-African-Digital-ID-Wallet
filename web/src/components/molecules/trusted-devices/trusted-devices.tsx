import { Button } from '@/components/atoms'

import type { TrustedDevicesProps } from '@/components/molecules/trusted-devices/types'

//template info. change it out with real data from back end
const defaultDevices = [
  { id: 'dev-1', name: 'Samsung Galaxy A54', lastSeen: 'Today, 09:14' },
  { id: 'dev-2', name: 'iPhone 12', lastSeen: '16 May 2025' },
]

export const TrustedDevices = ({
  devices = defaultDevices,
}: TrustedDevicesProps) => {
  return (
    <div className="bg-card rounded-3xl border p-6">
      <h3 className="text-lg font-semibold mb-3">Trusted Devices</h3>

      <div className="space-y-3">
        {devices.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between p-3 border rounded-2xl"
          >
            <div>
              <div className="font-semibold">{d.name}</div>
              <div className="text-sm text-muted-text">
                Last seen {d.lastSeen}
              </div>
            </div>

            <div>
              <Button variant="text">Remove device</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrustedDevices
