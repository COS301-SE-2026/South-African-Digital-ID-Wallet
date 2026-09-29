import { useMutation } from '@tanstack/react-query'

import { openPdf, savePdf } from '@/lib/pdf-file'
import {
  certifiedCopyService,
  type CertifiedCopyCredentialType,
} from '@/services/certified-copy-service'

type GenerateCertifiedCopyVariables = {
  credentialId: string
  credentialType: CertifiedCopyCredentialType
}

export const useCertifiedCopy = () => {
  const { error, isPending, mutate, reset } = useMutation({
    mutationFn: async ({
      credentialId,
      credentialType,
    }: GenerateCertifiedCopyVariables) => {
      const { bytes, fileName } = await certifiedCopyService.generate(
        credentialId,
        credentialType
      )
      const file = savePdf(bytes, fileName)
      await openPdf(file)
      return file.uri
    },
  })
  return { error, generate: mutate, isGenerating: isPending, reset }
}
