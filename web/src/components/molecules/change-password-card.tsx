'use client'

import * as React from 'react'

export const ChangePasswordCard = () => {
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }

    alert('Password updated (demo)')
  }

  return null
}
