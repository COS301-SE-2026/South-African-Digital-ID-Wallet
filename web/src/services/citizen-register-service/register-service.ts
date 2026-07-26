import api from '@/lib/api'
import registerUrls from './register-urls'
import { registerDto } from './register-dto'
import type {
  RegisterFormValues,
  RegisterResponse,
  VerifyEmailValues,
} from './types'

const register = async (
  formData: RegisterFormValues
): Promise<RegisterResponse> => {
  const url = registerUrls.citizenRegistration()
  const dto = registerDto(formData)
  const res = await api.post(url, dto)
  return res.data as RegisterResponse
}

const verifyEmail = async (values: VerifyEmailValues) => {
  const res = await api
    .post(registerUrls.verifyEmail(), {
      Email: values.email,
      OTP: values.code,
    })
    .then((res) => res.data)
  return res
}

const resendOtp = async (email: string) => {
  const res = await api
    .post(registerUrls.resendOtp(), { Email: email })
    .then((res) => res.data)
  return res
}

export default {
  register,
  verifyEmail,
  resendOtp,
}
