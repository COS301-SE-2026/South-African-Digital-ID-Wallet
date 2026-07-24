import VerifyCitizen from '@/components/pages/activation/verify-citizen-page'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return <VerifyCitizen token={token ?? ''} />
}
