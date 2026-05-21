'use client'

import { type SyntheticEvent, useState } from 'react'
import { UserCog } from 'lucide-react'
import { Button } from '@/components/atoms'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const GovAdminRegistrationForm = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
  }

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-m font-semibold uppercase tracking-widest text-muted-foreground">
          Personal Details
        </p>
        <hr className="border-border" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Enter first name"
            className="py-3"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Enter last name"
            className="py-3"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            className="py-3"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
              +27
            </span>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="71 234 5678"
              className="rounded-l-none py-3"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-m font-semibold uppercase tracking-widest text-muted-foreground">
          Account Details
        </p>
        <hr className="border-border" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="governmentId">Government ID</Label>
          <Input
            id="governmentId"
            name="governmentId"
            placeholder="Enter government employee ID"
            className="py-3"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="Choose a username"
            className="py-3"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            className="py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            className="py-3"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword.length > 0 && (
            <p
              className={`text-xs ${passwordsMatch ? 'text-success-green' : 'text-destructive'}`}
            >
              {passwordsMatch
                ? '• Passwords match'
                : '• Passwords do not match'}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        LeftIcon={UserCog}
        iconClassName="h-5 w-5"
        className="w-full lg:w-full"
      >
        Register Administrator
      </Button>
    </form>
  )
}
