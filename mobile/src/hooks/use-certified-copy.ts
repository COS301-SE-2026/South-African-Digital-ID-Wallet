import { useMutation } from '@tanstack/react-query'

import { openPdf, savePdf } from '@/lib/pdf-file'
import { certifiedCopyService } from '@/services/certified-copy-service'

export const useCertifiedCopy = () => {
  const { error, isPending, mutate, reset } = useMutation({
    mutationFn: async (credentialId: string) => {
      const { bytes, fileName } =
        await certifiedCopyService.generate(credentialId)
      const file = savePdf(bytes, fileName)
      await openPdf(file)
      return file.uri
    },
  })
  return { error, generate: mutate, isGenerating: isPending, reset }
}
