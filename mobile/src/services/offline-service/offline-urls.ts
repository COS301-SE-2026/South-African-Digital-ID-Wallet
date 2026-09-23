const offlineUrls = {
  package: (credentialId: string) =>
    `/api/credentials/${credentialId}/offline-package`,
  issuerKeys: () => '/api/credentials/issuer-keys',
}

export default offlineUrls
