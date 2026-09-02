import { useCallback, useState } from 'react'
import { useRouter } from 'expo-router'
import { ShieldAlert } from 'lucide-react-native'
import { ActivityIndicator, View } from 'react-native'

import { Button, Card, IconTile, Text } from '@/components/atoms'
import { DisclosureModal, QrCodeCard } from '@/components/organisms'
import { DetailScreen } from '@/components/templates'
import { useCountdown, useQrToken, useWalletCredential } from '@/hooks'
import {
  MANDATORY_FIELDS,
  resolveQrError,
  toQrCredentialType,
} from '@/services/qr-service'
import { colors } from '@/theme/colors'

import type { QrGenerationPageProps } from './types'

export const QrGenerationPage = ({ credentialId }: QrGenerationPageProps) => {
  const router = useRouter()
  const { credential, isPending } = useWalletCredential(credentialId)
  const [disclosedFields, setDisclosedFields] = useState<string[]>([])
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(true)
  const { error, generate, isGenerating, token } = useQrToken()
  const secondsRemaining = useCountdown(token?.expiresAt)

  const credentialType = toQrCredentialType(credential?.type)

  const handleConfirm = useCallback(
    (selectedOptionalFields: string[]) => {
      if (!credentialId) {
        return
      }
      const fields = [
        ...MANDATORY_FIELDS[credentialType],
        ...selectedOptionalFields,
      ]
      setDisclosedFields(fields)
      setIsDisclosureOpen(false)
      generate({ credentialId, disclosedFields: fields })
    },
    [credentialId, credentialType, generate]
  )

  const handleRefresh = useCallback(() => {
    if (!credentialId) {
      return
    }
    generate({ credentialId, disclosedFields })
  }, [credentialId, disclosedFields, generate])

  const handleBack = useCallback(() => router.back(), [router])

  if (isPending || !credential) {
    return (
      <View
        className="flex-1 items-center justify-center bg-cream-background"
        testID="qr-generation-loading"
      >
        <ActivityIndicator color={colors.primaryGreen} size="large" />
      </View>
    )
  }

  return (
    <DetailScreen onBack={handleBack} title="Share Identity">
      {isGenerating ? (
        <Card
          className="items-center gap-3 rounded-3xl p-8"
          testID="qr-loading"
        >
          <ActivityIndicator color={colors.primaryGreen} size="large" />
          <Text variant="sub-sm">Generating your QR code...</Text>
        </Card>
      ) : error ? (
        <Card className="items-center gap-3 rounded-3xl p-8" testID="qr-error">
          <IconTile Icon={ShieldAlert} size="lg" tone="soft-red" />
          <Text variant="h3">Something went wrong</Text>
          <Text variant="sub-sm" className="text-center">
            {resolveQrError(error)}
          </Text>
          <Button
            label="Try again"
            onPress={handleRefresh}
            testID="qr-retry-button"
          />
        </Card>
      ) : token ? (
        <QrCodeCard
          onCancel={handleBack}
          onRefresh={handleRefresh}
          secondsRemaining={secondsRemaining}
          token={token.token}
        />
      ) : (
        <Card className="items-center gap-3 rounded-3xl p-8" testID="qr-empty">
          <Text variant="h3">{credential.title}</Text>
          <Text variant="sub-sm" className="text-center">
            Choose what you want to share to generate your QR code.
          </Text>
        </Card>
      )}

      <Button
        label="Change what you share"
        onPress={() => setIsDisclosureOpen(true)}
        testID="qr-edit-disclosure-button"
        variant="text"
      />

      <DisclosureModal
        credentialType={credentialType}
        isVisible={isDisclosureOpen}
        onClose={() => setIsDisclosureOpen(false)}
        onConfirm={handleConfirm}
      />
    </DetailScreen>
  )
}
