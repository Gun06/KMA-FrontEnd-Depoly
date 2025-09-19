'use client'

import React from 'react'
import CtaCard from './CtaCard'

interface CtaCardsProps {
  presets?: Array<'group' | 'payment'>
  className?: string
}

export default function CtaCards({ presets = ['group', 'payment'], className = '' }: CtaCardsProps) {
  return (
    <section aria-label="FAQ 바로가기" className={`relative ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid gap-2 md:gap-4 lg:grid-cols-2 lg:gap-6 xl:gap-8">
          {presets.map((p) => (
            <div key={p} className="bg-white rounded-lg shadow-none border border-white p-3 md:p-4 lg:p-6">
              <CtaCard preset={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { default as CtaCard } from './CtaCard'

