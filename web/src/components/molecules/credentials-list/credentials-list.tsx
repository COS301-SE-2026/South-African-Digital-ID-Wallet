import { Button } from '@/components/atoms'

import type { CredentialsListProps } from './types'

//mock information for now. will swap it out with real data stuffs
const defaultCredentials = [
  {
    id: 'dl-1',
    title: "Driver's Licence",
    issuer: 'RTMC',
    issued: '16 May 2025',
  },
  {
    id: 'id-1',
    title: 'National ID',
    issuer: 'Home Affairs',
    issued: '14 Apr 2024',
  },
]

export const CredentialsList = ({
  credentials = defaultCredentials,
}: CredentialsListProps) => {
  return (
    <div className="bg-card rounded-3xl border p-6">
      <h3 className="text-lg font-semibold mb-3">Your Credentials</h3>

      <div className="space-y-3">
        {credentials.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between border rounded-2xl p-3"
          >
            <div>
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-muted-text">
                {c.issuer} • {c.issued}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary">View</Button>
              <Button variant="text">Share</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CredentialsList
