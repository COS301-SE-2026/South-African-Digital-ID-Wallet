'use client'

import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Copy, CheckCircle2, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

import { Text, Button } from '@/components/atoms'
import { institutionService } from '@/services/institution-service'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

const VISIBLE_SECONDS = 5 * 60

type RevealApiKeyPageProps = {
  readonly token?: string
}

export const RevealApiKeyPage = ({ token = '' }: RevealApiKeyPageProps) => {
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(VISIBLE_SECONDS)
  const hidden = secondsLeft <= 0

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

  useEffect(() => {
    if (!data?.apiKey || hidden) return

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [data?.apiKey, hidden, secondsLeft])

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

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const countdownLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`

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

          {data?.apiKey && !hidden && (
            <div className="flex w-full flex-col items-center gap-4">
              <CheckCircle2 className="h-10 w-10 text-deep-green" />
              <div className="w-full break-all rounded-xl border border-yellow-400 bg-cream-background p-4 text-center font-mono text-sm">
                {data.apiKey}
              </div>
              <Button variant="primary" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy API Key'}
              </Button>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock className="h-4 w-4" />
                <Text variant="sub-sm" className="text-gray-500">
                  This key will hide from view in {countdownLabel}
                </Text>
              </div>
              <Text variant="sub-sm" className="text-center text-gray-500">
                This key will not be shown on this page again. Copy it now and
                store it somewhere secure, such as a password manager or your
                server&apos;s environment configuration -not in plain text, chat
                messages, or shared documents.
              </Text>
            </div>
          )}

          {data?.apiKey && hidden && (
            <div className="flex flex-col items-center gap-2 text-center">
              <Clock className="h-10 w-10 text-gray-400" />
              <Text variant="sub-md">
                This key has been hidden from view for security.
              </Text>
              <Text variant="sub-sm" className="text-gray-500">
                If you copied it, it&apos;s already on your clipboard. If not,
                ask your FlashID administrator to regenerate your API key to get
                a new one-time link.
              </Text>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
