const verificationUrls = {
  verify: () => '/api/citizen-verification/activate-token',

  physical: {
    start: () => '/api/citizen-verification/physical',
    consent: (verificationId: string) =>
      `/api/citizen-verification/physical/${verificationId}/consent`,
    createLivenessSession: () =>
      '/api/citizen-verification/physical/liveness-session',
    completeLiveness: (verificationId: string) =>
      `/api/citizen-verification/physical/${verificationId}/liveness-result`,
    get: (verificationId: string) =>
      `/api/citizen-verification/physical/${verificationId}`,
  },
}

export default verificationUrls
