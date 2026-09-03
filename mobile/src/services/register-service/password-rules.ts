export const PASSWORD_RULES = [
  {
    label: 'At least 10 characters',
    test: (value: string) => value.length >= 10,
  },
  {
    label: 'One uppercase letter (A-Z)',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: 'One lowercase letter (a-z)',
    test: (value: string) => /[a-z]/.test(value),
  },
  { label: 'One digit (0-9)', test: (value: string) => /\d/.test(value) },
  {
    label: 'One special character (!@#$%^&*)',
    test: (value: string) => /[!@#$%^&*_+\-=.<>?~]/.test(value),
  },
] as const

export const checkPassword = (value: string) =>
  PASSWORD_RULES.map(({ label, test }) => ({ label, met: test(value) }))
