import * as React from 'react'

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
        <label className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          className="rounded-md bg-[#1F5B3D] text-white px-4 py-2"
          type="submit"
        >
          Sign in
        </button>
        <a className="text-sm text-slate-600 hover:underline" href="#">
          Forgot password?
        </a>
      </div>
    </form>
  )
}
