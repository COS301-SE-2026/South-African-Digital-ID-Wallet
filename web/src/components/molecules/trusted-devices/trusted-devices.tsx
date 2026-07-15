import * as React from 'react'
import { Smartphone, Monitor } from 'lucide-react'
import type { TrustedDevice } from '@/components/molecules/trusted-devices/types'

const devices: TrustedDevice[] = [
  {
    id: 'phone',
    name: 'Iphone 16 max pro',
    meta: 'Current device \u2022 sandton',
    status: 'Active',
    icon: Smartphone,
  },
  {
    id: 'browser',
    name: 'brave Web Portal',
    meta: 'Last login \u2022 last week 19:34',
    status: 'Known',
    icon: Monitor,
  },
]

export function TrustedDevices() {
  return (
    <div className="bg-card rounded-3xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Trusted Devices</h2>
        <a
          href="#"
          className="text-sm font-semibold text-green-700 hover:text-green-800"
        >
          Manage
        </a>
      </div>

      <ul className="mt-4 space-y-4">
        {devices.map((device) => (
          <li
            key={device.id}
            className="flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold text-sm">{device.name}</div>
              <div className="text-muted-text text-xs mt-0.5">
                {device.meta}
              </div>
            </div>
            {device.status === 'Active' ? (
              <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2.5 py-1">
                Active
              </span>
            ) : (
              <span className="text-xs font-semibold text-muted-text">
                Known
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
