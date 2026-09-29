'use client'

import { FC, useState, FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { X } from 'lucide-react'
import axios from 'axios'
import api from '@/lib/api'
import { Text, Button } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { UpdatePasswordModalProps } from './types'
import {
  modalCloseButtonClassName,
  modalOverlayClassName,
  modalPanelClassName,
  modalTitleClassName,
} from '@/components/atoms/modal/modal-styles'

export const UpdatePasswordModal: FC<UpdatePasswordModalProps> = ({
  open,
  onCloseAction,
  onSuccess,
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

      onSuccess?.()
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
    <div className={modalOverlayClassName}>
      <div className="absolute inset-0" onClick={onCloseAction} aria-hidden />
      <div className="relative w-full max-w-[560px]">
        <div className={`${modalPanelClassName} p-6 sm:p-8`}>
          <div className="flex items-start justify-between gap-4">
            <h2 className={modalTitleClassName}>Update Password</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onCloseAction}
              className={modalCloseButtonClassName}
            >
              <X className="h-5 w-5" />
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
