import { Construction, Sparkles } from 'lucide-react'

export function UnderConstructionPage() {
  return (
    <main className="flex min-h-full items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold/20">
          <Construction className="h-8 w-8 text-accent-gold" />
        </div>

        <h1 className="text-2xl font-extrabold text-deep-green">
          Page Under Construction
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-text">
          This part of FlashID is still being built. The foundations are in, the
          tools are out, and the pixels are trying their best.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-green/10 px-4 py-2 text-sm font-semibold text-primary-green">
          <Sparkles className="h-4 w-4" />
          Coming soon
        </div>
      </div>
    </main>
  )
}
