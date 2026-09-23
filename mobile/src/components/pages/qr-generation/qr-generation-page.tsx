import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { ShieldAlert } from 'lucide-react-native'
import { ActivityIndicator, View } from 'react-native'

import { Button, Card, IconTile, Text } from '@/components/atoms'
import { DisclosureModal, QrCodeCard } from '@/components/organisms'
import { DetailScreen } from '@/components/templates'
import {
  readOfflineCache,
  type OfflineCache,
} from '@/lib/offline/offline-cache'
import { createOfflinePresentation } from '@/lib/offline/offline-presentation'
import { splitPayloadFrames } from '@/lib/offline/qr-frames'
import {
  useCountdown,
  useNetworkStatus,
  useQrToken,
  useWalletCredential,
} from '@/hooks'
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
  const { isOffline } = useNetworkStatus()

  const [disclosedFields, setDisclosedFields] = useState<string[]>([])
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(true)
  const [offlineCache, setOfflineCache] = useState<OfflineCache | null>(null)
  const [offlineFrames, setOfflineFrames] = useState<readonly string[]>([])
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [offlineError, setOfflineError] = useState<string | null>(null)

  const { error, generate, isGenerating, token } = useQrToken()
  const secondsRemaining = useCountdown(token?.expiresAt)
  const credentialType = toQrCredentialType(credential?.type)

  useEffect(() => {
    let cancelled = false

    readOfflineCache().then((cache) => {
      if (!cancelled) {
        setOfflineCache(cache)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

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
      setOfflineError(null)
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

  const handleShowOfflineCode = useCallback(() => {
    setOfflineError(null)

    const cachedPackage = offlineCache?.package

    if (!cachedPackage) {
      setOfflineError('Connect once to prepare offline verification.')
      return
    }

    const expiresAt = Date.parse(cachedPackage.expiresAt)

    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      setOfflineError('Connect once to prepare offline verification.')
      return
    }

    try {
      const presentation = createOfflinePresentation(
        cachedPackage,
        disclosedFields
      )

      const frames = splitPayloadFrames(presentation)

      setOfflineFrames(frames.map((frame) => frame.encoded))
      setIsOfflineMode(true)
    } catch (offlinePresentationError) {
      setOfflineError(
        offlinePresentationError instanceof Error
          ? offlinePresentationError.message
          : 'Offline code is not ready.'
      )
    }
  }, [disclosedFields, offlineCache])

  const handleShowOnlineCode = useCallback(() => {
    setOfflineFrames([])
    setIsOfflineMode(false)
    setOfflineError(null)
  }, [])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

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
      {offlineError ? (
        <Card
          className="items-center gap-3 rounded-3xl p-8"
          testID="offline-qr-error"
        >
          <Text variant="sub-sm" className="text-center">
            {offlineError}
          </Text>
        </Card>
      ) : null}

      {isOfflineMode && offlineFrames.length > 0 ? (
        <QrCodeCard
          offlineFrames={offlineFrames}
          onCancel={handleBack}
          onRefresh={handleShowOfflineCode}
          secondsRemaining={Number.MAX_SAFE_INTEGER}
          testID="offline-qr-card"
        />
      ) : null}

      {!isOfflineMode && isGenerating ? (
        <Card
          className="items-center gap-3 rounded-3xl p-8"
          testID="qr-loading"
        >
          <ActivityIndicator color={colors.primaryGreen} size="large" />
          <Text variant="sub-sm">Generating your QR code...</Text>
        </Card>
      ) : !isOfflineMode && error ? (
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
      ) : !isOfflineMode && token ? (
        <QrCodeCard
          onCancel={handleBack}
          onRefresh={handleRefresh}
          secondsRemaining={secondsRemaining}
          token={token.token}
        />
      ) : !isOfflineMode ? (
        <Card className="items-center gap-3 rounded-3xl p-8" testID="qr-empty">
          <Text variant="h3">{credential.title}</Text>
          <Text variant="sub-sm" className="text-center">
            Choose what you want to share to generate your QR code.
          </Text>
        </Card>
      ) : null}

      {isOffline ? (
        <Card
          className="gap-3 rounded-3xl border border-warning-orange p-4"
          testID="offline-status"
        >
          <Text variant="sub-sm">
            No connection. Online sharing is unavailable.
          </Text>

          <Button
            label="Show offline code"
            onPress={handleShowOfflineCode}
            testID="show-offline-button"
            variant="secondary"
          />
        </Card>
      ) : (
        <Button
          label="Show offline code"
          onPress={handleShowOfflineCode}
          testID="show-offline-button"
          variant="secondary"
        />
      )}

      {isOfflineMode && !isOffline ? (
        <Button
          label="Use online code"
          onPress={handleShowOnlineCode}
          testID="show-online-button"
          variant="text"
        />
      ) : null}

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
