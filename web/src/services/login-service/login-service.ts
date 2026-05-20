import api from '@/lib/api'
import loginUrls from './login-urls'
import { loginDto } from './login-dto'
import type { LoginFormValues, LoginResponse } from './types'

const login = (formData: LoginFormValues): Promise<LoginResponse> => {
  const url = loginUrls.login()
  const dto = loginDto(formData)
  return api.post(url, dto).then((res) => res.data as LoginResponse)
}

const getUser = (id: number) => {
  const url = loginUrls.getUser(id)
  return api.get(url).then((res) => res.data)
}

export default {
  login,
  getUser,
}
