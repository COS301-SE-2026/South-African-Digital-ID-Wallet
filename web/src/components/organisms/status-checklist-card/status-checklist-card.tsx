'use client'

import { StatusItem, Text } from '@/components/atoms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { StatusChecklistCardProps } from './types'

export const StatusChecklistCard = ({
  className,
  icon: Icon,
  items,
  title,
}: Readonly<StatusChecklistCardProps>) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-deep-green" />}
        <Text variant="h4">{title}</Text>
      </CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      {items.map((item) => (
        <StatusItem done={item.done} key={item.label} label={item.label} />
      ))}
    </CardContent>
  </Card>
)
