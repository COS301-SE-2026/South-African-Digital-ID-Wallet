import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import { registerDto, resendOtpDto, verifyEmailDto } from './register-dto'
import registerUrls from './register-urls'
import type {
  RegisterFormValues,
  RegisterResponse,
  VerifyEmailRequest,
} from './types'

const register = (formData: RegisterFormValues) =>
  api
    .post(registerUrls.register(), registerDto(formData))
    .then((res: AxiosResponse<RegisterResponse>) => res.data)

const verifyEmail = (request: VerifyEmailRequest) =>
  api
    .post(registerUrls.verifyEmail(), verifyEmailDto(request))
    .then((res) => res.data)

const resendOtp = (email: string) =>
  api
    .post(registerUrls.resendOtp(), resendOtpDto(email))
    .then((res) => res.data)

const registerService = { register, resendOtp, verifyEmail }

export default registerService
