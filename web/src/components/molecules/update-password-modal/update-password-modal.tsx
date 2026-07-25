'use client'

import { FC, useState, FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import api from '@/lib/api'
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
  const [loading, setLoading] = useState(false)

  if (!open) {
    return null
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setErrorMessage('')

    if (newPass.length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
      return
    }

    if (newPass !== confirmPass) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await api.put('/api/UpdatePassword', {
        currentPassword: currentPass,
        newPassword: newPass,
        confirmPassword: confirmPass,
      })

      toast.success('Password updated successfully.')

      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')

      onCloseAction()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string; error?: string })
            ?.message ??
          (error.response?.data as { message?: string; error?: string })?.error)
        : undefined

      setErrorMessage(message ?? 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCloseAction}
        aria-hidden
      />
      <div className="relative mx-auto w-[min(560px,95%)]">
        <div className="bg-card rounded-3xl border p-6">
          <div className="flex items-start justify-between gap-4">
            <Text as="h2" variant="h3">
              Update Password
            </Text>
            <button
              type="button"
              aria-label="Close"
              onClick={onCloseAction}
              className="text-muted-text"
            >
              ✕
            </button>
          </div>

          <Text as="p" variant="sub-sm" className="mt-2">
            Keep your account secure with a strong password.
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
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UpdatePasswordModal
