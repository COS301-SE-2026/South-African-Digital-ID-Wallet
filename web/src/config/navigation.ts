import type { SidebarNavSection } from '@/types/navigation'

{
  /*TODO: Untub hrefs */
}

export const citizenNavSections: SidebarNavSection[] = [
  {
    title: 'Citizen Portal',
    items: [
      { label: 'Dashboard', href: '/', icon: 'dashboard' },
      { label: 'My Credentials', href: '/', icon: 'credentials' },
      { label: 'Share QR Code', href: '/', icon: 'qr' },
      { label: 'Notifications', href: '/', icon: 'notifications' },
    ],
  },

  {
    title: 'Security',
    items: [
      { label: 'Verification History', href: '/', icon: 'history' },
      { label: 'Privacy Settings', href: '/', icon: 'settings' },
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
    items: [],
  },

  {
    title: 'Security',
    items: [],
  },
]
