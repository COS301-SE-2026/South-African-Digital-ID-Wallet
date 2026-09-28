export type VerifyCertifiedCopySearchParams = {
  status?: string
  name?: string
  id?: string
}
export type VerifyCertifiedCopyPageProps = {
  verificationToken?: string
  searchParams?: Promise<VerifyCertifiedCopySearchParams>
}