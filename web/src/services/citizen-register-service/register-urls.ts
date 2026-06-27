const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5118'

export default {
  citizenRegistration: (): string => `${apiUrl}/api/citizens/register`,
}
