const offlineUrls = {
  package: (credentialId: string) =>
    `/api/credentials/${encodeURIComponent(credentialId)}/offline-package`,
  issuerKeys: () => '/api/credentials/issuer-keys',
}

export default offlineUrls
