import { useCallback, useMemo, useState } from 'react'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import {
  Bell,
  HelpCircle,
  Info,
  LogOut,
  Shield,
  Smartphone,
  User,
} from 'lucide-react-native'
import { ScrollView } from 'react-native'

import { Button } from '@/components/atoms'
import {
  InfoSheet,
  LinkedDevicesSheet,
  NotificationsSheet,
  PersonalInfoSheet,
  ProfileHeader,
  SecuritySheet,
  SettingsSection,
} from '@/components/organisms'
import type { SettingsRowConfig } from '@/components/organisms'
import { WalletScreen } from '@/components/templates'
import { ABOUT_FLASHID, HELP_FAQS } from '@/config'
import { useAccountDetails, useProfile, useSignOut } from '@/hooks'
import { normalizeRole } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import type { SheetName } from './types'

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'FL'

export const ProfilePage = () => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isCitizen = normalizeRole(user?.role) === 'citizen'
  const { profile } = useProfile()
  const { account } = useAccountDetails(isCitizen)
  const [openSheet, setOpenSheet] = useState<SheetName | null>(null)
  const signOut = useSignOut()

  const name =
    [profile?.names, profile?.surname].filter(Boolean).join(' ') ||
    [user?.names, user?.surname].filter(Boolean).join(' ') ||
    'FlashID user'

  const accountRows = useMemo<SettingsRowConfig[]>(() => {
    const rows: SettingsRowConfig[] = [
      {
        Icon: User,
        label: 'Personal Information',
        name: 'personal',
        onPress: () => setOpenSheet('personal'),
      },
      {
        Icon: Shield,
        label: 'Security',
        name: 'security',
        onPress: () => setOpenSheet('security'),
      },
    ]
    if (isCitizen) {
      rows.push({
        Icon: Smartphone,
        label: 'Linked Devices',
        name: 'devices',
        onPress: () => setOpenSheet('devices'),
      })
    }
    return rows
  }, [isCitizen])

  const preferenceRows = useMemo<SettingsRowConfig[]>(
    () =>
      isCitizen
        ? [
            {
              Icon: Bell,
              label: 'Notifications',
              name: 'notifications',
              onPress: () => setOpenSheet('notifications'),
            },
          ]
        : [],
    [isCitizen]
  )

  const supportRows = useMemo<SettingsRowConfig[]>(
    () => [
      {
        Icon: HelpCircle,
        label: 'Help Centre',
        name: 'help',
        onPress: () => setOpenSheet('help'),
      },
      {
        Icon: Info,
        label: 'About FlashID',
        name: 'about',
        onPress: () => setOpenSheet('about'),
      },
    ],
    []
  )

  const closeSheet = useCallback(() => setOpenSheet(null), [])

  return (
    <WalletScreen title="Profile">
      <ScrollView
        contentContainerClassName="gap-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          email={profile?.email ?? ''}
          initials={initialsOf(name)}
          name={name}
          roleLabel={isCitizen ? 'Citizen' : 'Official'}
        />

        <SettingsSection
          rows={accountRows}
          testID="settings-account"
          title="Account"
        />
        <SettingsSection
          rows={preferenceRows}
          testID="settings-preferences"
          title="Preferences"
        />
        <SettingsSection
          rows={supportRows}
          testID="settings-support"
          title="Support"
        />

        <Button
          label="Log Out"
          LeftIcon={LogOut}
          onPress={() => void signOut()}
          testID="logout-button"
          variant="danger"
        />
      </ScrollView>

      <PersonalInfoSheet
        account={account}
        isVisible={openSheet === 'personal'}
        onClose={closeSheet}
        profile={profile}
      />
      <SecuritySheet
        isVisible={openSheet === 'security'}
        onClose={closeSheet}
      />
      <LinkedDevicesSheet
        isVisible={openSheet === 'devices'}
        onClose={closeSheet}
      />
      <NotificationsSheet
        isVisible={openSheet === 'notifications'}
        onClose={closeSheet}
      />
      <InfoSheet
        isVisible={openSheet === 'help'}
        items={HELP_FAQS}
        onClose={closeSheet}
        subtitle="Answers to the questions we get most."
        testID="help-sheet"
        title="Help Centre"
      />
      <InfoSheet
        isVisible={openSheet === 'about'}
        items={[
          ...ABOUT_FLASHID,
          { body: `Version ${Constants.expoConfig?.version ?? '1.0.0'}` },
        ]}
        onClose={closeSheet}
        testID="about-sheet"
        title="About FlashID"
      />
    </WalletScreen>
  )
}
