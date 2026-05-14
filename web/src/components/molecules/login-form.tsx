'use client'

import * as React from 'react'
import { User } from 'lucide-react'

export function LoginForm({
  onSubmit,
}: {
  onSubmit?: (data: { email: string; password: string }) => void
}) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = { email, password }
    onSubmit?.(data)
    console.log('LoginForm submit', data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-base font-bold text-[#173F2A]">
          Email:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border px-4 py-3"
          required
        />
      </div>

      <div>
        <label className="block text-base font-bold text-[#173F2A]">
          Password:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border px-4 py-3"
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-base rounded-md bg-[#1F5B3D] px-4 py-2 text-white hover:bg-[#1a4630] transition-colors"
          type="submit"
        >
          <User className="h-5 w-5" />
          Login
        </button>
        <a className="text-base text-slate-600 hover:underline" href="#">
          Forgot password?
        </a>
      </div>
    </form>
  )
}
