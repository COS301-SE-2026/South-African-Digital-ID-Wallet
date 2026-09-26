import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import { toCertifiedCopyFileName } from './certified-copy-dto'
import certifiedCopyUrls from './certified-copy-urls'
import type { CertifiedCopyDocument } from './types'

const generate = (credentialId: string): Promise<CertifiedCopyDocument> =>
  api
    .post(certifiedCopyUrls.generate(credentialId), undefined, {
      headers: { Accept: 'application/pdf' },
      responseType: 'arraybuffer',
    })
    .then((res: AxiosResponse<ArrayBuffer>) => ({
      bytes: new Uint8Array(res.data),
      fileName: toCertifiedCopyFileName(res.headers['content-disposition']),
    }))

const certifiedCopyService = { generate }

export default certifiedCopyService
