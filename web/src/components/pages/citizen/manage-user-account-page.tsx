'use client'

import { ManageUserAccount } from '@/components/organisms/manage-user-account'
import { useUser } from '@/context/user-context'
import { manageUserAccountNavSections } from '@/config/navigation'

export default function ManageUserAccountPage() {
  const { logout } = useUser()

  return (
    <ManageUserAccount
      user={{
        name: 'Unathi Tshakalisa',
        initials: 'UT',
        idLabel: '••••084',
      }}
      navSections={manageUserAccountNavSections}
      onLogout={logout}
    />
  )
}
