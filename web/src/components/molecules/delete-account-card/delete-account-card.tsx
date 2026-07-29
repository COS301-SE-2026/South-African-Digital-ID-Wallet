'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import api from '@/lib/api'

export const DeleteAccountCard = () => {
  const router = useRouter()

  const [open, setOpen] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [confirmationText, setConfirmationText] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const closeModal = () => {
    setOpen(false)
    setConfirmDelete(false)
    setConfirmationText('')
  }

  const handleDeleteAccount = async () => {
    try {
      setLoading(true)

      await api.delete('/api/account')

      toast.success('Your account has been permanently deleted.')

      closeModal()

      router.push('/')
    } catch (error) {
      console.error('Delete account failed:', error)

      toast.error('Failed to delete your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-card border rounded-3xl px-5 py-4 flex items-center justify-between">
        <div className="max-w-3xl">
          <h2 className="text-base font-semibold text-destructive">
            Delete Account
          </h2>

          <p className="mt-1 text-xs leading-5 text-muted-text">
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
          <div className="bg-card w-full max-w-md rounded-3xl p-6 shadow-xl">
            {!confirmDelete ? (
              <>
                <h2 className="text-2xl font-bold">Delete Account</h2>

                <p className="mt-3 text-sm leading-6 text-muted-text">
                  Are you sure you want to permanently delete your FlashID
                  account? This action cannot be undone and all of your account
                  information and credentials will be permanently removed.
                </p>

                <div className="mt-8 flex justify-end gap-3">
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

                <p className="mt-3 text-sm text-muted-text">
                  To confirm that you understand this action is permanent,
                  please type the word{' '}
                  <span className="font-semibold">DELETE</span> below.
                </p>

                <label
                  htmlFor="delete-confirmation"
                  className="mt-6 block text-sm font-medium"
                >
                  Type &quot;DELETE&quot;
                </label>

                <input
                  id="delete-confirmation"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="mt-8 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="destructive"
                    disabled={confirmationText !== 'DELETE' || loading}
                    onClick={handleDeleteAccount}
                  >
                    {loading ? 'Deleting...' : 'Permanently Delete'}
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
