export type VerifyCertifiedCopySearchParams = {
  status?: string
  name?: string
  id?: string
}
export type VerifyCertifiedCopyPageProps = {
  searchParams: Promise<VerifyCertifiedCopySearchParams>
}