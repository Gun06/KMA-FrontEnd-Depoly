import React from 'react';
import EventLayoutWrapper from '@/components/event/EventLayoutWrapper';

interface EventLayoutProps {
  children: React.ReactNode;
  params: {
    eventId: string;
  };
}

async function fetchInitialMainBannerColor(eventId: string): Promise<string | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  if (!baseUrl) return null;

  try {
    const response = await fetch(
      `${baseUrl}/api/v1/public/event/${eventId}/mainpage-images`,
      {
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const color = data?.mainBannerColor;
    return typeof color === 'string' && color.length > 0 ? color : null;
  } catch (error) {
    return null;
  }
}

export default async function EventIdLayout({ children, params }: EventLayoutProps) {
  const initialMainBannerColor = await fetchInitialMainBannerColor(params.eventId);

  return (
    <EventLayoutWrapper
      eventId={params.eventId}
      initialMainBannerColor={initialMainBannerColor}
    >
      {children}
    </EventLayoutWrapper>
  );
}

