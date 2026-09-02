const credentialUrls = {
  getMine: (): string => `/api/credentials/me`,
  revoke: (credentialId: string): string =>
    `/api/credentials/${credentialId}/revoke`,
  reinstate: (credentialId: string): string =>
    `/api/credentials/${credentialId}/reinstate`,
  search: (query: string, page: number, pageSize: number): string =>
    `/api/credentials/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
  citizen: (citizenId: string): string =>
    `/api/credentials/citizen/${citizenId}`,
}

export default credentialUrls
