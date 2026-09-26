const certifiedCopyUrls = {
  generate: (credentialId: string): string =>
    `/api/certified-copies/credentials/${encodeURIComponent(credentialId)}`,
}

export default certifiedCopyUrls
