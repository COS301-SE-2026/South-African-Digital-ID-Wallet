import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import qrUrls from './qr-urls'
import type { GenerateQrRequest, GenerateQrResponse } from './types'

const generate = (credentialId: string, disclosedFields: string[]) => {
  const dto: GenerateQrRequest = { disclosedFields }
  return api
    .post(qrUrls.generate(credentialId), dto)
    .then((res: AxiosResponse<GenerateQrResponse>) => res.data)
}

const qrService = { generate }

export default qrService
