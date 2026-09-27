import { ShieldAlert } from 'lucide-react-native'
import { ActivityIndicator } from 'react-native'

import { Button, Card, IconTile, Text } from '@/components/atoms'
import { QrCodeCard } from '@/components/organisms'
import { resolveQrError } from '@/services/qr-service'
import { colors } from '@/theme/colors'

import type { OnlineQrStateProps } from './types'

// The online half of the share page as one early return per state, instead of a chain of ternaries.
export const OnlineQrState = ({
  credentialTitle,
  error,
  isGenerating,
  onCancel,
  onRefresh,
  secondsRemaining,
  token,
}: OnlineQrStateProps) => {
  if (isGenerating) {
    return (
      <Card className="items-center gap-3 rounded-3xl p-8" testID="qr-loading">
        <ActivityIndicator color={colors.primaryGreen} size="large" />
        <Text variant="sub-sm">Generating your QR code...</Text>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="items-center gap-3 rounded-3xl p-8" testID="qr-error">
        <IconTile Icon={ShieldAlert} size="lg" tone="soft-red" />
        <Text variant="h3">Something went wrong</Text>
        <Text variant="sub-sm" className="text-center">
          {resolveQrError(error)}
        </Text>
        <Button
          label="Try again"
          onPress={onRefresh}
          testID="qr-retry-button"
        />
      </Card>
    )
  }

  if (token) {
    return (
      <QrCodeCard
        onCancel={onCancel}
        onRefresh={onRefresh}
        secondsRemaining={secondsRemaining}
        token={token}
      />
    )
  }

  return (
    <Card className="items-center gap-3 rounded-3xl p-8" testID="qr-empty">
      <Text variant="h3">{credentialTitle}</Text>
      <Text variant="sub-sm" className="text-center">
        Choose what you want to share to generate your QR code.
      </Text>
    </Card>
  )
}
