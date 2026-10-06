"use client";

import { useMemo } from 'react';
import { TopSection } from '@/components/event/TopSection';
import { MiddleSection } from '@/components/event/MiddleSection';
import { SnsSection } from '@/components/event/SnsSection';
import { BottomNoticeSection } from '@/components/event/BottomNoticeSection';
import NoticeSection from '@/components/event/NoticeSection';
import { FloatingApplyButton } from '@/components/event/FloatingButton';
import { EventPopupManager } from '@/components/event/Popup';
import EventNotFoundModal from '@/components/event/EventNotFoundModal';
import EventMarathonLoader from '@/components/event/EventMainPageLoader/EventMarathonLoader';
import { useEventMainPageAssets } from '@/hooks/useEventMainPageAssets';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

function normalizeYoutubeEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '');

    let videoId = '';
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v') ?? '';
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1] ?? '';
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1] ?? '';
      }
    } else if (host === 'youtu.be') {
      videoId = parsed.pathname.replace('/', '');
    }

    if (!videoId) return null;

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    embedUrl.searchParams.set('autoplay', '1');
    embedUrl.searchParams.set('mute', '1');
    embedUrl.searchParams.set('playsinline', '1');
    embedUrl.searchParams.set('rel', '0');
    embedUrl.searchParams.set('controls', '0');
    embedUrl.searchParams.set('modestbranding', '1');
    embedUrl.searchParams.set('iv_load_policy', '3');
    embedUrl.searchParams.set('disablekb', '1');
    return embedUrl.toString();
  } catch {
    return null;
  }
}

const FLAT_ACCENT: Record<string, string> = {
  indigo: '#4f46e5',
  blue: '#2563eb',
  green: '#059669',
  emerald: '#059669',
  red: '#dc2626',
  purple: '#7c3aed',
  orange: '#ea580c',
  rose: '#e11d48',
  cyan: '#0891b2',
  yellow: '#fbbf24',
};

function resolveLoaderAccent(value?: string): string {
  const mobilePrimary = '#16A34A';
  if (!value) return mobilePrimary;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value;
  if (value.startsWith('grad-')) {
    const key = value.replace('grad-', '');
    return FLAT_ACCENT[key] ?? mobilePrimary;
  }
  return FLAT_ACCENT[value] ?? mobilePrimary;
}

export default function EventPage({ params }: EventPageProps) {
  const { eventId } = params;
  const {
    isReady,
    isLoading,
    showNotFound,
    errorMessage,
    mainPage,
    promotion,
  } = useEventMainPageAssets(eventId);

  const youtubeEmbedUrl = useMemo(
    () => normalizeYoutubeEmbedUrl(mainPage?.youtubeUrl),
    [mainPage?.youtubeUrl]
  );

  const showContent = isReady || showNotFound || Boolean(errorMessage);
  const loaderAccent = resolveLoaderAccent(mainPage?.mainBannerColor);

  return (
    <div className="relative">
      <EventMarathonLoader
        visible={isLoading}
        accentColor={loaderAccent}
        eventName={mainPage?.nameKr}
      />

      {showContent && (
        <>
          <EventPopupManager eventId={eventId} />

          <div className="hidden md:block bg-gray-50 border-b border-gray-200">
            <div className="container mx-auto">
              <NoticeSection
                eventId={eventId}
                className="py-4"
                autoRotate={true}
                rotateInterval={4000}
              />
            </div>
          </div>

          <TopSection
            eventId={eventId}
            showYoutube={false}
            eventInfo={mainPage ?? undefined}
          />

          <MiddleSection eventId={eventId} eventInfo={mainPage ?? undefined} />

          <SnsSection eventId={eventId} eventInfo={promotion ?? undefined} />

          {youtubeEmbedUrl && (
            <div className="w-full bg-black">
              <div className="relative w-full aspect-video">
                <iframe
                  src={youtubeEmbedUrl}
                  title="대회 메인 영상"
                  className="absolute inset-0 h-full w-full pointer-events-none"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <BottomNoticeSection eventId={eventId} />

          <FloatingApplyButton eventId={eventId} />
        </>
      )}

      <EventNotFoundModal isOpen={showNotFound} />
    </div>
  );
}
