import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import activateCredentialsUrls from './activate-credentials-urls'
import {
  ActivateCredentialsRequest,
  ActivateCredentialsResponse,
  CredentialType,
  CREDENTIAL_TYPE_MAP,
} from './types'

const activate = (
  selectedTypes: CredentialType[]
): Promise<ActivateCredentialsResponse> => {
  const url = activateCredentialsUrls.activate()
  const dto: ActivateCredentialsRequest = {
    credentialTypes: selectedTypes.map((type) => CREDENTIAL_TYPE_MAP[type]),
  }

  return api
    .post(url, dto)
    .then((res: AxiosResponse<ActivateCredentialsResponse>) => res.data)
}

export default {
  activate,
}
