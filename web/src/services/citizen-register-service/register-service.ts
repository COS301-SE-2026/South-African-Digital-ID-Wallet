import axios, { AxiosResponse } from 'axios'

import registerUrls from './register-urls'
import { registerDto } from './register-dto'
import { RegisterFormValues } from './types'

const register = (formData: RegisterFormValues) => {
  const url = registerUrls.citizenRegistration()
  const dto = registerDto(formData)
  return axios.post(url, dto).then((res: AxiosResponse) => res.data)
}

export default {
  register,
}
