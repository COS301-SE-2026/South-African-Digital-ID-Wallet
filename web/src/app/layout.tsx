import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}

// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import './globals.css'
//
// import { AppSidebar } from '@/components/organisms/app-sidebar'
// import { citizenNavSections } from '@/config/navigation'
// import { AppTopBar } from '@/components/organisms/app-top-bar'
//
// const inter = Inter({
//   variable: '--font-inter',
//   subsets: ['latin'],
// })
//
// export const metadata: Metadata = {
//   title: 'FlashID',
//   description: 'South African Digital ID Wallet',
// }
// const mockUser = {
//   name: 'Unathi Tshakalisa',
//   initials: 'UT',
//   idLabel: 'ID: •••••••084',
// }
//
// const mockTopBar = {
//   title: 'Citizen Dashboard',
//   description:
//       'Manage your digital identity, credentials, sharing permissions and verification activity.',
// }
//
// export default function RootLayout({
//                                      children,
//                                    }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//       <html lang="en" className={inter.variable}>
//       <body>
//       <div className="flex h-screen overflow-hidden bg-background">
//         <AppSidebar navSections={citizenNavSections} user={mockUser} />
//
//         <div className="flex-1">
//           <AppTopBar
//               title={mockTopBar.title}
//               description={mockTopBar.description}
//               user={{
//                 name: mockUser.name,
//                 initials: mockUser.initials,
//               }}
//               showNotifications={false}
//           />
//           {children}
//         </div>
//       </div>
//       </body>
//       </html>
//   )
// }
