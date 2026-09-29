import { VerifyCertifiedCopyPage } from '@/components/pages/verify-certified-copy'

export const dynamic = 'force-dynamic'
export default function PublicVerifyCertifiedCopyRoute({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    name?: string
    id?: string
  }>
}) {
  return <VerifyCertifiedCopyPage searchParams={searchParams} />
}
