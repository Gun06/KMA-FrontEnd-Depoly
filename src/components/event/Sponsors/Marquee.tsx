"use client"
import React from 'react'
import Image, { StaticImageData } from 'next/image'
import host01 from '@/assets/images/event/host01.jpeg'
import host02 from '@/assets/images/event/host02.jpeg'
import subjectivity01 from '@/assets/images/event/subjectivity01.png'
import subjectivity02 from '@/assets/images/event/subjectivity02.png'
import boost01 from '@/assets/images/event/boost01.png'
import boost02 from '@/assets/images/event/boost02.png'
import boost03 from '@/assets/images/event/boost03.png'
import boost04 from '@/assets/images/event/boost04.svg'
type Logo = {
  src: StaticImageData | string
  alt: string
  href?: string
  width?: number
  height?: number
}

interface SponsorsMarqueeProps {
  hosts?: Logo[]
  organizers?: Logo[]
  sponsors?: Logo[]
}

// 속도는 이 파일에서만 제어 (단일 소스)
const SPEED_MS = 50000 // 50초

// 기본 이미지를 코드에 고정하지 않습니다(빌드 환경에 파일이 없을 수 있음)
const defaultHosts: Logo[] = [
  { src: host01, alt: 'host01' },
  { src: host02, alt: 'host02' },
]
const defaultOrganizers: Logo[] = [
  { src: subjectivity01, alt: 'subjectivity01' },
  { src: subjectivity02, alt: 'subjectivity02' },
]
const defaultSponsors: Logo[] = [
  { src: boost01, alt: 'boost01' },
  { src: boost02, alt: 'boost02' },
  { src: boost03, alt: 'boost03' },
  { src: boost04, alt: 'boost04' },
]

export default function SponsorsMarqueeLegacy({ hosts = defaultHosts, organizers = defaultOrganizers, sponsors = defaultSponsors }: SponsorsMarqueeProps) {
  const all: Array<{ type: 'host' | 'organizer' | 'sponsor'; logo: Logo }> = [
    ...hosts.map((l) => ({ type: 'host' as const, logo: l })),
    ...organizers.map((l) => ({ type: 'organizer' as const, logo: l })),
    ...sponsors.map((l) => ({ type: 'sponsor' as const, logo: l })),
  ]

  // 타이틀 라벨
  const labelMap: Record<'host' | 'organizer' | 'sponsor', string> = {
    host: '주최',
    organizer: '주관',
    sponsor: '후원',
  }

  const item = (entry: { type: 'host' | 'organizer' | 'sponsor'; logo: Logo }, idx: number) => {
    const badgeColorMap: Record<'host' | 'organizer' | 'sponsor', string> = {
      host: 'bg-red-100 text-red-800',
      organizer: 'bg-blue-100 text-blue-800',
      sponsor: 'bg-amber-100 text-amber-800',
    }
    const badge = (
      <span className={`absolute left-2 top-2 px-1 md:px-1.5 py-0.5 rounded-md text-[9px] md:text-xs whitespace-nowrap shadow-sm ${badgeColorMap[entry.type]}`}>
        {labelMap[entry.type]}
      </span>
    )
    const card = (
      <div className="relative h-16 w-[160px] md:h-24 md:w-[240px] rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {badge}
        <div className="h-full w-full grid place-items-center p-2">
          <Image
            src={entry.logo.src}
            alt={entry.logo.alt}
            width={entry.logo.width ?? 160}
            height={entry.logo.height ?? 48}
            className="max-h-8 md:max-h-12 w-auto object-contain"
          />
        </div>
      </div>
    )
    return (
      <li key={`${entry.type}-${idx}`} className="shrink-0">
        {entry.logo.href ? (
          <a href={entry.logo.href} aria-label={entry.logo.alt} className="block">
            {card}
          </a>
        ) : (
          card
        )}
      </li>
    )
  }

  // 트랙을 두 번 렌더해 무한 루프처럼 보이게 함
  const track = (
    <ul className="flex items-center gap-4 md:gap-8 px-3 md:px-4">
      {all.map((e, i) => item(e, i))}
    </ul>
  )

  return (
    <section aria-label="organizer" className="bg-white">
      <div className="mx-auto max-w-[1920px] px-0 md:px-4 py-6 md:py-8">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 md:w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 md:w-16 bg-gradient-to-l from-white to-transparent" />
          <div className="marquee flex w-max">
            {track}
            {track}
          </div>
        </div>
      </div>
      <style jsx>{`
        .marquee {
          animation: marquee ${SPEED_MS}ms linear infinite;
          will-change: transform;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}


