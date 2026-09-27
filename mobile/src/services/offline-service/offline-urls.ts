const offlineUrls = {
  package: (credentialId: string) =>
    `/api/credentials/${encodeURIComponent(credentialId)}/offline-package`,
  issuerKeys: () => '/api/credentials/issuer-keys',
  revocationList: () => '/api/credentials/revocation-list',
  offlineVerifications: () => '/api/credentials/offline-verifications',
}

export default offlineUrls
