const apiUrl = process.env.Next_PUBLIC_API_URL ?? 'http://localhost:5118'

const credentialUrls = {
  getMine: (): string => `${apiUrl}/api/credentials/me`,
}

export default credentialUrls
