import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import toast from 'react-hot-toast'
import axios, { isAxiosError } from 'axios'
import { OtpModal } from '../otp-modal'
import { loginService } from '@/services'

jest.mock('@/services', () => ({
  loginService: {
    resendDeviceVerificationOtp: jest.fn(),
  },
}))

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

jest.mock('axios', () => ({
  isAxiosError: jest.fn(),
}))

describe('OtpModal', () => {
  const onClose = jest.fn()
  const onSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderModal = (deviceVerificationId = 'verification-id') =>
    render(
      <OtpModal
        open
        onClose={onClose}
        onSuccess={onSuccess}
        deviceVerificationId={deviceVerificationId}
      />
    )

  const enterOtp = () => {
    const inputs = screen.getAllByRole('textbox')

    inputs.forEach((input, index) => {
      fireEvent.change(input, {
        target: { value: String(index + 1) },
      })
    })
  }
})
