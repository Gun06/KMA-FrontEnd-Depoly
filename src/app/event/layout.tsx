'use client'
import React from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import EventLayout, { EventLayoutThemed } from '@/layouts/event/EventLayout'
import { EventsProvider } from '@/contexts/EventsContext'

const MAP_BG: Record<string, string> = {
  dark: 'bg-neutral-900',
  light: 'bg-white',
  black: 'bg-black',
  // 덜 쨍한 톤으로 조정 (한 단계 어둡게)
  blue: 'bg-blue-700',
  red: 'bg-red-700',
  green: 'bg-emerald-700',
  indigo: 'bg-indigo-700',
  slate: 'bg-slate-900',
  // 그라데이션 프리셋
  'grad-indigo': 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-600',
  'grad-blue': 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600',
  'grad-emerald': 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600',
  'grad-red': 'bg-gradient-to-r from-red-900 via-red-800 to-red-600',
  'grad-purple': 'bg-gradient-to-r from-purple-900 via-purple-800 to-purple-600',
  'grad-orange': 'bg-gradient-to-r from-orange-900 via-orange-800 to-orange-600',
  'grad-rose': 'bg-gradient-to-r from-rose-900 via-rose-800 to-rose-600',
  'grad-cyan': 'bg-gradient-to-r from-cyan-900 via-cyan-800 to-cyan-600',
}

// 텍스트 색상은 테마로 제어하지 않습니다 (요청에 따라 비활성화)

export default function EventLayoutWrapper({ children }: { children: React.ReactNode }) {
  const params = useSearchParams()
  const pathParams = useParams()
  const eventId = pathParams.eventId as string

  // theme=dark|light (양쪽 일괄)
  const theme = params.get('theme') || ''
  const hb = params.get('hb') || '' // header bg key
  const fb = params.get('fb') || '' // footer bg key
  const color = params.get('color') || '' // mainBannerColor

  // white 테마 제거: 배경/텍스트에서 white 키 무시
  const normalizedTheme = theme === 'white' ? '' : theme
  const normalizedHb = hb === 'white' ? '' : hb
  const normalizedFb = fb === 'white' ? '' : fb

  const headerBgClass = MAP_BG[normalizedHb] || MAP_BG[normalizedTheme] || undefined
  const footerBgClass = MAP_BG[normalizedFb] || MAP_BG[normalizedTheme] || undefined

  // 포인트 색 결정: 그라데이션은 끝색 기준, black 키면 red 고정
  const resolveAccent = (key?: string): string | undefined => {
    if (!key) return undefined
    if (key === 'black' || key === 'dark' || key === 'slate') return '#ef4444'
    if (key.startsWith('grad-')) {
      // grad-emerald → emerald의 to색과 유사한 톤 사용
      const map: Record<string, string> = {
        'grad-indigo': '#4f46e5',
        'grad-blue': '#2563eb',
        'grad-emerald': '#059669',
        'grad-red': '#dc2626',
        'grad-purple': '#7c3aed',
        'grad-orange': '#ea580c',
        'grad-rose': '#e11d48',
        'grad-cyan': '#0891b2',
      }
      return map[key] || undefined
    }
    const flatMap: Record<string, string> = {
      indigo: '#4f46e5',
      blue: '#2563eb',
      green: '#059669',
      red: '#dc2626',
      purple: '#7c3aed',
      orange: '#ea580c',
      rose: '#e11d48',
      cyan: '#0891b2',
      gray: '#f59e0b',
      black: '#000000',
    }
    return flatMap[key] || undefined
  }

  const accentColor = resolveAccent(normalizedHb || normalizedTheme) || '#ef4444'

  // 파라미터가 없으면 기본 레이아웃 사용
  const hasAny = Boolean(theme || hb || fb)

  if (!hasAny) {
    return <EventLayout eventId={eventId} mainBannerColor={color || undefined}>{children}</EventLayout>
  }

  return (
    <EventsProvider>
      <EventLayoutThemed 
        eventId={eventId} 
        headerBgClass={headerBgClass} 
        footerBgClass={footerBgClass} 
        accentColor={color || accentColor}
      >
        {children}
      </EventLayoutThemed>
    </EventsProvider>
  )
}
