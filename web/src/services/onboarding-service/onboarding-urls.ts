const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default {
  onboardCitizen: (): string => `${apiUrl}/api/onboarding/citizen`,

  retrieveIdentityRecord: (idNumber: string): string =>
    `${apiUrl}/api/onboarding/verify/${idNumber}`,
}
