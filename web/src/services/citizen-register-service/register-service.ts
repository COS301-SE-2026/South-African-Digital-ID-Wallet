// import axios, { AxiosResponse } from 'axios'
import api from '@/lib/api'
import registerUrls from './register-urls'
import { registerDto } from './register-dto'
import type { RegisterFormValues, RegisterResponse } from './types'

const register = (formData: RegisterFormValues): Promise<RegisterResponse> => {
  const url = registerUrls.citizenRegistration()
  const dto = registerDto(formData)
  return api.post(url, dto).then((res) => res.data as RegisterResponse)
}

export default {
  register,
}
