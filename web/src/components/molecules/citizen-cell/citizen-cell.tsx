import { FC } from 'react'
import { Avatar } from '@/components/atoms/avatar/avatar'
import { Text } from '@/components/atoms/text'
import type { CitizenCellProps } from './types'

export const CitizenCell: FC<CitizenCellProps> = ({
  initials,
  name,
  idNumber,
}) => {
  return (
    <div className="flex items-center gap-3">
      <Avatar initials={initials} />
      <div className="flex flex-col">
        <Text
          as="span"
          variant="sub-sm"
          className="font-semibold text-deep-green"
        >
          {name}
        </Text>
        <Text as="span" variant="caption">
          {idNumber}
        </Text>
      </div>
    </div>
  )
}
