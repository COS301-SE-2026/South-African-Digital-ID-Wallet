import { VerifyCertifiedCopyPage } from '@/components/pages/verify-certified-copy'

export const dynamic = 'force-dynamic'
type VerifyCertifiedCopyRouteProps = {
  params: Promise<{
    verificationToken: string
  }>
}
export default async function PublicVerifyCertifiedCopyRoute({
  params,
}: VerifyCertifiedCopyRouteProps) {
  const { verificationToken } = await params
  return (
    <VerifyCertifiedCopyPage
      verificationToken={verificationToken}
    />
  )
}