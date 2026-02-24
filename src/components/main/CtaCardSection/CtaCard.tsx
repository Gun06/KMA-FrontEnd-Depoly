'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image, { StaticImageData } from 'next/image'
import playstoreImg from '@/assets/images/main/playstore.webp'
import appstoreImg from '@/assets/images/main/appstore.png'

type CtaCardVariant = 'primary' | 'teal'
type CtaCardPreset = 'android' | 'ios'
type CtaCardImageSrc = StaticImageData | string

const PRESET_IMAGES: Record<CtaCardPreset, StaticImageData> = {
  android: playstoreImg,
  ios: appstoreImg,
}

export interface CtaCardProps {
  preset?: CtaCardPreset
  title?: string
  description?: string
  href?: string
  image?: CtaCardImageSrc
  imageAlt?: string
  variant?: CtaCardVariant
  gradientClassName?: string
  className?: string
}

const PRESETS: Record<CtaCardPreset, {
  title: string
  description: string
  href: string
  imageAlt: string
  variant: CtaCardVariant
}> = {
  android: {
    title: 'Android 다운로드',
    description: '전국마라톤협회 공식 앱을 Android에서 만나보세요. 곧 출시됩니다.',
    href: '#',
    imageAlt: 'Google Play에서 다운로드',
    variant: 'primary',
  },
  ios: {
    title: 'iOS 다운로드',
    description: '전국마라톤협회 공식 앱을 iOS에서 만나보세요. 곧 출시됩니다.',
    href: '#',
    imageAlt: 'App Store에서 다운로드',
    variant: 'primary',
  },
}

export default function CtaCard({
  preset = 'android',
  title,
  description,
  href,
  image,
  imageAlt,
  variant,
  gradientClassName,
  className = '',
}: CtaCardProps) {
  const presetValues = PRESETS[preset]
  const resolvedVariant: CtaCardVariant = variant ?? presetValues?.variant ?? 'primary'
  const resolvedTitle = title ?? presetValues?.title ?? ''
  const resolvedDescription = description ?? presetValues?.description ?? ''
  const resolvedHref = href ?? presetValues?.href ?? '#'
  const resolvedImage = image ?? PRESET_IMAGES[preset]
  const resolvedImageAlt = imageAlt ?? presetValues?.imageAlt ?? ''
  const variantGradients: Record<CtaCardVariant, string> = {
    primary: 'from-[#1e3a5f] via-[#1d4ed8] to-[#38bdf8]',
    teal: 'from-[#134e4a] via-[#0f766e] to-[#5eead4]',
  }
  const gradient = gradientClassName ?? variantGradients[resolvedVariant]
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  const [widthMode, setWidthMode] = useState<'base' | 'full'>('base')
  const [lineClamp, setLineClamp] = useState<number>(3)
  const [isWide, setIsWide] = useState<boolean>(false)

  useEffect(() => {
    const el = descriptionRef.current
    if (!el) return

    const measureLines = () => {
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth
      const wide = viewportWidth >= 1000
      setIsWide(wide)
      if (!wide) {
        setLineClamp(2)
        setWidthMode('base')
        return
      }
      setLineClamp(3)
      const prevDisplay = el.style.display
      const prevOverflow = el.style.overflow
      const prevClamp = (el.style as any).WebkitLineClamp
      const prevOrient = (el.style as any).WebkitBoxOrient

      el.style.display = 'block'
      el.style.overflow = 'visible'
      ;(el.style as any).WebkitLineClamp = 'unset'
      ;(el.style as any).WebkitBoxOrient = 'unset'

      const computed = window.getComputedStyle(el)
      let lineHeight = parseFloat(computed.lineHeight || '0')
      if (!isFinite(lineHeight) || lineHeight === 0) {
        const fontSize = parseFloat(computed.fontSize || '16')
        lineHeight = fontSize * 1.2
      }
      const height = el.getBoundingClientRect().height
      const lines = lineHeight > 0 ? Math.round(height / lineHeight) : 0

      el.style.display = prevDisplay
      el.style.overflow = prevOverflow
      ;(el.style as any).WebkitLineClamp = prevClamp
      ;(el.style as any).WebkitBoxOrient = prevOrient

      if (lines > 3 && widthMode !== 'full') {
        setWidthMode('full')
      } else if (lines <= 3 && widthMode !== 'base') {
        setWidthMode('base')
      }
    }

    const raf = requestAnimationFrame(measureLines)
    const ro = new ResizeObserver(measureLines)
    ro.observe(el)
    window.addEventListener('resize', measureLines)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measureLines)
      cancelAnimationFrame(raf)
    }
  }, [resolvedDescription, widthMode])
  return (
    <Link
      href={resolvedHref}
      className={`group block w-full cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 transition duration-300 ease-out hover:shadow-md md:hover:shadow-lg hover:-translate-y-[2px] active:scale-[0.99] ${className}`}
      aria-label={resolvedTitle}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-r from-black/40 via-black/25 to-transparent"
      />
      <div className="grid h-[120px] md:h-[150px] grid-cols-12 p-4 md:p-5">
        <div className="col-span-12 lg:col-span-9 flex flex-col justify-center relative z-10">
          <h3 className="font-pretendard-extrabold text-white text-[18px] md:text-[22px] mb-2 truncate pl-3 antialiased">{resolvedTitle}</h3>
          <p
            ref={descriptionRef}
            className={`font-pretendard text-white/90 text-[14px] md:text-[16px] leading-relaxed rounded-md px-3 py-2 max-w-full antialiased`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: String(lineClamp),
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: isWide ? (widthMode === 'base' ? '95%' : '100%') : '100%'
            }}
          >
            {resolvedDescription}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-3 relative">
          <div
            className={`absolute right-1.5 md:right-4 top-[30%] md:top-[35%] lg:top-1/2 -translate-y-1/2 w-[180px] md:w-[260px] aspect-[4/3] z-0 flex items-center justify-end origin-center transition-transform duration-300 ease-out ${preset === 'android' ? '-rotate-[10deg] group-hover:-rotate-[8deg]' : 'rotate-[10deg] group-hover:rotate-[8deg]'}`}
          >
            {resolvedImage ? (
              <Image
                src={resolvedImage}
                alt={resolvedImageAlt}
                fill
                sizes="(max-width: 768px) 220px, 340px"
                className="object-contain object-right pointer-events-none transition-transform duration-300 ease-out group-hover:scale-110 group-hover:translate-x-1 md:group-hover:translate-x-2 group-active:scale-105"
                priority
              />
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}


