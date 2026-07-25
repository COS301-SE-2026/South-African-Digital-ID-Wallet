import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import scanUrls from './scan-urls'
import {
  ResolveCredentialResponse,
  VerifyBadgeResponse,
  GenerateBadgeTokenResponse,
} from './types'

const resolveCred = (token: string): Promise<ResolveCredentialResponse> => {
  const url = scanUrls.resolve()
  return api
    .post(url, { token })
    .then((res: AxiosResponse<ResolveCredentialResponse>) => res.data)
}

const verifyBadge = (token: string): Promise<VerifyBadgeResponse> => {
  const url = scanUrls.verifyBadge()
  return api
    .post(url, { token })
    .then((res: AxiosResponse<VerifyBadgeResponse>) => res.data)
}

const generateBadgeToken = (): Promise<GenerateBadgeTokenResponse> => {
  const url = scanUrls.badgeToken()
  return api
    .post(url)
    .then((res: AxiosResponse<GenerateBadgeTokenResponse>) => res.data)
}

export default {
  resolveCred,
  verifyBadge,
  generateBadgeToken,
}
