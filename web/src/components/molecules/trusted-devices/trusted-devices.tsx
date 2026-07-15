import * as React from 'react'
import { Smartphone, Monitor, X, Unplug } from 'lucide-react'
import type { TrustedDevice } from '@/components/molecules/trusted-devices/types'

const devices: TrustedDevice[] = [
  {
    id: 'phone',
    name: 'iPhone 16 Pro Max',
    meta: 'Current device • Sandton',
    status: 'Active',
    icon: Smartphone,
  },
  {
    id: 'browser',
    name: 'Brave Web Portal',
    meta: 'Last login • Last week 19:34',
    status: 'Known',
    icon: Monitor,
  },
  {
    id: 'tablet',
    name: 'iPad Pro',
    meta: 'Last login • Yesterday 09:12',
    status: 'Known',
    icon: Smartphone,
  },
]

export function TrustedDevices() {
  const [showDevices, setShowDevices] = React.useState(false)

  return (
    <>
      <div className="bg-card rounded-3xl border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Trusted Devices</h2>

          <button
            onClick={() => setShowDevices(true)}
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            Manage
          </button>
        </div>

        <ul className="mt-4 space-y-4">
          {devices.map((device) => {
            const Icon = device.icon

            return (
              <li
                key={device.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-muted p-2">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="font-semibold text-sm">{device.name}</div>

                    <div className="text-muted-text text-xs mt-0.5">
                      {device.meta}
                    </div>
                  </div>
                </div>

                {device.status === 'Active' ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-muted-text">
                    Known
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {showDevices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-2xl font-bold">Trusted Devices</h2>
              </div>

              <button
                onClick={() => setShowDevices(false)}
                className="rounded-xl p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[500px] space-y-4 overflow-y-auto p-6">
              {devices.map((device) => {
                const Icon = device.icon

                return (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-muted p-4">
                        <Icon className="h-7 w-7 text-green-700" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">{device.name}</h3>

                        <p className="mt-1 text-sm text-muted-text">
                          {device.meta}
                        </p>

                        <span
                          className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            device.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {device.status}
                        </span>
                      </div>
                    </div>

                    <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 transition-colors hover:bg-red-100">
                      <Unplug className="h-4 w-4" />
                      Unlink Device
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end border-t p-6">
              <button
                onClick={() => setShowDevices(false)}
                className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
