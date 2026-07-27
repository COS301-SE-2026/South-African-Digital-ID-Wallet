import { registerDto } from '../register-dto'
import { registerFormModel, RegisterBackendRow } from '../register-model'
import registerUrls from '../register-urls'
import registerService from '../register-service'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}))

import api from '@/lib/api'

describe('registerDto', () => {
  it('maps RegisterFormValues to backend DTO shape', () => {
    const result = registerDto({
      email: 'example@example.com',
      password: 'S3curep@ssword',
    })
    expect(result).toEqual({
      Email: 'example@example.com',
      Password: 'S3curep@ssword',
    })
  })
})

describe('registerFormModel', () => {
  it('maps RegisterBackendRow to RegisterFormValues', () => {
    const row: RegisterBackendRow = {
      Email: 'example@example.com',
      Password: 'S3curep@ssword',
    }
    const result = registerFormModel(row)
    expect(result).toEqual({
      email: 'example@example.com',
      password: 'S3curep@ssword',
    })
  })
})

describe('registerUrls', () => {
  it('citizenRegistration returns correct URL', () => {
    expect(registerUrls.citizenRegistration()).toBe('/api/citizens/register')
  })
  it('verifyEmail returns correct URL', () => {
    expect(registerUrls.verifyEmail()).toBe('/api/citizens/verify-email')
  })
  it('resendOtp returns correct URL', () => {
    expect(registerUrls.resendOtp()).toBe('/api/citizens/resend-otp')
  })
})

describe('registerService', () => {
  let mockPost: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockPost = api.post as jest.Mock
  })

  it('register posts to the correct URL with the mapped DTO', async () => {
    const mockData = {
      userId: '1',
      email: 'example@example.com',
      createdAt: '2026',
      message: 'hola',
    }
    mockPost.mockResolvedValue({
      data: mockData,
    })

    const result = await registerService.register({
      email: 'example@example.com',
      password: 'S3curep@ssword',
    })

    expect(mockPost).toHaveBeenCalledWith('/api/citizens/register', {
      Email: 'example@example.com',
      Password: 'S3curep@ssword',
    })
    expect(result).toEqual(mockData)
  })

  it('verifyEmail posts to the correct URL with Email and OTP', async () => {
    const mockData = {
      success: true,
    }
    mockPost.mockResolvedValue({
      data: mockData,
    })

    const result = await registerService.verifyEmail({
      email: 'example@example.com',
      code: '654321',
    })

    expect(mockPost).toHaveBeenCalledWith('/api/citizens/verify-email', {
      Email: 'example@example.com',
      OTP: '654321',
    })
    expect(result).toEqual(mockData)
  })

  it('resendOtp posts to the correct URL with Email', async () => {
    const mockData = {
      success: true,
    }
    mockPost.mockResolvedValue({
      data: mockData,
    })

    const result = await registerService.resendOtp('example@example.com')

    expect(mockPost).toHaveBeenCalledWith('/api/citizens/resend-otp', {
      Email: 'example@example.com',
    })
    expect(result).toEqual(mockData)
  })
})
