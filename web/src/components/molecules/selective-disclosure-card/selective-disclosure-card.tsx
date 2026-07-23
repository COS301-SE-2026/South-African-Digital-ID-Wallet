'use client'

import * as React from 'react'

export const SelectiveDisclosureCard = () => {
  const [fullDisclosure, setFullDisclosure] = React.useState(true)
  const [showModal, setShowModal] = React.useState(false)

  return (
    <>
      <div className="bg-card rounded-3xl border p-4 h-full flex flex-col">
        <div>
          <h2 className="text-xl font-bold">Selective Disclosure</h2>

          <p className="text-xs text-muted-text mt-1">
            Control how your information is shared during credential
            verification.
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-evenly mt-2">
          <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
            <div className="pr-4">
              <p className="font-semibold text-sm">Full Disclosure</p>

              <p className="text-xs text-muted-text">
                Share all credential information.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFullDisclosure(!fullDisclosure)}
              className={`relative h-6 w-11 rounded-full transition ${
                fullDisclosure ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  fullDisclosure ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
            <div className="pr-4">
              <p className="font-semibold text-sm">Custom Disclosure</p>

              <p className="text-xs text-muted-text">
                Choose exactly what is shared.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted transition"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-3xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold">Custom Disclosure</h2>

            <p className="text-sm text-muted-text mt-2">
              Select which information should be shared when presenting your
              credential.
            </p>

            <div className="mt-6 space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked />
                Full Name
              </label>

              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked />
                Date of Birth
              </label>

              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked />
                Nationality
              </label>

              <label className="flex items-center gap-3">
                <input type="checkbox" />
                ID Number
              </label>

              <label className="flex items-center gap-3">
                <input type="checkbox" />
                Address
              </label>

              <label className="flex items-center gap-3">
                <input type="checkbox" />
                Phone Number
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-primary px-5 py-2 text-primary-foreground font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
