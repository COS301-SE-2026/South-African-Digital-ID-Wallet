export default {
  citizenStatus: (saId: string): string =>
    `/api/credentials/citizens/${saId}/status`,
  issueCredential: (): string => '/api/credentials/issue',
}
