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

  '/citizen/my-credentials': {
    title: 'My Credentials',
    description: 'View and manage your issued digital credentials. ',
  },

  '/gov-admin': {
    title: 'Government Admin Dashboard',
    description: 'Manage credentials, users, and platform oversight.',
  },

  '/gov-admin/upload-institution': {
    title: 'Upload Institution',
    description: 'Register or upload an institution to the FlashID platform.',
  },

  '/gov-admin/view-institutions': {
    title: 'View Institutions',
    description:
      'Browse and search all registered institutions on the FlashID platform.',
  },
}

export const defaultPageHeader: PageHeader = {
  title: 'FlashID Portal',
  description: 'Secure digital identity management.',
}
