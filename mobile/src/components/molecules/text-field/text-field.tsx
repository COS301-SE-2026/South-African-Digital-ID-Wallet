import { useState } from 'react'
import { useField, useFormikContext } from 'formik'
import { Eye, EyeOff } from 'lucide-react-native'
import { Pressable, TextInput, View } from 'react-native'

import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'

import type { BaseTextFieldProps, TextFieldProps } from './types'

const BaseTextField = ({
  className,
  error,
  label,
  LeftIcon,
  secure = false,
  ...rest
}: BaseTextFieldProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const hasError = Boolean(error)

  return (
    <View className="w-full gap-1.5">
      {label ? (
        <Text variant="label" className="text-text-primary">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'flex-row items-center gap-2 rounded-xl border bg-clean-white px-4',
          hasError ? 'border-danger-red' : 'border-border-grey',
          className
        )}
      >
        {LeftIcon ? <LeftIcon size={20} color={colors.textMuted} /> : null}
        <TextInput
          className="flex-1 py-3.5 text-base text-text-primary"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure && !isVisible}
          {...rest}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setIsVisible((previous) => !previous)}
          >
            {isVisible ? (
              <EyeOff size={20} color={colors.textMuted} />
            ) : (
              <Eye size={20} color={colors.textMuted} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" className="text-danger-red">
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const FormikTextField = ({
  name,
  ...rest
}: BaseTextFieldProps & { name: string }) => {
  const [field, meta, helpers] = useField<string>(name)

  return (
    <BaseTextField
      error={meta.touched ? meta.error : undefined}
      onBlur={() => helpers.setTouched(true)}
      onChangeText={helpers.setValue}
      value={field.value}
      {...rest}
    />
  )
}

export const TextField = ({ name, ...rest }: TextFieldProps) => {
  const formik = useFormikContext()

  if (name && formik) {
    return <FormikTextField name={name} {...rest} />
  }

  return <BaseTextField {...rest} />
}
