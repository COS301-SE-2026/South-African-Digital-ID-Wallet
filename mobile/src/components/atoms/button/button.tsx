import { ActivityIndicator, Pressable, View } from 'react-native'
import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'
import type { ButtonProps, ButtonVariant } from './types'

const CONTAINER_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'bg-deep-green',
  secondary: 'border border-border-grey bg-clean-white',
  text: 'bg-transparent',
}

const LABEL_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'text-clean-white',
  secondary: 'text-text-primary',
  text: 'text-primary-green',
}

const ICON_COLORS: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.textPrimary,
  text: colors.primaryGreen,
}

export const Button = ({
  className,
  disabled = false,
  isLoading = false,
  label,
  LeftIcon,
  onPress,
  testID,
  variant = 'primary',
}: ButtonProps) => {
  const isDisabled = disabled || isLoading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      className={cn(
        'item-center justify-center rounded-xl px-4 py-3.5 active:opacity-85',
        CONTAINER_CLASSNAMES[variant],
        isDisabled && 'opacity-50',
        className
      )}
    >
      {isLoading ? (
        <ActivityIndicator color={ICON_COLORS[variant]} size="small" />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {LeftIcon ? (
            <LeftIcon size={10} color={ICON_COLORS[variant]} />
          ) : null}
          <Text
            className={cn('text-base font-semibold', LABEL_CLASSNAMES[variant])}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  )
}
