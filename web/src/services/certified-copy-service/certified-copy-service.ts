import type { AxiosResponse } from 'axios'
import api from '@/lib/api'
import certifiedCopyUrls from './certified-copy-urls'
import type {
  CertifiedCopyDocument,
  GenerateCertifiedCopyRequest,
  VerifyCertifiedCopyDocumentResponse,
  VerifyCertifiedCopyResponse,
} from './types'
const getFileName = (contentDisposition?: string): string => {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i)

  return match?.[1] ?? 'certified-copy.pdf'
}
const generate = async (
  credentialId: string,
  request: GenerateCertifiedCopyRequest,
): Promise<CertifiedCopyDocument> => {
  const response: AxiosResponse<Blob> = await api.post(
    certifiedCopyUrls.generate(credentialId),
    request,
    {
      headers: {
        Accept: 'application/pdf',
      },
      responseType: 'blob',
    },
  )
  return {
    blob: response.data,
    fileName: getFileName(response.headers['content-disposition']),
  }
}
const verify = async (
  verificationToken: string,
): Promise<VerifyCertifiedCopyResponse> => {
  const response = await api.get<VerifyCertifiedCopyResponse>(
    certifiedCopyUrls.verify(verificationToken),
  )
  return response.data
}
const verifyDocument = async (
  document: File,
): Promise<VerifyCertifiedCopyDocumentResponse> => {
  const formData = new FormData()
  formData.append('document', document, document.name)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  const response = await fetch(
    `${apiUrl}${certifiedCopyUrls.verifyDocument()}`,
    {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    },
  )
  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      errorBody ||
        `Document verification failed with status ${response.status}`,
    )
  }
  return (await response.json()) as VerifyCertifiedCopyDocumentResponse
}
const certifiedCopyService = {
  generate,
  verify,
  verifyDocument,
}
export default certifiedCopyService