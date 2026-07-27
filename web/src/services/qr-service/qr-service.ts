import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import qrUrls from './qr-urls'
import {
  GenerateQrRequest,
  GenerateQrResponse,
  CredentialSummary,
} from './types'

const generate = (
  credentialId: string,
  disclosedFields: string[]
): Promise<GenerateQrResponse> => {
  const url = qrUrls.generate(credentialId)
  const dto: GenerateQrRequest = { disclosedFields }

  return api
    .post(url, dto)
    .then((res: AxiosResponse<GenerateQrResponse>) => res.data)
}

const getMine = (): Promise<CredentialSummary[]> => {
  const url = qrUrls.mine()

  return api
    .get(url)
    .then((res: AxiosResponse<CredentialSummary[]>) => res.data)
}

export default {
  generate,
  getMine,
}
