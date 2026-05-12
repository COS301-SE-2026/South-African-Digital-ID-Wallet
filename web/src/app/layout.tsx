import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { CitizenSidebar } from '@/components/organisms/citizen-sidebar'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FlashID',
  description: 'South African Digital ID Wallet',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="flex min-h-screen bg-background">
          <CitizenSidebar />

          <div className="min-h-screen flex-1">
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
