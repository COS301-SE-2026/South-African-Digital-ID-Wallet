import { InvalidCertifiedCopy } from '@/components/organisms/invalid-certified-copy'
import { ValidCertifiedCopy } from '@/components/organisms/valid-certified-copy'
import certifiedCopyService from '@/services/certified-copy-service/certified-copy-service'
import type { VerifyCertifiedCopyPageProps } from './types'

export async function VerifyCertifiedCopyPage({
  verificationToken,
}: Readonly<VerifyCertifiedCopyPageProps>) {
  const result = await certifiedCopyService
    .verify(verificationToken)
    .catch(() => null)
  if (verificationToken) {
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
}
