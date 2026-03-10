'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface MainPageImagesInfo {
  mainBannerColor: string;
  mainBannerPcImageUrl: string;
  mainBannerMobileImageUrl: string;
  mainOutlinePcImageUrl: string;
  mainOutlineMobileImageUrl: string;
}

/** mainpage-images 응답에서 중간배너 URL 추출 (camelCase / snake_case) */
function normalizeOutlineFromRaw(raw: Record<string, unknown> | null): Pick<MainPageImagesInfo, 'mainOutlinePcImageUrl' | 'mainOutlineMobileImageUrl'> | null {
  if (!raw || typeof raw !== 'object') return null;
  const get = (camel: string, snake: string): string => {
    const v = (raw[camel] ?? raw[snake]) as string | undefined;
    return typeof v === 'string' ? v : '';
  };
  return {
    mainOutlinePcImageUrl: get('mainOutlinePcImageUrl', 'main_outline_pc_image_url'),
    mainOutlineMobileImageUrl: get('mainOutlineMobileImageUrl', 'main_outline_mobile_image_url'),
  };
}

function hasOutlineImages(data: MainPageImagesInfo | null): boolean {
  if (!data) return false;
  const pc = (data.mainOutlinePcImageUrl ?? '').trim();
  const mobile = (data.mainOutlineMobileImageUrl ?? '').trim();
  return pc.length > 0 || mobile.length > 0;
}

interface MiddleSectionProps {
  eventId?: string;
  className?: string;
  eventInfo?: MainPageImagesInfo;
}

export default function MiddleSection({
  eventId,
  className = '',
  eventInfo: propEventInfo,
}: MiddleSectionProps) {
  const [eventInfo, setEventInfo] = useState<MainPageImagesInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const CACHE_TTL = 15 * 60 * 1000;
  const getCachedEventInfo = (): MainPageImagesInfo | null => {
    if (typeof window === 'undefined' || !eventId) return null;
    try {
      const raw = localStorage.getItem(`hero_main_${eventId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL) return null;
      const data = parsed?.data;
      if (!data || typeof data !== 'object') return null;
      const outline = normalizeOutlineFromRaw(data as Record<string, unknown>);
      return { ...data, ...outline } as MainPageImagesInfo;
    } catch {
      return null;
    }
  };

  // 컴포넌트 마운트 후 데이터 로드
  useEffect(() => {
    setIsMounted(true);
    if (propEventInfo) {
      setEventInfo(propEventInfo);
    } else {
      const cached = getCachedEventInfo();
      if (cached) {
        setEventInfo(cached);
      }
    }
  }, [eventId, propEventInfo]);

  // API에서 이벤트 정보 가져오기 (캐시 없거나 캐시에 중간배너 URL 없으면 재요청)
  useEffect(() => {
    if (!isMounted || propEventInfo || !eventId) return;

    const fetchEventInfo = async () => {
      const cached = getCachedEventInfo();
      if (cached && hasOutlineImages(cached)) return;

      setIsLoading(true);
      setError(null);
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        if (!API_BASE_URL) {
          setError('API 서버 설정이 필요합니다.');
          return;
        }

        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;
        const response = await fetch(API_ENDPOINT);

        if (response.ok) {
          const data = await response.json();
          const outline = normalizeOutlineFromRaw(data && typeof data === 'object' ? data : null);
          const merged = { ...(data && typeof data === 'object' ? data : {}), ...outline } as MainPageImagesInfo;
          setEventInfo(merged);
          try {
            localStorage.setItem(`hero_main_${eventId}`, JSON.stringify({ data: merged, ts: Date.now() }));
          } catch {}
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        if (err instanceof TypeError && (err as Error).message?.includes('Failed to fetch')) {
          setError('API 서버에 연결할 수 없습니다.');
        } else {
          setError('이벤트 정보를 불러올 수 없습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventInfo();
  }, [eventId, propEventInfo, isMounted]);

  const resolvedInfo = eventInfo || propEventInfo || null;
  const pcUrl = resolvedInfo?.mainOutlinePcImageUrl?.trim();
  const mobileUrl = resolvedInfo?.mainOutlineMobileImageUrl?.trim();
  const desktopImage = isMounted && pcUrl ? pcUrl : null;
  const mobileImage = isMounted && mobileUrl ? mobileUrl : null;
  const hasImages = Boolean(desktopImage || mobileImage);

  const showSkeleton = !hasImages;

  if (error && !eventInfo) {
    return (
      <section className={`relative w-full overflow-hidden ${className}`}>
        <div className="relative w-full min-h-[200px] flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="mb-2">오류가 발생했습니다</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      <div className="relative w-full">
        {/* 스켈레톤 UI - 메인 사이트 방식: absolute 오버레이 */}
        <div 
          className="absolute inset-0 w-full h-full bg-gray-50 transition-opacity duration-300"
          style={{
            opacity: showSkeleton ? 1 : 0,
            zIndex: showSkeleton ? 50 : 0,
            pointerEvents: showSkeleton ? 'auto' : 'none'
          }}
        >
            {/* 데스크톱용 이미지 스켈레톤 (768px 이상) */}
            <div className="relative w-full hidden md:block">
              <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 animate-pulse" />
            </div>
            
            {/* 모바일용 이미지 스켈레톤 (768px 미만) */}
            <div className="relative w-full block md:hidden">
              <div className="w-full h-[300px] sm:h-[350px] bg-gray-200 animate-pulse" />
            </div>
        </div>

        {/* 데스크톱용 이미지 (768px 이상) - 스켈레톤이 아닐 때만 표시 */}
        {!showSkeleton && desktopImage && (
          <div className="relative w-full hidden md:block">
            <Image
              src={desktopImage}
              alt="청주 마라톤 중간 섹션"
              width={0}
              height={0}
              className="w-full h-auto object-contain"
              priority={true}
              quality={85}
              sizes="100vw"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
        
        {/* 모바일용 이미지 (768px 미만) - 스켈레톤이 아닐 때만 표시 */}
        {!showSkeleton && mobileImage && (
          <div className="relative w-full block md:hidden">
            <Image
              src={mobileImage}
              alt="청주 마라톤 중간 섹션 모바일"
              width={0}
              height={0}
              className="w-full h-auto object-contain"
              priority={true}
              quality={85}
              sizes="100vw"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
