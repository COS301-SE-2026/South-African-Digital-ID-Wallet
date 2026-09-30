'use client'
import { toast } from 'react-hot-toast'
import { FC, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Text } from '@/components/atoms'
import {
  CertifiedCopyGenerated,
  CredentialDetailCard,
  GenCopyProgress,
} from '@/components/molecules'
import {
  credentialService,
  toCredentialView,
  type CredentialResponse,
} from '@/services/credential-service'
import { certifiedCopyService } from '@/services/certified-copy-service'

type CopyModalState = 'progress' | 'generated' | null
export const MyCredentialsPage: FC = () => {
  const searchParams = useSearchParams()
  const preselected = searchParams.get('selected')
  const [selectedId, setSelectedId] = useState<string | null>(preselected)
  const [selectedCredential, setSelectedCredential] =
    useState<CredentialResponse | null>(null)
  const [copyModal, setCopyModal] = useState<CopyModalState>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [generatedAt, setGeneratedAt] = useState('')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['credentials', 'me'],
    queryFn: () => credentialService.getMine(),
  })
  const views = useMemo(() => (data ?? []).map(toCredentialView), [data])
  const selected = views.find((view) => view.id === selectedId) ?? views[0]
  const selectedResponse =
    data?.find((credential) => credential.id === selected?.id) ?? null
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null)
  const [generatedFileName, setGeneratedFileName] = useState('')

  const handleGenerateCertifiedCopy = async (
    credential: CredentialResponse
  ) => {
    setSelectedCredential(credential)
    setGeneratedAt('')

    setGeneratedPdfUrl(null)
    setCurrentStep(1)
    setCopyModal('progress')

    try {
      setCurrentStep(2)

      const result = await certifiedCopyService.generate(credential.id, {
        credentialType: credential.type,
      })

      setCurrentStep(3)

      const pdfUrl = URL.createObjectURL(result.blob)

      setGeneratedPdfUrl(pdfUrl)
      setGeneratedFileName(result.fileName)
      setGeneratedAt(new Date().toISOString())
      setCopyModal('generated')
    } catch (error) {
      console.error('Failed to generate certified copy', error)
      setCopyModal(null)
      toast.error('Could not generate certified copy. Please try again.')
    }
  }
  const closeCopyModal = () => {
    if (generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl)
    }

    setGeneratedPdfUrl(null)
    setGeneratedFileName('')
    setCopyModal(null)
    setSelectedCredential(null)
  }

  return (
    <main className="min-h-screen bg-cream-background px-4 py-4 text-deep-green sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6">
        {isLoading && <Text variant="sub-md">Loading credentials.</Text>}
        {isError && (
          <Text variant="sub-md" className="text-red">
            Failed to load the credentials.
          </Text>
        )}
        {data && views.length === 0 && (
          <Text variant="sub-md">No credentials.</Text>
        )}
        {views.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {views.map((view) => {
                const Icon = view.icon
                const isActive = view.id === selected?.id

                return (
                  <div
                    key={view.id}
                    className={`rounded-2xl border bg-card p-4 transition ${
                      isActive
                        ? 'border-deep-green shadow-sm'
                        : 'hover:border-deep-green'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(view.id)}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-green/10">
                        <Icon className="h-6 w-6 text-primary-green" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Text
                          as="p"
                          variant="sub-sm"
                          className="truncate font-semibold text-deep-green"
                        >
                          {view.title}
                        </Text>
                        <Text as="p" variant="sub-sm" className="truncate">
                          {view.issuer}
                        </Text>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
            {selected && selectedResponse && (
              <CredentialDetailCard
                key={selected.id}
                credential={selected}
                onGenerateCertifiedCopy={() => {
                  handleGenerateCertifiedCopy(selectedResponse)
                }}
              />
            )}
          </div>
        )}
      </div>
      {copyModal === 'progress' && (
        <GenCopyProgress currentStep={currentStep} />
      )}
      {copyModal === 'generated' && selectedCredential && generatedPdfUrl && (
        <CertifiedCopyGenerated
          credential={selectedCredential}
          generatedAt={generatedAt}
          pdfUrl={generatedPdfUrl}
          fileName={generatedFileName}
          onBack={closeCopyModal}
        />
      )}
    </main>
  )
}
