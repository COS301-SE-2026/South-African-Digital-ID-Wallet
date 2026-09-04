import { ActivityIndicator, Pressable, View } from 'react-native'
import { useFormikContext } from 'formik'

import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'

import type { BaseButtonProps, ButtonVariant, ButtonProps } from './types'

const CONTAINER_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'bg-deep-green',
  secondary: 'border border-border-grey bg-clean-white',
  text: 'bg-transparent',
  danger: 'border border-danger-red bg-clean-white',
}

const LABEL_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'text-clean-white',
  secondary: 'text-text-primary',
  text: 'text-primary-green',
  danger: 'text-danger-red',
}

const ICON_COLORS: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.textPrimary,
  text: colors.primaryGreen,
  danger: colors.danger,
}

export const BaseButton = ({
  className,
  disabled = false,
  isLoading = false,
  label,
  LeftIcon,
  onPress,
  testID,
  variant = 'primary',
}: BaseButtonProps) => {
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
            <LeftIcon size={18} color={ICON_COLORS[variant]} />
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

const FormikSubmitButton = ({ disabled, ...rest }: BaseButtonProps) => {
  const { dirty, handleSubmit, isSubmitting, isValid } = useFormikContext()
  return (
    <BaseButton
      {...rest}
      disabled={disabled || isSubmitting || !isValid || !dirty}
      isLoading={isSubmitting}
      onPress={() => handleSubmit()}
    />
  )
}

export const Button = ({ type = 'button', ...rest }: ButtonProps) => {
  const formik = useFormikContext()

  if (type === 'submit' && formik) {
    return <FormikSubmitButton {...rest} />
  }

  return <BaseButton {...rest} />
}
