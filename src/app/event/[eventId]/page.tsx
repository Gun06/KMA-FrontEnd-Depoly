"use client";

import { useEffect, useState } from 'react';
import { TopSection } from '@/components/event/TopSection';
import { MiddleSection } from '@/components/event/MiddleSection';
import { SnsSection } from '@/components/event/SnsSection';
import { BottomNoticeSection } from '@/components/event/BottomNoticeSection';
import NoticeSection from '@/components/event/NoticeSection';
import { FloatingApplyButton } from '@/components/event/FloatingButton';
import { EventPopupManager } from '@/components/event/Popup';
import EventNotFoundModal from '@/components/event/EventNotFoundModal';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  const { eventId } = params;
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | null>(null);

  const normalizeYoutubeEmbedUrl = (url: string | undefined): string | null => {
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
  };

  // 404 에러 감지
  useEffect(() => {
    const checkEventExists = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        if (!API_BASE_URL) {
          return;
        }

        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;
        const response = await fetch(API_ENDPOINT);
        if (response.ok) {
          const data = await response.json();
          const maybeYoutube = typeof data?.youtubeUrl === 'string' ? data.youtubeUrl : undefined;
          setYoutubeEmbedUrl(normalizeYoutubeEmbedUrl(maybeYoutube));
        }

        if (response.status === 404) {
          // 404 에러 응답 본문 확인
          try {
            const errorData = await response.json();
            // NOT_FOUND_EVENT 코드 확인
            if (errorData.code === 'NOT_FOUND_EVENT' || errorData.httpStatus === 'NOT FOUND') {
              setShowNotFoundModal(true);
            } else {
              setShowNotFoundModal(true);
            }
          } catch {
            // JSON 파싱 실패 시에도 404이면 모달 표시
            setShowNotFoundModal(true);
          }
        } else if (!response.ok) {
          // 다른 에러도 404로 처리 (비공개 대회 등)
          setShowNotFoundModal(true);
        }
      } catch (_error) {
        // 네트워크 에러 등은 무시 (컴포넌트에서 처리)
      }
    };

    checkEventExists();
  }, [eventId]);

  // 404 모달이 표시되면 다른 컴포넌트는 렌더링하지 않음
  if (showNotFoundModal) {
    return (
      <div className="relative">
        {/* 배경은 블러 처리되므로 기본 페이지는 그대로 렌더링 */}
        <div>
          {/* 대회 팝업 */}
          <EventPopupManager eventId={eventId} />

          {/* Notice 섹션 */}
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
          
          {/* TopSection */}
          <TopSection 
            eventId={eventId} 
            showYoutube={false}
          />
          
          {/* Middle 섹션 */}
          <MiddleSection eventId={eventId} />
          
          {/* SNS 섹션 */}
          <SnsSection eventId={eventId} />

          {/* 공지사항 섹션 위 유튜브 영상 */}
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
          
          {/* 공지사항 섹션 */}
          <BottomNoticeSection eventId={eventId} />
          
          {/* 플로팅 참가신청 버튼 */}
          <FloatingApplyButton eventId={eventId} />
        </div>

        {/* 404 모달 */}
        <EventNotFoundModal isOpen={showNotFoundModal} />
      </div>
    );
  }

  return (
    <div>
      {/* 대회 팝업 */}
      <EventPopupManager eventId={eventId} />

      {/* Notice 섹션 */}
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
      
      {/* TopSection */}
      <TopSection 
        eventId={eventId} 
        showYoutube={false}
      />
      
      {/* Middle 섹션 */}
      <MiddleSection eventId={eventId} />
      
      {/* SNS 섹션 */}
      <SnsSection eventId={eventId} />

      {/* 공지사항 섹션 위 유튜브 영상 */}
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
      
      {/* 공지사항 섹션 */}
      <BottomNoticeSection eventId={eventId} />
      
      {/* 플로팅 참가신청 버튼 */}
      <FloatingApplyButton eventId={eventId} />
    </div>
  );
}
