export default {
  onboardCitizen: (): string => '/api/onboarding/citizen',

  retrieveIdentityRecord: (idNumber: string): string =>
    `/api/onboarding/verify/${idNumber}`,
}
