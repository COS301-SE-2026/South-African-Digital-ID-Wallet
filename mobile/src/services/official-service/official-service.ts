import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import { toOfficerBadge } from './official-dto'
import officialUrls from './official-urls'
import type {
  BadgeTokenResponse,
  OfficerBadge,
  VerifyBadgeResponse,
  OfficialStatsResponse,
} from './types'

const getStats = () =>
  api
    .get(officialUrls.stats())
    .then((res: AxiosResponse<OfficialStatsResponse>) => res.data)

const generateBadgeToken = () =>
  api
    .post(officialUrls.badgeToken())
    .then((res: AxiosResponse<BadgeTokenResponse>) => res.data)

const verifyBadge = (token: string) =>
  api
    .post(officialUrls.verifyBadge(), { token })
    .then((res: AxiosResponse<VerifyBadgeResponse>) => res.data)

const getBadge = async (): Promise<OfficerBadge> => {
  const issued = await generateBadgeToken()
  const verified = await verifyBadge(issued.token)
  return toOfficerBadge(issued, verified)
}

const officialService = { generateBadgeToken, getBadge, verifyBadge, getStats }

export default officialService
