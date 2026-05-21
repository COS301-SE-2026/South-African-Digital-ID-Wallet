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

  '/gov-admin/upload-institution': {
    title: 'Upload Institution',
    description: 'Register or upload an institution to the FlashID platform.',
  },

  '/gov-admin/register-admin': {
    title: 'Register Administrator',
    description: 'Create a new government administrator account.',
  },
}

export const defaultPageHeader: PageHeader = {
  title: 'FlashID Portal',
  description: 'Secure digital identity management.',
}
