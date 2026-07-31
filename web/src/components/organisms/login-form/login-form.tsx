'use client'

import * as React from 'react'
import { User, Eye, EyeOff } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/atoms'
import { useUser } from '@/context/user-context'
import loginService from '@/services/login-service/login-service'
import { OtpModal } from '@/components/templates/otp-modal/otp-modal'
import type { LoginFormProps } from '@/types/login-form'

const DASHBOARD_ROUTES: Record<string, string> = {
  citizen: '/citizen/citizen-dashboard',
  official: '/officials',
  governmentadministrator: '/gov-admin',
  govadmin: '/gov-admin',
}

const getDashboardRoute = (role: string) => {
  const normalizedRole = role
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, '')

  return DASHBOARD_ROUTES[normalizedRole] ?? '/citizen/citizen-dashboard'
}

export function getSafeReturnTo(returnTo: string | null, fallback: string) {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return fallback
  }
  return returnTo
}

export const LoginForm = ({ onSubmitAction }: Readonly<LoginFormProps>) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [otpModalOpen, setOtpModalOpen] = React.useState(false)
  const [loginAttemptId, setLoginAttemptId] = React.useState('')

  const router = useRouter()
  const { refresh } = useUser()

  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const safeReturnTo = getSafeReturnTo(returnTo, '')

  const registerHref = safeReturnTo
    ? `/register?returnTo=${encodeURIComponent(safeReturnTo)}`
    : '/register'

  const loginMutation = useMutation<
    Awaited<ReturnType<typeof loginService.login>>,
    Error,
    {
      email: string
      password: string
      rememberMe: boolean
    }
  >({
    mutationFn: (formValues) => loginService.login(formValues),

    onSuccess: async (data) => {
      toast.success('Logged in')

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'flashid-session-expires-at',
          data.expiresAt
        )
      }

      await refresh()
      const dashboardRoute = getDashboardRoute(data.role)
      const destination = getSafeReturnTo(returnTo, dashboardRoute)
      router.push(destination)
    },

    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const code = err.response?.data?.code

        if (code === 'EMAIL_NOT_VERIFIED') {
          toast.error('Please verify your email address to continue.')

          const verifyEmailHref = safeReturnTo
            ? `/verify-email?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(safeReturnTo)}`
            : `/verify-email?email=${encodeURIComponent(email)}`

          router.push(verifyEmailHref)
          return
        }

        if (code === 'NEW_DEVICE' && err.response?.data?.loginAttemptId) {
          setLoginAttemptId(err.response.data.loginAttemptId)
          setOtpModalOpen(true)
          return
        }
      }

      toast.error('Login failed')
    },
  })

  const isLoading = loginMutation.status === 'pending'

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (
    e
  ) => {
    e.preventDefault()

    const data = {
      email,
      password,
      rememberMe,
    }

    onSubmitAction?.(data)
    loginMutation.mutate(data)
  }

  const handleOtpSuccess = () => {
    router.push(getDashboardRoute('citizen'))
  }

  return (
    <>
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
            required
            className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 text-base focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
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
              required
              className="w-full rounded-md border border-border-grey px-4 py-3 pr-12 text-base focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
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
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <User className="h-4 w-4" />
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="space-y-1 text-center text-base text-primary-green">
            <a href="#" className="block hover:text-deep-green hover:underline">
              Forgot password?
            </a>

            <p>
              Don&apos;t have an account?{' '}
              <Link
                className="font-semibold hover:text-deep-green hover:underline"
                href={registerHref}
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </form>

      <OtpModal
        open={otpModalOpen}
        loginAttemptId={loginAttemptId}
        onClose={() => setOtpModalOpen(false)}
        onSuccess={handleOtpSuccess}
      />
    </>
  )
}
