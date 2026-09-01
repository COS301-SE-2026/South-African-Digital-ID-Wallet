const credentialUrls = {
  getMine: (): string => `/api/credentials/me`,
  revoke: (credentialId: string): string =>
    `/api/credentials/${credentialId}/revoke`,
}

export default credentialUrls
