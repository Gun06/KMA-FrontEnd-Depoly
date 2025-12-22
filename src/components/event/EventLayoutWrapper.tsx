'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import EventLayout, { EventLayoutThemed } from '@/layouts/event/EventLayout';
import { MainBannerProvider } from '@/components/providers/MainBannerContext';

const MAP_BG: Record<string, string> = {
  dark: 'bg-neutral-900',
  light: 'bg-white',
  black: 'bg-black',
  blue: 'bg-blue-700',
  red: 'bg-red-700',
  green: 'bg-emerald-700',
  indigo: 'bg-indigo-700',
  slate: 'bg-slate-900',
  yellow: 'bg-yellow-300',
  'grad-indigo': 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-600',
  'grad-blue': 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600',
  'grad-emerald': 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600',
  'grad-red': 'bg-gradient-to-r from-red-900 via-red-800 to-red-600',
  'grad-purple': 'bg-gradient-to-r from-purple-900 via-purple-800 to-purple-600',
  'grad-orange': 'bg-gradient-to-r from-orange-900 via-orange-800 to-orange-600',
  'grad-rose': 'bg-gradient-to-r from-rose-900 via-rose-800 to-rose-600',
  'grad-cyan': 'bg-gradient-to-r from-cyan-900 via-cyan-800 to-cyan-600',
  'grad-yellow': 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200',
};

interface EventLayoutWrapperProps {
  children: React.ReactNode;
  eventId: string;
  initialMainBannerColor?: string | null;
}

const resolveAccent = (key?: string): string | undefined => {
  if (!key) return undefined;
  if (key === 'black' || key === 'dark' || key === 'slate') return '#ef4444';
  if (key.startsWith('grad-')) {
    const map: Record<string, string> = {
      'grad-indigo': '#4f46e5',
      'grad-blue': '#2563eb',
      'grad-emerald': '#059669',
      'grad-red': '#dc2626',
      'grad-purple': '#7c3aed',
      'grad-orange': '#ea580c',
      'grad-rose': '#e11d48',
      'grad-cyan': '#0891b2',
      'grad-yellow': '#fbbf24',
    };
    return map[key] || undefined;
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
    yellow: '#fbbf24',
    gray: '#f59e0b',
    black: '#000000',
  };
  return flatMap[key] || undefined;
};

export default function EventLayoutWrapper({
  children,
  eventId,
  initialMainBannerColor,
}: EventLayoutWrapperProps) {
  const searchParams = useSearchParams();

  const theme = searchParams.get('theme') || '';
  const hb = searchParams.get('hb') || '';
  const fb = searchParams.get('fb') || '';
  const colorParam = searchParams.get('color') || '';

  const normalizedTheme = theme === 'white' ? '' : theme;
  const normalizedHb = hb === 'white' ? '' : hb;
  const normalizedFb = fb === 'white' ? '' : fb;

  const headerBgClass = MAP_BG[normalizedHb] || MAP_BG[normalizedTheme] || undefined;
  const footerBgClass = MAP_BG[normalizedFb] || MAP_BG[normalizedTheme] || undefined;

  const accentColor = resolveAccent(normalizedHb || normalizedTheme) || '#ef4444';
  const effectiveMainColor = colorParam || initialMainBannerColor || '';

  const hasThemeParams = Boolean(theme || hb || fb);

  if (!hasThemeParams) {
    return (
      <EventLayout eventId={eventId} mainBannerColor={effectiveMainColor || undefined}>
        {children}
      </EventLayout>
    );
  }

  const providerInitialColor = colorParam || initialMainBannerColor || accentColor || null;
  const themedAccentColor = colorParam || initialMainBannerColor || accentColor;

  return (
    <MainBannerProvider initialMainBannerColor={providerInitialColor}>
      <EventLayoutThemed
        eventId={eventId}
        headerBgClass={headerBgClass}
        footerBgClass={footerBgClass}
        accentColor={themedAccentColor}
      >
        {children}
      </EventLayoutThemed>
    </MainBannerProvider>
  );
}

