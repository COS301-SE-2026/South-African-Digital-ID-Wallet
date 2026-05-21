'use client'

import * as React from 'react'
import { User } from 'lucide-react'
import { Button } from '@/components/atoms'
import type { LoginFormProps } from '@/types/login-form.types'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import loginService from '@/services/login-service/login-service'
import { useUser } from '@/context/user-context'

const DASHBOARD_ROUTES: Record<string, string> = {
  citizen: '/citizen',
  official: '/officials',
  governmentadministrator: '/gov-admin',
  govadmin: '/gov-admin',
}

const getDashboardRoute = (role: string) => {
  const normalizedRole = role
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, '')

  return DASHBOARD_ROUTES[normalizedRole] ?? '/citizen'
}

export const LoginForm = ({ onSubmitAction }: Readonly<LoginFormProps>) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const router = useRouter()
  const { setUser } = useUser()

  const loginMutation = useMutation<
    Awaited<ReturnType<typeof loginService.login>>,
    Error,
    { email: string; password: string }
  >({
    mutationFn: (formValues: { email: string; password: string }) =>
      loginService.login(formValues),
    onSuccess: async (data) => {
      toast.success('Logged in')
      setUser({
        userId: data.userId,
        email,
        role: data.role,
        names: data.names,
        surname: data.surname,
      })
      router.push(getDashboardRoute(data.role))
    },
    onError: () => {
      toast.error('Login failed')
    },
  })

  const isLoading = loginMutation.status === 'pending'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = { email, password }
    onSubmitAction?.(data)
    loginMutation.mutate(data)
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
        <Button
          variant="primary"
          type="submit"
          LeftIcon={User}
          isLoading={isLoading}
        >
          Login
        </Button>
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
