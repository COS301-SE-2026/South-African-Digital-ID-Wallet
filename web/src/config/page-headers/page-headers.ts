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

  '/officials/issue-drivers-license': {
    title: "Issue Driver's Licence",
    description:
      "Look up a citizen, capture consent, and issue their driver's licence credential.",
  },

  '/officials/verifications': {
    title: 'Verifications',
    description: 'Scan secure QR Code to verify identitities and credentials.',
  },

  '/citizen': {
    title: 'Citizen Dashboard',
    description: 'View and manage your digital identity wallet.',
  },

  '/citizen/citizen-dashboard': {
    title: 'Citizen Dashboard',
    description: 'View and manage your digital identity wallet.',
  },

  '/citizen/verifications': {
    title: 'Verifications',
    description: 'Scan secure QR Code to verify identitities and credentials.',
  },

  '/citizen/qr': {
    title: 'Share QR codes',
    description:
      'Generate secure QR codes to share selected identity information.',
  },

  '/citizen/my-credentials': {
    title: 'My Credentials',
    description: 'View and manage your issued digital credentials. ',
  },

  '/citizen/activate-credentials': {
    title: 'Activate Credentials',
    description:
      'Verify your identity and add your credentials to your wallet.',
  },

  '/citizen/manage-user-account': {
    title: 'Manage Account',
    description: 'Manage your profile, security settings, and trusted devices.',
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
