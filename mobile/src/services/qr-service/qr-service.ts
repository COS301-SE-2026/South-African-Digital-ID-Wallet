import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import qrUrls from './qr-urls'
import {
  GenerateQrRequest,
  GenerateQrResponse,
  CredentialSummary,
} from './types'

const generate = (credentialId: string, disclosedFields: string[]) => {
  const url = qrUrls.generate(credentialId)
  const dto: GenerateQrRequest = { disclosedFields }
  return api
    .post(url, dto)
    .then((res: AxiosResponse<GenerateQrResponse>) => res.data)
}

const getMine = () => {
  const url = qrUrls.mine()
  return api
    .get(url)
    .then((res: AxiosResponse<CredentialSummary[]>) => res.data)
}

const qrService = { generate, getMine }
export default qrService
