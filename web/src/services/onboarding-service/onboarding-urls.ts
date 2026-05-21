const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default {
  onboardCitizen: (): string => `${apiUrl}/api/onboarding/citizens`,

  retrieveIdentityRecord: (idNumber: string): string =>
    `${apiUrl}/api/onboarding/identity-records/${idNumber}`,
}
