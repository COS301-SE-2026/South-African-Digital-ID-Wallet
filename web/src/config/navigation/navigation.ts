import type { SidebarNavSection } from '@/types/navigation'

export const citizenNavSections: SidebarNavSection[] = [
  {
    title: 'Citizen Portal',
    items: [
      {
        label: 'Dashboard',
        href: '/citizen/citizen-dashboard',
        icon: 'dashboard',
      },
      {
        label: 'My Credentials',
        href: '/citizen/my-credentials',
        icon: 'credentials',
      },
      { label: 'Verifications', href: '/citizen/verifications', icon: 'users' },
      {
        label: 'Activate Credentials',
        href: '/citizen/activate-credentials',
        icon: 'shield',
      },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        label: 'Verification History',
        href: '/under-construction',
        icon: 'history',
      },
      {
        label: 'Manage Account',
        href: '/citizen/manage-user-account',
        icon: 'settings',
      },
    ],
  },
]

export const governmentAdminNavSections: SidebarNavSection[] = [
  {
    title: 'Government Admin',
    items: [
      { label: 'Dashboard', href: '/gov-admin', icon: 'dashboard' },
      {
        label: 'Upload Institution',
        href: '/gov-admin/upload-institution',
        icon: 'institutions',
      },
      {
        label: 'View Institutions',
        href: '/gov-admin/view-institutions',
        icon: 'institutions',
      },
      {
        label: 'Manage Credentials',
        href: '/gov-admin/manage-credentials',
        icon: 'institutions',
      },
    ],
  },

  {
    title: 'Security',
    items: [
      { label: 'Audit Logs', href: '/under-construction', icon: 'history' },
      { label: 'Settings', href: '/under-construction', icon: 'settings' },
    ],
  },
]

export const officialsNavSections: SidebarNavSection[] = [
  {
    title: 'Officials',
    items: [
      {
        label: 'Dashboard',
        href: '/officials/officials-dashboard',
        icon: 'dashboard',
      },
      {
        label: 'Onboard Citizen',
        href: '/officials/onboard-citizen',
        icon: 'onboard',
      },
      {
        label: 'Verifications',
        href: '/officials/verifications',
        icon: 'users',
      },
    ],
  },

  {
    title: 'Security',
    items: [
      {
        label: 'Onboarding History',
        href: '/under-construction',
        icon: 'history',
      },
      {
        label: 'Privacy Settings',
        href: '/privacy-settings',
        icon: 'settings',
      },
    ],
  },
]

export const manageUserAccountNavSections: SidebarNavSection[] = [
  {
    title: 'Citizen Portal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
      { label: 'My Credentials', href: '/credentials', icon: 'credentials' },
      { label: 'Share QR Code', href: '/share-qr', icon: 'qr' },
      { label: 'Verifications', href: '/verifications', icon: 'users' },
      { label: 'Notifications', href: '/notifications', icon: 'notifications' },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        label: 'Login & Biometrics',
        href: '/login-biometrics',
        icon: 'biometrics',
      },
      {
        label: 'Verification History',
        href: '/verification-history',
        icon: 'history',
      },
      {
        label: 'Security & Recovery',
        href: '/security-recovery',
        icon: 'shield',
      },
    ],
  },
]
