import { useState } from 'react'
import { QrCode, Smartphone } from 'lucide-react-native'
import { View } from 'react-native'

import { Button, Card, Divider, Skeleton, Text } from '@/components/atoms'
import {
  FieldToggleRow,
  SectionHeader,
  SecurityDetailRow,
  TextField,
} from '@/components/molecules'
import { useSecuritySettings, useUpdateSecuritySettings } from '@/hooks'
import { resolveSettingsError } from '@/services/security-service'
import type { SecuritySettingKey } from '@/services/security-service'

import type { SecuritySettingsPanelProps } from './types'

type SettingChange = { key: SecuritySettingKey; value: boolean }

const TOGGLES: {
  description: string
  key: SecuritySettingKey
  label: string
}[] = [
  {
    description:
      'Flags sign-ins from places you could not have travelled to since your last one.',
    key: 'impossibleTravelDetectionEnabled',
    label: 'Impossible travel detection',
  },
  {
    description:
      'Other devices must verify with an email code, and QR codes can only be shared from a trusted device.',
    key: 'enhancedVerificationEnabled',
    label: 'Extra verification',
  },
]

const devicesLabel = (count: number) =>
  `${count} trusted ${count === 1 ? 'device' : 'devices'}`

export const SecuritySettingsPanel = ({
  testID = 'security-settings',
}: SecuritySettingsPanelProps) => {
  const { isError, isPending, settings } = useSecuritySettings()
  const { isUpdating, updateSettings } = useUpdateSecuritySettings()
  const [pending, setPending] = useState<SettingChange | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  const save = async (change: SettingChange, confirmPassword?: string) => {
    setError(undefined)
    try {
      await updateSettings({
        [change.key]: change.value,
        password: confirmPassword,
      })
      setPending(null)
      setPassword('')
    } catch (caught) {
      setError(resolveSettingsError(caught))
    }
  }

  const handleToggle = (key: SecuritySettingKey, value: boolean) => {
    if (!value) {
      setPending({ key, value })
      setPassword('')
      setError(undefined)
      return
    }
    setPending(null)
    void save({ key, value })
  }

  if (isPending) {
    return (
      <View className="gap-3" testID={`${testID}-loading`}>
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </View>
    )
  }

  if (isError || !settings) {
    return (
      <Text
        variant="sub-sm"
        className="text-danger-red"
        testID={`${testID}-error`}
      >
        We could not load your security settings.
      </Text>
    )
  }

  const pendingLabel = TOGGLES.find(
    (toggle) => toggle.key === pending?.key
  )?.label.toLowerCase()

  return (
    <View className="gap-5" testID={testID}>
      <View className="gap-3">
        <SectionHeader title="Protection" />
        {TOGGLES.map((toggle) => (
          <FieldToggleRow
            description={toggle.description}
            isOn={
              pending?.key === toggle.key ? pending.value : settings[toggle.key]
            }
            key={toggle.key}
            label={toggle.label}
            onToggle={(value) => handleToggle(toggle.key, value)}
            testID={`${testID}-${toggle.key}`}
          />
        ))}
        <FieldToggleRow
          description="New devices must enter a one-time code from your email before they can sign in."
          isLocked
          isOn={settings.deviceVerificationEnabled}
          label="New device verification"
          testID={`${testID}-device-verification`}
        />
      </View>

      {pending ? (
        <Card className="gap-3" testID={`${testID}-confirm`}>
          <Text className="text-base font-bold text-text-primary">
            {`Turn off ${pendingLabel}?`}
          </Text>
          <Text variant="sub-sm">
            This lowers your protection, so please confirm your password.
          </Text>
          <TextField
            autoCapitalize="none"
            autoComplete="current-password"
            error={error}
            label="Password"
            onChangeText={(value) => {
              setPassword(value)
              setError(undefined)
            }}
            placeholder="Enter your password"
            secure
            testID={`${testID}-password`}
            value={password}
          />
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              label="Cancel"
              onPress={() => {
                setPending(null)
                setError(undefined)
              }}
              testID={`${testID}-cancel`}
              variant="secondary"
            />
            <Button
              className="flex-1"
              disabled={password === ''}
              isLoading={isUpdating}
              label="Turn off"
              onPress={() => void save(pending, password)}
              testID={`${testID}-confirm-button`}
            />
          </View>
        </Card>
      ) : error ? (
        <Text variant="sub-sm" className="text-danger-red">
          {error}
        </Text>
      ) : null}

      <View className="gap-3">
        <SectionHeader title="Devices and sharing" />
        <Card className="py-1">
          <SecurityDetailRow
            Icon={Smartphone}
            label="Trusted devices"
            value={devicesLabel(settings.trustedDeviceCount)}
          />
          <Divider />
          <SecurityDetailRow
            badge={
              settings.qrGenerationRestricted
                ? { label: 'Paused', tone: 'danger' }
                : { label: 'Available', tone: 'success' }
            }
            Icon={QrCode}
            label="QR code sharing"
            value={
              settings.qrGenerationRestricted
                ? 'Paused until you review your security alert.'
                : 'You can share your ID by QR code.'
            }
          />
        </Card>
      </View>
    </View>
  )
}
