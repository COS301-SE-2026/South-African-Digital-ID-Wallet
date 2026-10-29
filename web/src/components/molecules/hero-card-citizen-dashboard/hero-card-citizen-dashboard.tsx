'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { IdCard, QrCode, UserRoundCheck } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import type { CitizenStatus } from '@/services/manage-user-account-service/types'

type WalletHeroCardProps = {
  status: CitizenStatus | null
  isUnlinkedCitizen: boolean
  isStatusLoading: boolean
  isStatusError: boolean
  photoUrl: string | null
  isCredentialsLoading: boolean
  isCredentialsError: boolean
}

export function WalletHeroCard({
  status,
  isUnlinkedCitizen,
  isStatusLoading,
  isStatusError,
  photoUrl,
  isCredentialsLoading,
  isCredentialsError,
}: WalletHeroCardProps) {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null)
  const photoFailed = photoUrl !== null && failedPhotoUrl === photoUrl

  return (
    <div className="relative overflow-hidden rounded-[28px]">
      <div className="relative overflow-hidden rounded-[26px] bg-deep-green px-6 py-7 md:px-8 md:py-8">
        <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="max-w-xl">
            <Text
              as="h1"
              variant="sub-lg"
              className="text-2xl font-extrabold tracking-tight text-clean-white md:text-3xl lg:text-4xl"
            >
              This is your FlashID
              <span className="text-accent-gold"> wallet dashboard.</span>
            </Text>

            <p className="mt-3 max-w-lg text-sm leading-6 text-clean-white/70 md:text-base">
              Present your secure QR code whenever an authorised service
              provider needs to verify your identity.
            </p>
          </div>

          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 scale-110 rounded-[28px] bg-accent-gold/10 blur-2xl" />
            <div className="relative rounded-[26px] bg-gradient-to-br from-clean-white via-clean-white to-[#f0eee5] p-3 shadow-2xl shadow-black/30">
              <div className="mb-2 flex items-center justify-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-deep-green" />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-deep-green">
                  FlashID
                </span>
              </div>

              <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-clean-white p-3 md:h-40 md:w-40">
                {isStatusLoading ? (
                  <span
                    role="status"
                    className="text-center text-xs text-muted-text"
                  >
                    Loading...
                  </span>
                ) : isStatusError ? (
                  <span className="text-center text-xs text-muted-text">
                    Unavailable
                  </span>
                ) : status === 'Pending' || isUnlinkedCitizen ? (
                  <>
                    <Link
                      href="/citizen/verify-identity"
                      aria-label="Link Citizen Record"
                      className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-gray-100 px-2 text-center transition-colors duration-200 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2"
                    >
                      <UserRoundCheck
                        aria-hidden="true"
                        className="h-11 w-11 text-gray-700"
                      />
                      <span className="text-xs font-semibold text-gray-800">
                        Link Citizen Record
                      </span>
                    </Link>
                  </>
                ) : status === null ? (
                  <span className="text-center text-xs text-muted-text">
                    Unavailable
                  </span>
                ) : status === 'Verified' ? (
                  <>
                    <Link
                      href="/citizen/activate-credentials"
                      aria-label="Activate Credentials"
                      className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-gray-100 px-2 text-center transition-colors duration-200 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2"
                    >
                      <IdCard
                        aria-hidden="true"
                        className="h-11 w-11 text-gray-700"
                      />
                      <span className="text-xs font-semibold text-gray-800">
                        Activate Credentials
                      </span>
                    </Link>
                  </>
                ) : status === 'Activated' ? (
                  <>
                    {isCredentialsLoading ? (
                      <span
                        role="status"
                        className="text-center text-xs text-muted-text"
                      >
                        Loading...
                      </span>
                    ) : isCredentialsError ? (
                      <span className="text-center text-xs text-muted-text">
                        Unavailable
                      </span>
                    ) : photoUrl && !photoFailed ? (
                      <div className="relative h-full w-full overflow-hidden rounded-xl">
                        <Image
                          src={photoUrl}
                          alt="Citizen identity photograph"
                          fill
                          unoptimized
                          className="object-cover"
                          onError={() => setFailedPhotoUrl(photoUrl)}
                        />
                      </div>
                    ) : (
                      <span className="text-center text-xs text-muted-text">
                        Photograph unavailable
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-center text-xs text-muted-text">
                    Account unavailable
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
