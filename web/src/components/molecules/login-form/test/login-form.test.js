import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()
const mockSetUser = jest.fn()
const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/context/user-context', () => ({
  useUser: () => ({ setUser: mockSetUser }),
}))

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args),
  },
}))

import { LoginForm } from '../login-form'
import { loginService } from '@/services/login-service'

describe('LoginForm', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockSetUser.mockReset()
    mockToastSuccess.mockReset()
    mockToastError.mockReset()
    jest.restoreAllMocks()
  })

  it('routes citizens to the citizen dashboard', async () => {
    jest.spyOn(loginService, 'login').mockResolvedValue({
      userId: '1',
      role: 'Citizen',
      names: 'Jane',
      surname: 'Doe',
    })

    const user = userEvent.setup()
    render(React.createElement(LoginForm))

    await user.type(screen.getByLabelText(/email/i), 'citizen@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/citizen')
    })
  })

  it('routes officials to the officials dashboard', async () => {
    jest.spyOn(loginService, 'login').mockResolvedValue({
      userId: '2',
      role: 'Official',
      names: 'John',
      surname: 'Smith',
    })

    const user = userEvent.setup()
    render(React.createElement(LoginForm))

    await user.type(screen.getByLabelText(/email/i), 'official@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/officials')
    })
  })

  it('routes government admins to the gov admin dashboard', async () => {
    jest.spyOn(loginService, 'login').mockResolvedValue({
      userId: '3',
      role: 'GovernmentAdministrator',
      names: 'Ada',
      surname: 'Ndlovu',
    })

    const user = userEvent.setup()
    render(React.createElement(LoginForm))

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/gov-admin')
    })
  })
})
