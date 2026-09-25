import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, type ScrollView, View } from 'react-native'
import { Button, Card, Text } from '@/components/atoms'
import { DisclosureModal, QrCodeCard } from '@/components/organisms'
import { DetailScreen } from '@/components/templates'
import type { OfflinePackage } from '@/lib/offline/offline-cache'
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
import { MANDATORY_FIELDS, toQrCredentialType } from '@/services/qr-service'
import { colors } from '@/theme/colors'

import { OnlineQrState } from './online-qr-state'
import type { QrGenerationPageProps } from './types'

const PREPARING_MESSAGE = 'Preparing your offline code. Try again in a moment.'
const CONNECT_ONCE_MESSAGE = 'Connect once to prepare offline verification.'
const OFFLINE_CODE_FAILED_MESSAGE =
  'Your offline code could not be prepared. Connect to the internet and open Share again.'

type OfflineCodeOutcome = { frames: readonly string[] } | { error: string }

// Pure, so every way an offline code can fail is decided in one place and the page only applies the outcome.
const buildOfflineCode = (
  offlinePackage: OfflinePackage | null,
  fields: readonly string[],
  isPreparing: boolean
): OfflineCodeOutcome => {
  if (
    !offlinePackage ||
    !isPackageUsable(offlinePackage, Math.floor(Date.now() / 1000))
  ) {
    return { error: isPreparing ? PREPARING_MESSAGE : CONNECT_ONCE_MESSAGE }
  }

  try {
    const presentation = createOfflinePresentation(offlinePackage, fields)

    return {
      frames: splitPayloadFrames(presentation).map((frame) => frame.encoded),
    }
  } catch {
    // The builder's messages name internal claims such as "portrait", which mean nothing to a citizen.
    return { error: OFFLINE_CODE_FAILED_MESSAGE }
  }
}

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

  const {
    error,
    generate,
    isGenerating,
    reset: resetToken,
    token,
  } = useQrToken()
  const secondsRemaining = useCountdown(token?.expiresAt)
  const credentialType = toQrCredentialType(credential?.type)

  const scrollRef = useRef<ScrollView>(null)

  // The mode buttons sit below the code, so switching would otherwise leave the new code
  // partly scrolled off screen, where a scanner cannot read it.
  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ animated: true, y: 0 })
  }, [])

  // Scrolls once the new code has rendered, so both switches and an offline field change
  // end with the whole code in view.
  useEffect(() => {
    scrollToTop()
  }, [isOfflineMode, offlineFrames, scrollToTop])

  const showOfflineCode = useCallback(
    (fields: readonly string[]) => {
      const outcome = buildOfflineCode(offlinePackage, fields, isPreparing)

      if ('error' in outcome) {
        // A failed rebuild must not leave the previous code cycling, or the citizen would
        // present fields they no longer chose.
        setOfflineFrames([])
        setIsOfflineMode(false)
        setOfflineError(outcome.error)
        return
      }

      setOfflineError(null)
      setOfflineFrames(outcome.frames)
      setIsOfflineMode(true)
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
      // A code for the previous selection must never stay on screen, whichever kind replaces it.
      resetToken()

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
      resetToken,
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

    // The online code was never made if the fields were chosen offline, and any older one has
    // likely expired, so a fresh one is requested with the current selection.
    if (credentialId && disclosedFields.length > 0) {
      generate({ credentialId, disclosedFields })
    }
  }, [credentialId, disclosedFields, generate])

  // Sharing is over either way, so Back and Cancel both return to the credential list and close
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

      {isOfflineMode ? (
        <QrCodeCard
          offlineFrames={offlineFrames}
          onCancel={handleBack}
          onRefresh={handleShowOfflineCode}
          secondsRemaining={Number.MAX_SAFE_INTEGER}
          testID="offline-qr-card"
        />
      ) : (
        <OnlineQrState
          credentialTitle={credential.title}
          error={error}
          isGenerating={isGenerating}
          onCancel={handleBack}
          onRefresh={handleRefresh}
          secondsRemaining={secondsRemaining}
          token={token?.token ?? null}
        />
      )}

      {isOffline ? (
        <Card
          className="rounded-3xl border border-warning-orange p-4"
          testID="offline-status"
        >
          <Text variant="sub-sm">
            No connection. Online sharing is unavailable.
          </Text>
        </Card>
      ) : null}

      {/* While the offline code shows, the card's own Refresh Code already regenerates it. */}
      {isOfflineMode ? null : (
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
