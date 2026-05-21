import type { SidebarNavSection } from '@/types/navigation'

{
  /*TODO: Unstub hrefs */
}

export const citizenNavSections: SidebarNavSection[] = [
  {
    title: 'Citizen Portal',
    items: [
      { label: 'Dashboard', href: '/citizen', icon: 'dashboard' },
      {
        label: 'My Credentials',
        href: '/under-construction',
        icon: 'credentials',
      },
      { label: 'Share QR Code', href: '/under-construction', icon: 'qr' },
      {
        label: 'Register Admin',
        href: '/gov-admin/register-admin',
        icon: 'users',
      },
      {
        label: 'Notifications',
        href: '/under-construction',
        icon: 'notifications',
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
        label: 'Privacy Settings',
        href: '/under-construction',
        icon: 'settings',
      },
    ],
  },
]

{
  /* TODO: add government and officials nav bar items */
}
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
        label: 'Register Admin',
        href: '/gov-admin/register-admin',
        icon: 'users',
      },
      {
        label: 'Notifications',
        href: '/under-construction',
        icon: 'notifications',
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
      { label: 'Dashboard', href: '/officials', icon: 'dashboard' },
      {
        label: 'Onboard Citizen',
        href: '/officials/onboard-citizen',
        icon: 'onboard',
      },
      {
        label: 'Register Admin',
        href: '/gov-admin/register-admin',
        icon: 'users',
      },
      {
        label: 'Notifications',
        href: '/under-construction',
        icon: 'notifications',
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
        href: '/under-construction',
        icon: 'settings',
      },
    ],
  },
]
