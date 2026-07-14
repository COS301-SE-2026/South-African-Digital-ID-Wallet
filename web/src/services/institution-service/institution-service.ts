import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import institutionUrls from './institution-urls'
import { registerInstitutionDto } from './institution-dto'
import { RegisterInstitutionFormValues } from './types'

const register = (formData: RegisterInstitutionFormValues) => {
  const url = institutionUrls.register()
  const dto = registerInstitutionDto(formData)
  return api.post(url, dto).then((res: AxiosResponse) => res.data)
}

const getAll = () => {
  const url = institutionUrls.getAll()
  return api.get(url).then((res: AxiosResponse) => res.data)
}

const institutionService = { register, getAll }

export default institutionService
