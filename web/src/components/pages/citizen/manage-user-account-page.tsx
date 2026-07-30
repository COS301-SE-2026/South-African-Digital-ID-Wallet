'use client'

import { ManageUserAccount } from '@/components/organisms/manage-user-account'
import { useUser } from '@/context/user-context'
import { manageUserAccountNavSections } from '@/config/navigation'

export default function ManageUserAccountPage() {
  return <ManageUserAccount />
}
