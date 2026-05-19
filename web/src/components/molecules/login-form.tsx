'use client'

import * as React from 'react'
import { User } from 'lucide-react'
import type { LoginFormProps } from '@/types/login-form.types'

export const LoginForm = ({ onSubmitAction }: Readonly<LoginFormProps>) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (
    e
  ) => {
    e.preventDefault()
    const data = { email, password }
    onSubmitAction?.(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          Email:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
      </div>

      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          Password:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 rounded-md bg-primary-green px-4 py-2 text-base text-clean-white transition-colors hover:bg-deep-green"
          type="submit"
        >
          <User className="h-5 w-5" />
          Login
        </button>
        <a
          className="text-base text-primary-green hover:text-deep-green hover:underline"
          href="#"
        >
          Forgot password?
        </a>
      </div>
    </form>
  )
}
