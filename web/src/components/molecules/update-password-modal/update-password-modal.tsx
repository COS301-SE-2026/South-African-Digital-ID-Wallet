'use client'

import { useState, FC, SubmitEvent } from 'react'
import { toast } from 'react-hot-toast'

import { Text, Button } from '@/components/atoms'
import { TextField } from '@/components/molecules'

import { UpdatePasswordModalProps } from './types'

export const UpdatePasswordModal: FC<UpdatePasswordModalProps> = ({
  open,
  onCloseAction,
}) => {
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  if (!open) {
    return null
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newPass.length < 8) {
      return setErrorMessage('Password must be at least 8 characters.')
    }
    if (newPass !== confirmPass) {
      return setErrorMessage('Passwords do not match.')
    }
    toast.success('Password updated')
    onCloseAction()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCloseAction}
        aria-hidden
      />
      <div className="relative w-[min(560px,95%)] mx-auto">
        <div className="bg-card rounded-3xl border p-6">
          <div className="flex items-start justify-between gap-4">
            <Text as="h2" variant="h3">
              Update Password
            </Text>
            <button
              aria-label="Close"
              onClick={onCloseAction}
              className="text-muted-text"
            >
              x
            </button>
          </div>
          <Text as="p" variant="sub-sm" className="mt-2">
            Keep your account secure with a string password.
          </Text>
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
            <TextField
              label="Current password"
              type="password"
              value={currentPass}
              onChange={(e) => {
                setCurrentPass(e.target.value)
                setErrorMessage('')
              }}
            />
            <TextField
              label="New password"
              type="password"
              value={newPass}
              onChange={(e) => {
                setNewPass(e.target.value)
                setErrorMessage('')
              }}
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={confirmPass}
              onChange={(e) => {
                setConfirmPass(e.target.value)
                setErrorMessage('')
              }}
              error={errorMessage}
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full lg:w-full"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
