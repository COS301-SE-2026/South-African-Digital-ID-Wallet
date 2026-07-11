const qrUrls = {
  generate: (credentialId: string) =>
    `/api/credentials/${credentialId}/qr-token`,
  mine: () => '/api/credentials/mine',
}

export default qrUrls
