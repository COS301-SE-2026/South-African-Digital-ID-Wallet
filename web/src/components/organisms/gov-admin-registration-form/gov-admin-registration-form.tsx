'use client'

import { type SyntheticEvent, useState } from 'react'
import { UserCog } from 'lucide-react'
import { Button } from '@/components/atoms'
import { TextField } from '@/components/molecules'

export const GovAdminRegistrationForm = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
  }

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <TextField
        name="firstName"
        label="First Name"
        placeholder="Enter first name"
        className="py-3"
        required
      />

      <TextField
        name="lastName"
        label="Last Name"
        placeholder="Enter last name"
        className="py-3"
        required
      />

      <TextField
        name="governmentId"
        label="Government ID"
        placeholder="Enter government employee ID"
        className="py-3"
        required
      />

      <TextField
        name="email"
        label="Email Address"
        placeholder="Enter email address"
        type="email"
        className="py-3"
        required
      />

      <TextField
        name="phoneNumber"
        label="Phone Number"
        placeholder="Enter phone number"
        className="py-3"
        required
      />

      <TextField
        name="username"
        label="Username"
        placeholder="Choose a username"
        className="py-3"
        required
      />

      <TextField
        name="password"
        label="Password"
        placeholder="Enter password"
        type="password"
        className="py-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1.5">
        <TextField
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter password"
          type="password"
          className="py-3"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {confirmPassword.length > 0 && (
          <p
            className={`text-xs ${passwordsMatch ? 'text-success-green' : 'text-destructive'}`}
          >
            {passwordsMatch ? '• Passwords match' : '• Passwords do not match'}
          </p>
        )}
      </div>

      <div className="col-span-2 mt-2">
        <Button
          type="submit"
          variant="primary"
          LeftIcon={UserCog}
          iconClassName="h-5 w-5"
          className="w-full lg:w-full"
        >
          Register Administrator
        </Button>
      </div>
    </form>
  )
}
