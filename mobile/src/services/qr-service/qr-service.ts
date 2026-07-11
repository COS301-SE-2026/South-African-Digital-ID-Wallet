import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import qrUrls from './qr-urls'
import { GenerateQrRequest, GenerateQrResponse } from './types'

const generate = (credentialId: string, disclosedFields: string[]) => {
  const url = qrUrls.generate(credentialId)
  const dto: GenerateQrRequest = { disclosedFields }
  return api
    .post(url, dto)
    .then((res: AxiosResponse<GenerateQrResponse>) => res.data)
}

const qrService = { generate }
export default qrService
