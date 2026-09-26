import { Car, IdCard, type LucideIcon } from 'lucide-react-native'
import { ScrollView } from 'react-native'

import { CredentialCard } from '@/components/molecules'

import type { CredentialListProps } from './types'

export const CREDENTIAL_LIST_CARD_HEIGHT = 150

const ICON_BY_TYPE: Record<string, LucideIcon> = {
  driverslicense: Car,
  identitydocument: IdCard,
}

export const credentialIconFor = (type: string | undefined): LucideIcon =>
  ICON_BY_TYPE[(type ?? '').trim().toLowerCase()] ?? IdCard

export const CredentialList = ({
  credentials,
  onSelect,
  testID = 'credential-list',
}: CredentialListProps) => (
  <ScrollView
    contentContainerClassName="gap-4 pb-8"
    showsVerticalScrollIndicator={false}
    testID={testID}
  >
    {credentials.map((credential) => (
      <CredentialCard
        height={CREDENTIAL_LIST_CARD_HEIGHT}
        hint="Tap to unlock"
        Icon={credentialIconFor(credential.type)}
        issuedBy={credential.issuedBy}
        key={credential.id}
        onPress={() => onSelect(credential)}
        testID={`credential-card-${credential.id}`}
        title={credential.title}
      />
    ))}
  </ScrollView>
)
