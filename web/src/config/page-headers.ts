export type PageHeader = {
  title: string
  description: string
}

export const pageHeaders: Record<string, PageHeader> = {
  '/officials': {
    title: 'Officials Dashboard',
    description: 'View and manage official FlashID tasks.',
  },

  '/officials/onboard-citizen': {
    title: 'Onboard Citizen',
    description:
      'Verify a citizen, capture consent, and create a pending FlashID account.',
  },

  '/citizen': {
    title: 'Citizen Dashboard',
    description: 'View and manage your digital identity wallet.',
  },

  '/gov-admin': {
    title: 'Government Admin Dashboard',
    description: 'Manage credentials, users, and platform oversight.',
  },
}

export const defaultPageHeader: PageHeader = {
  title: 'FlashID Portal',
  description: 'Secure digital identity management.',
}
