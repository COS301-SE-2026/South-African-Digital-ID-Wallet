const qrUrls = {
  generate: (credentialId: string): string =>
    `/api/credentials/${credentialId}/qr-token`,
}

export default qrUrls
