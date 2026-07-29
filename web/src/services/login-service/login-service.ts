import api from '@/lib/api'
import loginUrls from './login-urls'
import { loginDto, verifyDeviceDto } from './login-dto'
import type {
  LoginFormValues,
  LoginResponse,
  VerifyDeviceRequest,
} from './types'

const login = (formData: LoginFormValues): Promise<LoginResponse> => {
  const url = loginUrls.login()
  const dto = loginDto(formData)
  return api.post(url, dto).then((res) => res.data as LoginResponse)
}

const getUser = (id: number) => {
  const url = loginUrls.getUser(id)
  return api.get(url).then((res) => res.data)
}

const logout = () => {
  return api.post('/api/auth/logout').then((res) => res.data)
}

const verifyDeviceRequest = async (
  request: VerifyDeviceRequest,
  formData: LoginFormValues
): Promise<LoginResponse> => {
  const url = loginUrls.verifyDevice()
  const dto = verifyDeviceDto(request, formData)
  return api.post(url, dto).then((res) => res.data as LoginResponse)
}

const loginService = {
  login,
  getUser,
  logout,
}

export default loginService
