'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SectionHeading } from './section-heading'

export function ComponentLibrarySection() {
  return (
    <section id="components" className="scroll-mt-24">
      <SectionHeading>Component Library</SectionHeading>
      <p className="text-[14px] mb-6 text-muted-foreground">
        If the Button or Card components are modified, this section updates
        automatically.
      </p>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="default">default variant</Button>
              <Button variant="secondary">secondary</Button>
              <Button variant="outline">Cancel</Button>
              <Button variant="ghost">Dismiss</Button>
              <Button variant="destructive">Delete account</Button>
              <Button variant="link">Learn more</Button>
              <Button size="xs">XS</Button>
              <Button size="sm">SM</Button>
              <Button size="default">default size</Button>
              <Button size="lg">LG</Button>
              <Button disabled>Disabled</Button>
              <Button aria-invalid>Invalid state</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Verified</Badge>
              <Badge variant="secondary">Pending</Badge>
              <Badge variant="destructive">Failed</Badge>
              <Badge variant="outline">Draft</Badge>
              <Badge variant="ghost">Archived</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
            <div>
              <p className="text-muted-foreground mb-1">default</p>
              <Input placeholder="ID number" />
            </div>
            <div>
              <p className="text-muted-foreground mb-1">disabled</p>
              <Input placeholder="ID number" disabled />
            </div>
            <div>
              <p className="text-muted-foreground mb-1">invalid</p>
              <Input placeholder="ID number" aria-invalid />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
