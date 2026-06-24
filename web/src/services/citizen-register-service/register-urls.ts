const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default {
  citizenRegistration: (): string => `${apiUrl}/api/citizens/register`,
}
