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

const PRESETS: Record<
  CtaCardPreset,
  {
    title: string
    description: string
    href: string
    imageAlt: string
    variant: CtaCardVariant
  }
> = {
  android: {
    title: 'Android 다운로드',
    description: '전국마라톤협회 공식 앱을 Android에서 만나보세요. 곧 출시됩니다.',
    href: '#',
    imageAlt: 'Google Play에서 다운로드',
    variant: 'teal',
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
    primary: 'from-[#1e3a5f] via-[#1d4ed8] to-[#2563eb]',
    teal: 'from-[#2563eb] via-[#3b82f6] to-[#60a5fa]',
  }
  const gradient = gradientClassName ?? variantGradients[resolvedVariant]
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  const [widthMode, setWidthMode] = useState<'base' | 'full'>('base')
  const [lineClamp, setLineClamp] = useState(3)
  const [isWide, setIsWide] = useState(false)

  useEffect(() => {
    const el = descriptionRef.current
    if (!el) return

    const measureLines = () => {
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth
      const wide = viewportWidth >= 1024
      setIsWide(wide)
      if (!wide) {
        setLineClamp(2)
        setWidthMode('base')
        return
      }

      setLineClamp(3)
      const prevDisplay = el.style.display
      const prevOverflow = el.style.overflow
      const prevClamp = (el.style as CSSStyleDeclaration & { WebkitLineClamp?: string })
        .WebkitLineClamp
      const prevOrient = (el.style as CSSStyleDeclaration & { WebkitBoxOrient?: string })
        .WebkitBoxOrient

      el.style.display = 'block'
      el.style.overflow = 'visible'
      ;(el.style as CSSStyleDeclaration & { WebkitLineClamp?: string }).WebkitLineClamp =
        'unset'
      ;(el.style as CSSStyleDeclaration & { WebkitBoxOrient?: string }).WebkitBoxOrient =
        'unset'

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
      ;(el.style as CSSStyleDeclaration & { WebkitLineClamp?: string }).WebkitLineClamp =
        prevClamp
      ;(el.style as CSSStyleDeclaration & { WebkitBoxOrient?: string }).WebkitBoxOrient =
        prevOrient

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

  const imageRotate =
    preset === 'android'
      ? '-rotate-[8deg] sm:-rotate-[10deg]'
      : 'rotate-[8deg] sm:rotate-[10deg]'

  return (
    <Link
      href={resolvedHref}
      className={`group relative block w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br sm:rounded-3xl ${gradient} shadow-md shadow-black/5 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.99] ${className}`}
      aria-label={resolvedTitle}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-r from-black/25 via-black/10 to-transparent"
      />

      {/* 모바일·태블릿: 텍스트·이미지 2열 / lg: 기존 레이아웃 */}
      <div className="relative z-10 grid min-h-[118px] grid-cols-[minmax(0,1fr)_76px] grid-rows-[auto_auto] gap-x-3 gap-y-2 px-4 pb-4 pt-6 sm:min-h-[124px] sm:grid-cols-[minmax(0,1fr)_88px] sm:gap-x-4 sm:gap-y-2.5 sm:px-5 sm:pb-4 sm:pt-6 md:grid-cols-[minmax(0,1fr)_96px] lg:hidden">
        <h3 className="col-start-1 row-start-1 self-end font-pretendard-extrabold text-[16px] leading-tight tracking-tight text-white antialiased sm:text-[17px] md:text-lg">
          {resolvedTitle}
        </h3>
        <p className="col-start-1 row-start-2 line-clamp-2 font-pretendard text-[12px] leading-[1.45] text-white/90 antialiased sm:text-[13px] sm:leading-snug md:text-sm">
          {resolvedDescription}
        </p>
        {resolvedImage ? (
          <div
            className={`relative col-start-2 row-span-2 row-start-1 h-[76px] w-full max-w-[76px] justify-self-end self-center sm:h-[84px] sm:max-w-[88px] md:h-[88px] md:max-w-[96px] ${imageRotate}`}
          >
            <Image
              src={resolvedImage}
              alt={resolvedImageAlt}
              fill
              sizes="(max-width: 640px) 80px, 92px"
              className="pointer-events-none object-contain object-center transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
        ) : null}
      </div>

      <div className="relative z-10 hidden h-[150px] grid-cols-12 p-5 lg:grid">
        <div className="relative z-10 col-span-9 flex flex-col justify-center">
          <h3 className="mb-2 truncate pl-3 font-pretendard-extrabold text-[22px] text-white antialiased">
            {resolvedTitle}
          </h3>
          <p
            ref={descriptionRef}
            className="max-w-full rounded-md px-3 py-2 font-pretendard text-[16px] leading-relaxed text-white/90 antialiased"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: String(lineClamp),
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: isWide ? (widthMode === 'base' ? '95%' : '100%') : '100%',
            }}
          >
            {resolvedDescription}
          </p>
        </div>
        <div className="relative col-span-3">
          {resolvedImage ? (
            <div
              className={`absolute right-4 top-1/2 z-0 flex aspect-[4/3] w-[260px] -translate-y-1/2 items-center justify-end origin-center transition-transform duration-300 ease-out ${imageRotate} group-hover:scale-105`}
            >
              <Image
                src={resolvedImage}
                alt={resolvedImageAlt}
                fill
                sizes="340px"
                className="pointer-events-none object-contain object-right"
                priority
              />
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
