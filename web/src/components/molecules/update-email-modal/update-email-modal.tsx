'use client'

import { useState, FC, SubmitEvent } from 'react'
import { toast } from 'react-hot-toast'

import { Text, Button } from '@/components/atoms'
import { TextField } from '@/components/molecules'

import { UpdateEmailModalProps } from './types'

export const UpdateEmailModal: FC<UpdateEmailModalProps> = ({
  open,
  onCloseAction,
}) => {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  if (!open) {
    return null
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    toast.success(`Verification sent to ${email}`)
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
              Update Email
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
            Change the email address associated with your account.
          </Text>
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
            <TextField
              label="New email address"
              type="email"
              placeholder=""
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrorMessage('')
              }}
              error={errorMessage}
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full lg:w-full"
            >
              Update Email
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
