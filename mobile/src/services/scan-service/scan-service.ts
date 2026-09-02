import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import scanUrls from './scan-urls'
import type { ResolveCredentialResponse } from './types'

const resolveCredential = (token: string) =>
  api
    .post(scanUrls.resolve(), { token })
    .then((res: AxiosResponse<ResolveCredentialResponse>) => res.data)

const scanService = { resolveCredential }

export default scanService
