const apiUrl = process.env.NEXT_PUBLIC_API_URL

const institutionUrls = {
  register: (): string => `${apiUrl}/api/institutions/register`,
  getAll: (): string => `${apiUrl}/api/institutions`,
  getById: (id: string): string => `${apiUrl}/api/institutions/${id}`,
}

export default institutionUrls
