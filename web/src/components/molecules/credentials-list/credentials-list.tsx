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
}: CredentialsListProps) => {}

export default CredentialsList
