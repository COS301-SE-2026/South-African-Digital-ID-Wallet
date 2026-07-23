'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'

export const DeleteAccountCard = () => {
  const [open, setOpen] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [confirmationText, setConfirmationText] = React.useState('')

  const closeModal = () => {
    setOpen(false)
    setConfirmDelete(false)
    setConfirmationText('')
  }

  return (
    <>
      <div className="bg-card border rounded-3xl px-5 py-4 flex items-center justify-between">
        <div className="max-w-3xl">
          <h2 className="text-base font-semibold text-destructive">
            Delete Account
          </h2>

          <p className="text-xs text-muted-text mt-1 leading-5">
            Permanently deleting your FlashID account will remove your personal
            information, issued credentials, trusted devices and account history
            from our system. This action cannot be undone.
          </p>
        </div>

        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete Account
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-3xl w-full max-w-md p-6 shadow-xl">
            {!confirmDelete ? (
              <>
                <h2 className="text-2xl font-bold">Delete Account</h2>

                <p className="text-sm text-muted-text mt-3 leading-6">
                  Are you sure you want to permanently delete your FlashID
                  account? This action cannot be undone and all of your account
                  information and credentials will be permanently removed.
                </p>

                <div className="flex justify-end gap-3 mt-8">
                  <Button variant="outline" onClick={closeModal}>
                    No
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Yes
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Final Confirmation</h2>

                <p className="text-sm text-muted-text mt-3">
                  To confirm that you understand this action is permanent,
                  please type the word
                  <span className="font-semibold"> DELETE </span>
                  below.
                </p>

                <label className="block mt-6 text-sm font-medium">
                  Type &ldquo;DELETE&rdquo;
                </label>

                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="flex justify-end gap-3 mt-8">
                  <Button variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>

                  <Button
                    variant="destructive"
                    disabled={confirmationText !== 'DELETE'}
                  >
                    Permanently Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
