'use client'

import * as React from 'react'
import { User } from 'lucide-react'
import { Button } from '@/components/atoms'
import type { LoginFormProps } from '@/types/login-form'

export const LoginForm = ({ onSubmitAction }: Readonly<LoginFormProps>) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = { email, password }
    onSubmitAction?.(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-lg font-bold text-primary-green md:text-xl"
        >
          Email:
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 text-base focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-lg font-bold text-primary-green md:text-xl"
        >
          Password:
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 text-base focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          variant="primary"
          type="submit"
          className="w-full lg:w-full"
          LeftIcon={User}
        >
          Login
        </Button>
        <a
          className="text-center text-sm font-medium text-primary-green hover:text-deep-green hover:underline sm:text-base"
          href="#"
        >
          Forgot password?
        </a>
        <a
          className="text-center text-sm font-medium text-primary-green hover:text-deep-green hover:underline sm:text-base"
          href="#"
        >
          Don&apos;t have an account? Register here.
        </a>
      </div>
    </form>
  )
}
