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

  return (
    <div className="bg-card rounded-3xl border p-6">
      <h2 className="text-3xl font-bold mb-2">Change Password</h2>
      <p className="text-muted-text mb-8">
        Use a strong password to keep your account secure.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="password"
          placeholder="Current Password"
          className="w-full border rounded-2xl px-5 py-4 outline-none"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full border rounded-2xl px-5 py-4 outline-none"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full border rounded-2xl px-5 py-4 outline-none"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-muted-text">
          <div>✔ At least 8 characters</div>
          <div>✔ Includes uppercase letter</div>
          <div>✔ Includes a number</div>
          <div>✔ Includes special character</div>
        </div>

        <button
          className="w-full bg-primary py-4 rounded-2xl mt-8 text-primary-foreground font-semibold text-lg"
          type="submit"
        >
          Update Password
        </button>
      </form>
    </div>
  )
}
