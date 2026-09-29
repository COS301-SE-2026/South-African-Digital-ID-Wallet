import { useMutation } from '@tanstack/react-query'

import { qrService } from '@/services/qr-service'

type GenerateVariables = {
  credentialId: string
  disclosedFields: string[]
}

export const useQrToken = () => {
  const { data, error, isPending, mutate, reset } = useMutation({
    mutationFn: ({ credentialId, disclosedFields }: GenerateVariables) =>
      qrService.generate(credentialId, disclosedFields),
  })
  return {
    error,
    generate: mutate,
    isGenerating: isPending,
    reset,
    token: data ?? null,
  }
}
