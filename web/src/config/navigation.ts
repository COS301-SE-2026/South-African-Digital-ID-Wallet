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
    items: [],
  },

  {
    title: 'Security',
    items: [],
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
