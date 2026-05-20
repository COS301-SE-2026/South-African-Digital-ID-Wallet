const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default {
  register: (): string => `${apiUrl}/api/institutions/register`,
  getAll: (): string => `${apiUrl}/api/institutions`,
  getById: (id: string): string => `${apiUrl}/api/institutions/${id}`,
}
