'use client'
import { useState } from 'react'

export default function VerifyCitizen() {
  const [saId, setSaId] = useState('')
  const [pin, setPin] = useState('')

  function handleVerfication() {
    //TODO: integration
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <section>
          <span className="inline-flex rounded-full bg-primary-green/20 px-3 py-1 text-xs font-semibold text-secomdary-foreground">
            Step 1 of 3
          </span>
        </section>
      </div>
    </main>
  )
}
