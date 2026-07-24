import { AxiosResponse } from 'axios'
import api from '@/lib/api'

import credentialUrls from './credentialo-urls'
import type { CredentialResponse } from './types'

const getMine = (): Promise<CredentialResponse[]> => {
  const url = credentialUrls.getMine()
  return api
    .get(url)
    .then((res: AxiosResponse<CredentialResponse[]>) => res.data)
}

const credentialService = { getMine }

export default credentialService
