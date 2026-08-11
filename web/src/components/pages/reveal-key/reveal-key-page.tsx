'use client'

import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Copy, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import { Text, Button } from '@/components/atoms'
import { institutionService } from '@/services/institution-service'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

type RevealApiKeyPageProps = {
  readonly token?: string
}

export const RevealApiKeyPage = ({ token = '' }: RevealApiKeyPageProps) => {
  const [copied, setCopied] = useState(false)

  const {
    mutate: reveal,
    data,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: () => institutionService.revealApiKey(token),
  })

  useEffect(() => {
    if (token) reveal()
  }, [token])

  const errorMessage =
    (error as { response?: { data?: { error?: string } } })?.response?.data
      ?.error || 'This link is invalid or has expired.'

  const handleCopy = async () => {
    if (!data?.apiKey) return
    await navigator.clipboard.writeText(data.apiKey)
    setCopied(true)
    toast.success('API key copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-background px-6 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Text variant="h1">Your API Key</Text>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pb-8">
          {!token && (
            <div className="flex flex-col items-center gap-2 text-center">
              <XCircle className="h-10 w-10 text-red-500" />
              <Text variant="sub-md">No token was provided in this link.</Text>
            </div>
          )}

          {token && isPending && (
            <Text variant="sub-md">Verifying your link...</Text>
          )}

          {token && isError && (
            <div className="flex flex-col items-center gap-2 text-center">
              <XCircle className="h-10 w-10 text-red-500" />
              <Text variant="sub-md" className="text-red-500">
                {errorMessage}
              </Text>
              <Text variant="sub-sm" className="text-gray-500">
                If your link expired, ask your FlashID administrator to
                regenerate your API key.
              </Text>
            </div>
          )}

          {data?.apiKey && (
            <div className="flex w-full flex-col items-center gap-4">
              <CheckCircle2 className="h-10 w-10 text-deep-green" />
              <div className="w-full break-all rounded-xl border border-yellow-400 bg-cream-background p-4 text-center font-mono text-sm">
                {data.apiKey}
              </div>
              <Button variant="primary" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy API Key'}
              </Button>
              <Text variant="sub-sm" className="text-center text-gray-500">
                This key will not be shown again. Store it securely now.
              </Text>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
