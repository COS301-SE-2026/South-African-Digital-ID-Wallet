const institutionUrls = {
  register: (): string => '/api/institutions/register',
  getAll: (): string => '/api/institutions',
  getById: (id: string): string => `/api/institutions/${id}`,
  revealApiKey: (token: string): string =>
    `/api/institutions/reveal-key?token=${encodeURIComponent(token)}`,
  regenerateApiKey: (institutionId: string): string =>
    `/api/institutions/${institutionId}/regenerate-key`,
}

export default institutionUrls
