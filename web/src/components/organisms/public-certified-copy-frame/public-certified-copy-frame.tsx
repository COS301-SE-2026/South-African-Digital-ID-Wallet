import type { PublicCertifiedCopyFrameProps } from './types'

export function PublicCertifiedCopyFrame({
  children,
}: Readonly<PublicCertifiedCopyFrameProps>) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f4ea] px-4 py-6 text-[#053b2c] sm:px-8 sm:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-[#e4eadc]/70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-[-5rem] h-80 w-80 rounded-full bg-[#e4eadc]/70"
      />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <section className="flex flex-1 items-center justify-center py-10 sm:py-14">
          {children}
        </section>
        <footer className="flex flex-wrap items-center justify-center gap-4 pb-2 text-sm text-[#34434b] sm:gap-6">
          <span>Powered by FlashID</span>
          <span aria-hidden="true" className="text-[#9ca3af]">
            |
          </span>
          <span>Prove yourself in a flash.</span>
        </footer>
      </div>
    </main>
  )
}