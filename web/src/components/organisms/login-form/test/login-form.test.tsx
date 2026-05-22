import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from '@/components/organisms'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />, { wrapper: createWrapper() })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('calls onSubmitAction with email and password on submit', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<LoginForm onSubmitAction={onSubmit} />, {
      wrapper: createWrapper(),
    })

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123',
    })
  })

  it('does not call onSubmitAction when fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<LoginForm onSubmitAction={onSubmit} />, {
      wrapper: createWrapper(),
    })

    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
