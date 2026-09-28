import type { AxiosResponse } from 'axios'
import api from '@/lib/api'
import certifiedCopyUrls from './certified-copy-urls'
import type {
  CertifiedCopyDocument,
  GenerateCertifiedCopyRequest,
} from './types'

const getFileName = (contentDisposition?: string): string => {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/i)
  return match?.[1] ?? 'certified-copy.pdf'
}

const generate = async (
  credentialId: string,
  request: GenerateCertifiedCopyRequest
): Promise<CertifiedCopyDocument> => {
  const response: AxiosResponse<Blob> = await api.post(
    certifiedCopyUrls.generate(credentialId),
    request,
    {
      headers: { Accept: 'application/pdf' },
      responseType: 'blob',
    }
  )

  return {
    blob: response.data,
    fileName: getFileName(response.headers['content-disposition']),
  }
}

const certifiedCopyService = { generate }

export default certifiedCopyService
