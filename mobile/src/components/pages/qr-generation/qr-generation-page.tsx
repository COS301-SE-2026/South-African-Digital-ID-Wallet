import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { ShieldAlert } from 'lucide-react-native'
import { ActivityIndicator, type ScrollView, View } from 'react-native'
import { Button, Card, IconTile, Text } from '@/components/atoms'
import { DisclosureModal, QrCodeCard } from '@/components/organisms'
import { DetailScreen } from '@/components/templates'
import {
  createOfflinePresentation,
  isPackageUsable,
} from '@/lib/offline/offline-presentation'
import { splitPayloadFrames } from '@/lib/offline/qr-frames'
import {
  useCountdown,
  useNetworkStatus,
  useOfflinePackage,
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
  const { offlinePackage, isPreparing } = useOfflinePackage(credentialId)

  const [disclosedFields, setDisclosedFields] = useState<string[]>([])
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(true)
  const [offlineFrames, setOfflineFrames] = useState<readonly string[]>([])
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [offlineError, setOfflineError] = useState<string | null>(null)

  const { error, generate, isGenerating, token } = useQrToken()
  const secondsRemaining = useCountdown(token?.expiresAt)
  const credentialType = toQrCredentialType(credential?.type)

  const scrollRef = useRef<ScrollView>(null)

  // The mode buttons sit below the code, so switching would otherwise leave the new code partly scrolled off screen,
  // where a scanner can't read it.
  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ animated: true, y: 0 })
  }, [])

  // Scrolls once the new code has rendered, so both switches and an offline field change end with the whole code in view.
  useEffect(() => {
    scrollToTop()
  }, [isOfflineMode, offlineFrames, scrollToTop])

  // Builds the offline code for the given fields, so a new selection also applies offline.
  const showOfflineCode = useCallback(
    (fields: readonly string[]) => {
      setOfflineError(null)

      if (
        !offlinePackage ||
        !isPackageUsable(offlinePackage, Math.floor(Date.now() / 1000))
      ) {
        setOfflineError(
          isPreparing
            ? 'Preparing your offline code. Try again in a moment.'
            : 'Connect once to prepare offline verification.'
        )
        return
      }

      try {
        const presentation = createOfflinePresentation(offlinePackage, fields)

        setOfflineFrames(
          splitPayloadFrames(presentation).map((frame) => frame.encoded)
        )
        setIsOfflineMode(true)
      } catch (offlinePresentationError) {
        setOfflineError(
          offlinePresentationError instanceof Error
            ? offlinePresentationError.message
            : 'Offline code is not ready.'
        )
      }
    },
    [isPreparing, offlinePackage]
  )

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

      // An online code needs the server, so offline, or while the offline code is showing, the
      // new selection becomes a new offline code instead.
      if (isOffline || isOfflineMode) {
        showOfflineCode(fields)
        return
      }

      setOfflineError(null)
      generate({ credentialId, disclosedFields: fields })
    },
    [
      credentialId,
      credentialType,
      generate,
      isOffline,
      isOfflineMode,
      showOfflineCode,
    ]
  )

  const handleRefresh = useCallback(() => {
    if (!credentialId) {
      return
    }

    generate({ credentialId, disclosedFields })
  }, [credentialId, disclosedFields, generate])

  const handleShowOfflineCode = useCallback(() => {
    showOfflineCode(disclosedFields)
  }, [disclosedFields, showOfflineCode])

  const handleShowOnlineCode = useCallback(() => {
    setOfflineFrames([])
    setIsOfflineMode(false)
    setOfflineError(null)

    // The online code was never made if the fields were chosen offline, and any older one has likey expired,
    // so a fresh one is requested with the current selection.
    if (credentialId && disclosedFields.length > 0) {
      generate({ credentialId, disclosedFields })
    }
  }, [credentialId, disclosedFields, generate])

  // Sharing is over either way, so Back and Cancel both return to credential list and close
  // the unlocked detail screen underneath on the way.
  const handleBack = useCallback(() => {
    router.dismissTo('/citizen/wallet')
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
    <DetailScreen
      onBack={handleBack}
      scrollRef={scrollRef}
      title="Share Identity"
    >
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
