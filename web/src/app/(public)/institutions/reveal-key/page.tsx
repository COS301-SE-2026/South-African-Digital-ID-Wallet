import { RevealApiKeyPage } from '@/components/pages/reveal-key/reveal-key-page'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return <RevealApiKeyPage token={token ?? ''} />
}
