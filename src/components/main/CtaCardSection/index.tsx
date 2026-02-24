'use client'

import React from 'react'
import CtaCard from './CtaCard'

interface CtaCardsProps {
  presets?: Array<'android' | 'ios'>
  className?: string
}

export default function CtaCards({ presets = ['android', 'ios'], className = '' }: CtaCardsProps) {
  return (
    <section aria-label="앱 다운로드" className={`relative ${className}`}>
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-5 lg:px-6">
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
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

