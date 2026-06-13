'use client'

import React from 'react'
import CtaCard from './CtaCard'

interface CtaCardsProps {
  presets?: Array<'android' | 'ios'>
  className?: string
}

export default function CtaCards({ presets = ['ios', 'android'], className = '' }: CtaCardsProps) {
  return (
    <section aria-label="앱 다운로드" className={`relative pb-2 sm:pb-1 lg:pb-6 ${className}`}>
      <div className="mx-auto max-w-[1920px] px-4 sm:px-5 lg:px-[6vw]">
        <div className="grid grid-cols-1 gap-4 sm:gap-4 md:gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
          {presets.map((p) => (
            <div
              key={p}
              className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 sm:rounded-2xl lg:rounded-lg lg:shadow-none lg:ring-0"
            >
              <CtaCard preset={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { default as CtaCard } from './CtaCard'
