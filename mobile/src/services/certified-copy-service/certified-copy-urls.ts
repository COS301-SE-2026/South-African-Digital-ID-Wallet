const certifiedCopyUrls = {
  generate: (credentialId: string): string =>
    `/api/certified-copies/credentials/${credentialId}`,
}

export default certifiedCopyUrls
