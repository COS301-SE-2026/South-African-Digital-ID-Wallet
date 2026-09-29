import { Card, IconTile, Text } from '@/components/atoms'

import type { QuickActionTileProps } from './types'
import { Car } from 'lucide-react-native'

export const QuickActionTile = ({
  className,
  Icon,
  label,
  onPress,
  testID,
  tone = 'green',
}: QuickActionTileProps) => (
  <Card
    accessibilityLabel={label}
    className={className}
    onPress={onPress}
    testID={testID}
  >
    <IconTile Icon={Icon} size="md" tone={tone} />
    <Text variant="sub-sm" className="mt-3 font-semibold text-text-primary">
      {label}
    </Text>
  </Card>
)
