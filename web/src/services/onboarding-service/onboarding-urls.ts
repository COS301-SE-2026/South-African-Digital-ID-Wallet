const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default {
  onboardCitizen: (): string => `${apiUrl}/api/onboarding/citizens`,
}
