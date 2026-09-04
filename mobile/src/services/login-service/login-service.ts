import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import { loginDto, verifyDeviceDto } from './login-dto'
import loginUrls from './login-urls'
import type {
  LoginFormValues,
  LoginResponse,
  VerifyDeviceRequest,
} from './types'

const login = (formData: LoginFormValues) => {
  const url = loginUrls.login()
  const dto = loginDto(formData)
  return api
    .post(url, dto)
    .then((res: AxiosResponse<LoginResponse>) => res.data)
}

const verifyDevice = (request: VerifyDeviceRequest) =>
  api
    .post(loginUrls.verifyDevice(), verifyDeviceDto(request))
    .then((res: AxiosResponse<LoginResponse>) => res.data)

const logout = () => api.post(loginUrls.logout()).then((res) => res.data)

const loginService = { login, logout, verifyDevice }

export default loginService
