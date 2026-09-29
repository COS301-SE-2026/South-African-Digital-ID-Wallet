import { InvalidCertifiedCopy } from '@/components/organisms/invalid-certified-copy'
import { ValidCertifiedCopy } from '@/components/organisms/valid-certified-copy'
import certifiedCopyService from '@/services/certified-copy-service/certified-copy-service'
import type { VerifyCertifiedCopyPageProps } from './types'

export async function VerifyCertifiedCopyPage({
  verificationToken,
  searchParams,
}: Readonly<VerifyCertifiedCopyPageProps>) {
  if (verificationToken) {
    let result = null
    try {
      result = await certifiedCopyService.verify(verificationToken)
    } catch {}

    if (!result?.isValid) {
      return <InvalidCertifiedCopy />
    }
    return (
      <ValidCertifiedCopy
        citizenName={result.fullName}
        maskedId={result.idNumber}
      />
    )
  }

  const params = searchParams ? await searchParams : {}
  const status = params.status?.toLowerCase()
  const isInvalid =
    status === 'invalid' || status === 'failed' || status === 'fail'

  if (isInvalid) {
    return <InvalidCertifiedCopy />
  }
  return (
    <ValidCertifiedCopy
      citizenName={params.name || 'Kayla Patel'}
      maskedId={params.id || '9000 ••••••• 000'}
    />
  )
}
