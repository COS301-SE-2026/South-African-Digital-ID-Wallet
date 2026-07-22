'use client'

import * as React from 'react'
import { User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/atoms'
import type { LoginFormProps } from '@/types/login-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import loginService from '@/services/login-service/login-service'
import { useUser } from '@/context/user-context'
import axios from 'axios'

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
  const [rememberMe, setRememberMe] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const router = useRouter()
  const { setUser } = useUser()

  const loginMutation = useMutation<
    Awaited<ReturnType<typeof loginService.login>>,
    Error,
    { email: string; password: string; rememberMe: boolean }
  >({
    mutationFn: (formValues: {
      email: string
      password: string
      rememberMe: boolean
    }) => loginService.login(formValues),
    onSuccess: async (data) => {
      toast.success('Logged in')
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'flashid-session-expires-at',
          data.expiresAt
        )
      }
      setUser({
        userId: data.userId,
        email,
        role: data.role,
        names: data.names,
        surname: data.surname,
      })
      router.push(getDashboardRoute(data.role))
    },
    onError: (err) => {
      if (
        axios.isAxiosError(err) &&
        err.response?.data?.code === 'EMAIL_NOT_VERIFIED'
      ) {
        toast.error('Please verify your email address to continue.')
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
        return
      }
      toast.error('Login failed')
    },
  })

  const isLoading = loginMutation.status === 'pending'

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (
    e
  ) => {
    e.preventDefault()
    const data = { email, password, rememberMe }
    onSubmitAction?.(data)
    loginMutation.mutate(data)
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
        <div className="relative mt-1">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border-grey px-4 py-3 pr-12 text-base focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-text transition-colors hover:text-primary-green"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-border-grey"
        />
        <label htmlFor="rememberMe" className="text-base text-primary-green">
          Remember me
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          type="submit"
          LeftIcon={User}
          isLoading={isLoading}
          className="w-full lg:w-full"
        >
          Login
        </Button>

        <div className="space-y-1 text-center text-base text-primary-green">
          <a className="block hover:text-deep-green hover:underline" href="#">
            Forgot password?
          </a>

          <p>
            Don&apos;t have an account?{' '}
            <Link
              className="font-semibold hover:text-deep-green hover:underline"
              href="/register"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </form>
  )
}
