import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import QRCode from 'react-native-qrcode-svg'
import { RefreshCw } from 'lucide-react-native'
import { Card } from '@/components/atoms/Card'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { useQrDisclosureStore } from '@/stores/qrDisclosureStore'
import qrService from '@/services/qr-service/qr-service'
import { colors } from '@/theme/colors'
import { spacing, radius } from '@/theme/spacing'
import { typography } from '@/theme/typography'

const WARNING_THRESHOLD = 15

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function DisplayScreen() {
  const router = useRouter()
  const credentialId = useQrDisclosureStore((state) => state.credentialId)
  const mandatoryFields = useQrDisclosureStore((state) => state.mandatoryFields)
  const selectedOptionalFields = useQrDisclosureStore(
    (state) => state.selectedOptionalFields
  )

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [qrValue, setQrValue] = useState('')
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null)

  const isExpired = status === 'ready' && secondsRemaining <= 0
  const isWarning =
    status === 'ready' && secondsRemaining <= WARNING_THRESHOLD && !isExpired

  const [expiredProgress] = useState(() => new Animated.Value(0))
  const [pulse] = useState(() => new Animated.Value(1))

  const fetchQr = useCallback(async () => {
    try {
      const disclosedFields = [...mandatoryFields, ...selectedOptionalFields]
      const response = await qrService.generate(credentialId, disclosedFields)
      const expiresAt = new Date(response.expiresAt).getTime()
      setQrValue(response.token)
      setExpiresAtMs(expiresAt)
      setSecondsRemaining(
        Math.max(Math.round((expiresAt - Date.now()) / 1000), 0)
      )
      setStatus('ready')
    } catch {
      setErrorMessage('Could not generate your QR code. Please try again.')
      setStatus('error')
    }
  }, [credentialId, mandatoryFields, selectedOptionalFields])

  const handleRetry = () => {
    setStatus('loading')
    setErrorMessage('')
    fetchQr()
  }

  useEffect(() => {
    // Standard fetch-on-mount pattern. This lint rule is overly strict about
    // effects that call an async function which eventually sets state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQr()
  }, [fetchQr])

  useEffect(() => {
    if (status !== 'ready' || isExpired || expiresAtMs === null) return
    const interval = setInterval(() => {
      setSecondsRemaining(
        Math.max(Math.round((expiresAtMs - Date.now()) / 1000), 0)
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [status, isExpired, expiresAtMs])

  useEffect(() => {
    Animated.timing(expiredProgress, {
      toValue: isExpired ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start()
  }, [isExpired, expiredProgress])

  useEffect(() => {
    if (!isWarning) {
      pulse.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [isWarning, pulse])

  const qrOpacity = expiredProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  })
  const qrScale = expiredProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  })
  const expiredOpacity = expiredProgress
  const expiredScale = expiredProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  })

  if (status === 'loading') {
    return (
      <View style={styles.screen}>
        <Text style={styles.loadingText}>Generating your QR code...</Text>
      </View>
    )
  }

  if (status === 'error') {
    return (
      <View style={styles.screen}>
        <Card style={styles.errorCard}>
          <Text style={styles.expiredTitle}>Something went wrong</Text>
          <Text style={styles.expiredBody}>{errorMessage}</Text>
          <Pressable style={styles.regenerateButton} onPress={handleRetry}>
            <RefreshCw size={16} color={colors.cream} />
            <Text style={styles.regenerateLabel}>Try again</Text>
          </Pressable>
        </Card>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <Card style={styles.card} padded={false}>
        <View style={styles.corner} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />

        <View style={styles.qrArea}>
          <Animated.View
            style={[
              styles.qrWrapper,
              { opacity: qrOpacity, transform: [{ scale: qrScale }] },
            ]}
            pointerEvents={isExpired ? 'none' : 'auto'}
          >
            <QRCode
              value={qrValue}
              size={200}
              color={colors.textPrimary}
              backgroundColor={colors.surface}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.expiredOverlay,
              { opacity: expiredOpacity, transform: [{ scale: expiredScale }] },
            ]}
            pointerEvents={isExpired ? 'auto' : 'none'}
          >
            <Text style={styles.expiredTitle}>QR code expired</Text>
            <Text style={styles.expiredBody}>
              Generate a new code to continue verification.
            </Text>
            <Pressable style={styles.regenerateButton} onPress={handleRetry}>
              <RefreshCw size={16} color={colors.cream} />
              <Text style={styles.regenerateLabel}>Generate new QR</Text>
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          {isExpired ? (
            <StatusBadge label="Expired" variant="danger" />
          ) : (
            <StatusBadge label="Valid credential" variant="success" />
          )}
          {!isExpired && (
            <Animated.Text
              style={[
                styles.timer,
                { color: isWarning ? colors.danger : colors.textSecondary },
                { transform: [{ scale: pulse }] },
              ]}
            >
              {formatTime(secondsRemaining)}
            </Animated.Text>
          )}
        </View>
      </Card>

      <Pressable style={styles.backLink} onPress={() => router.back()}>
        <Text style={styles.backLinkLabel}>Back to preview</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  errorCard: {
    width: 280,
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: 280,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.gold,
    borderTopLeftRadius: radius.sm,
  },
  cornerTopRight: {
    left: undefined,
    right: spacing.md,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radius.sm,
  },
  cornerBottomLeft: {
    top: undefined,
    bottom: spacing.md,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: radius.sm,
  },
  cornerBottomRight: {
    top: undefined,
    left: undefined,
    bottom: spacing.md,
    right: spacing.md,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: radius.sm,
  },
  qrArea: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  qrWrapper: {
    position: 'absolute',
  },
  expiredOverlay: {
    position: 'absolute',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  expiredTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  expiredBody: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.green,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  regenerateLabel: {
    color: colors.cream,
    fontSize: typography.label.fontSize,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timer: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  backLink: {
    marginTop: spacing.lg,
  },
  backLinkLabel: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
})
