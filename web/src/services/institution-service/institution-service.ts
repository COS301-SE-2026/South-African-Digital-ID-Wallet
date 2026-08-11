import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import institutionUrls from './institution-urls'
import { registerInstitutionDto } from './institution-dto'
import {
  RegisterInstitutionFormValues,
  RevealApiKeyResponse,
  RegenerateApiKeyResponse,
} from './types'

const register = (formData: RegisterInstitutionFormValues) => {
  const url = institutionUrls.register()
  const dto = registerInstitutionDto(formData)
  return api.post(url, dto).then((res: AxiosResponse) => res.data)
}

const getAll = () => {
  const url = institutionUrls.getAll()
  return api.get(url).then((res: AxiosResponse) => res.data)
}

const revealApiKey = (token: string): Promise<RevealApiKeyResponse> => {
  const url = institutionUrls.revealApiKey(token)
  return api
    .get(url)
    .then((res: AxiosResponse<RevealApiKeyResponse>) => res.data)
}
const regenerateApiKey = (
  institutionId: string
): Promise<RegenerateApiKeyResponse> => {
  const url = institutionUrls.regenerateApiKey(institutionId)
  return api
    .post(url)
    .then((res: AxiosResponse<RegenerateApiKeyResponse>) => res.data)
}

const institutionService = { register, getAll, revealApiKey, regenerateApiKey }

export default institutionService
