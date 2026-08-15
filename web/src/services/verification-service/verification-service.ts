import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import verificationUrls from './verification-urls'
import { VerifyCitizenRequest, VerifyCitizenResponse } from './types'

const verify = (
  request: VerifyCitizenRequest
): Promise<VerifyCitizenResponse> => {
  const url = verificationUrls.verify()
  return api
    .post(url, request)
    .then((res: AxiosResponse<VerifyCitizenResponse>) => res.data)
}

export default {
  verify,
}
