const certifiedCopyUrls = {
  generate: (credentialId: string): string =>
    `/api/certified-copies/credentials/${encodeURIComponent(credentialId)}`,
  verify: (verificationToken: string): string =>
    `/api/certified-copies/verify/${encodeURIComponent(verificationToken)}`,
  verifyDocument: (): string =>
    '/api/certified-copies/verify-document',
}
export default certifiedCopyUrls