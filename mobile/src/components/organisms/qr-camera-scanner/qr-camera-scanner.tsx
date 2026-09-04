import { useCallback, useEffect, useRef, useState } from 'react'
import { CameraView, useCameraPermissions } from 'expo-camera'
import type { BarcodeScanningResult } from 'expo-camera'
import { CameraOff } from 'lucide-react-native'
import {
  ActivityIndicator,
  Animated,
  AppState,
  Easing,
  Linking,
  StyleSheet,
  View,
} from 'react-native'

import { Button, Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { QrCameraScannerProps } from './types'

const SWEEP_DURATION = 1100

export const QrCameraScanner = ({
  isTorchOn = false,
  onScan,
  paused = false,
  testID = 'qr-camera-scanner',
}: QrCameraScannerProps) => {
  const [permission, requestPermission, getPermission] = useCameraPermissions()
  const hasAutoRequested = useRef(false)
  const [frameHeight, setFrameHeight] = useState(0)
  const lastScanned = useRef('')
  const [sweep] = useState(() => new Animated.Value(0))

  useEffect(() => {
    if (!permission || permission.granted || hasAutoRequested.current) {
      return
    }
    if (permission.status === 'undetermined') {
      hasAutoRequested.current = true
      void requestPermission()
    }
  }, [permission, requestPermission])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void getPermission()
      }
    })
    return () => subscription.remove()
  }, [getPermission])

  useEffect(() => {
    if (!paused) {
      lastScanned.current = ''
    }
  }, [paused])

  useEffect(() => {
    if (frameHeight === 0) {
      return
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          duration: SWEEP_DURATION,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          duration: SWEEP_DURATION,
          easing: Easing.inOut(Easing.ease),
          toValue: 0,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [frameHeight, sweep])

  const handleBarcodeScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      if (!data || data === lastScanned.current) {
        return
      }
      lastScanned.current = data
      onScan(data)
    },
    [onScan]
  )

  if (!permission || permission.status === 'undetermined') {
    return (
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator color={colors.primaryGreen} size="large" />
        <Text variant="sub-sm" className="text-clean-white/70">
          Preparing the camera...
        </Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View
        className="flex-1 items-center justify-center gap-3 px-8"
        testID="qr-camera-denied"
      >
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-clean-white/10">
          <CameraOff size={26} color={colors.white} />
        </View>
        <Text variant="h3" className="text-clean-white">
          Camera access needed
        </Text>
        <Text variant="sub-sm" className="text-center text-clean-white/70">
          {permission.canAskAgain
            ? 'FlashID needs your camera to scan QR codes.'
            : 'Camera access is turned off for FlashID. Turn it on in your device settings to scan a QR code.'}
        </Text>
        <Button
          label={
            permission.canAskAgain ? 'Allow camera access' : 'Open settings'
          }
          onPress={
            permission.canAskAgain
              ? () => void requestPermission()
              : () => void Linking.openSettings()
          }
          testID="qr-camera-permission-button"
        />
      </View>
    )
  }

  return (
    <View className="flex-1" testID={testID}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        enableTorch={isTorchOn}
        facing="back"
        onBarcodeScanned={paused ? undefined : handleBarcodeScanned}
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="aspect-square w-full max-w-[320px]"
          onLayout={(event) => setFrameHeight(event.nativeEvent.layout.height)}
        >
          <View className="absolute left-0 top-0 h-12 w-12 rounded-tl-3xl border-l-4 border-t-4 border-primary-green" />
          <View className="absolute right-0 top-0 h-12 w-12 rounded-tr-3xl border-r-4 border-t-4 border-primary-green" />
          <View className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-3xl border-b-4 border-l-4 border-primary-green" />
          <View className="absolute bottom-0 right-0 h-12 w-12 rounded-br-3xl border-b-4 border-r-4 border-primary-green" />
          <Animated.View
            testID="qr-scan-line"
            style={{
              backgroundColor: colors.primaryGreen,
              height: 2,
              left: 8,
              position: 'absolute',
              right: 8,
              top: 0,
              transform: [
                {
                  translateY: sweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, frameHeight],
                  }),
                },
              ],
            }}
          />
        </View>
      </View>
    </View>
  )
}
