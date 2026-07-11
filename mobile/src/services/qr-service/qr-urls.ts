const qrUrls = {
  generate: (credentialId: string) =>
    `/api/credentials/${credentialId}/qr-token`,
}

export default qrUrls
