import { InvalidCertifiedCopy } from '@/components/organisms/invalid-certified-copy'
import { ValidCertifiedCopy } from '@/components/organisms/valid-certified-copy'
import type { VerifyCertifiedCopyPageProps } from './types'

export async function VerifyCertifiedCopyPage({
  searchParams,
}: Readonly<VerifyCertifiedCopyPageProps>) {
  const params = await searchParams
  const status = params.status?.toLowerCase()
  const isInvalid =
    status === 'invalid' ||
    status === 'failed' ||
    status === 'fail'

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