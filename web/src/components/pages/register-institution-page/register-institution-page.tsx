import { Building2, KeyRound, Landmark, ShieldCheck } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import { RegisterInstitutionForm } from '@/components/organisms'
import { QuickActionsRow } from '@/components/organisms/quick-action-row/quick-action-row'

const QUICK_ACTIONS = [
  {
    key: 'view-institutions',
    icon: <Landmark className="h-5 w-5" />,
    title: 'View Institutions',
    description: 'Browse registered institutions',
    href: '/gov-admin/view-institutions',
  },
]

const GUIDELINES = [
  {
    icon: Building2,
    title: 'Use the official name',
    description: 'Enter the name exactly as it appears on government records.',
  },
  {
    icon: ShieldCheck,
    title: 'Check the verification number',
    description: 'It must match the number issued to the institution.',
  },
  {
    icon: KeyRound,
    title: 'Store the API key securely',
    description: 'The key is only shown once, straight after registration.',
  },
]

export const RegisterInstitutionPage = () => {
  return (
    <div className="flex min-h-full overflow-x-hidden bg-[#f6f2ea]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
          <section className="min-w-0 lg:col-span-8">
            <div className="relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
              <div className="rounded-[24px] bg-card p-6 sm:p-8">
                <RegisterInstitutionForm />
              </div>
            </div>
          </section>

          <div className="flex min-w-0 flex-col gap-4 lg:col-span-4">
            <QuickActionsRow actions={QUICK_ACTIONS} />
            <div className="rounded-[24px] border-2 border-black bg-card p-6">
              <Text
                as="h2"
                variant="h4"
                className="!text-lg font-extrabold text-deep-green"
              >
                Before you submit
              </Text>
              <ul className="mt-2 flex flex-col divide-y divide-black/10">
                {GUIDELINES.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex items-start gap-4 py-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <Text
                        as="p"
                        variant="sub-sm"
                        className="!text-sm font-bold text-text-primary"
                      >
                        {title}
                      </Text>
                      <Text
                        as="p"
                        variant="sub-sm"
                        className="mt-0.5 !text-xs text-muted-text"
                      >
                        {description}
                      </Text>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
