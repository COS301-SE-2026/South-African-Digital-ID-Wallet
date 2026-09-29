const institutionUrls = {
  register: (): string => '/api/institutions/register',
  getAll: (): string => '/api/institutions',
  getById: (id: string): string => `/api/institutions/${id}`,
}

export default institutionUrls
