import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import credentialUrls from './credential-urls'
import type {
  CredentialResponse,
  RevokeCredentialRequest,
  RevokeCredentialResponse,
} from './types'

const getMine = (): Promise<CredentialResponse[]> => {
  const url = credentialUrls.getMine()
  return api
    .get(url)
    .then((res: AxiosResponse<CredentialResponse[]>) => res.data)
}

const revoke = (
  credentialId: string,
  request: RevokeCredentialRequest
): Promise<RevokeCredentialResponse> => {
  const url = credentialUrls.revoke(credentialId)
  return api
    .post(url, request)
    .then((res: AxiosResponse<RevokeCredentialResponse>) => res.data)
}

const credentialService = { getMine, revoke }

export default credentialService
