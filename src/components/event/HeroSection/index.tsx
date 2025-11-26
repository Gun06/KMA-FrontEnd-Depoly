'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import defaultSubmenuBanner from '@/assets/images/event/submenu_banner.png';

interface HeroSectionProps {
  eventId: string;
  className?: string;
  eventInfo?: {
    eventInfo: {
      nameKr: string;
      nameEng: string;
      startDate: string;
      region: string;
      mainBannerPcImageUrl: string;
      mainBannerMobileImageUrl: string;
      mainBannerColor: string;
    };
  } | null;
}

export default function HeroSection({
  eventId,
  className = '',
  eventInfo: propEventInfo,
}: HeroSectionProps) {
  // CSR 전용 캐시 리더
  const readCachedMain = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`hero_main_${eventId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.data || null;
    } catch {
      return null;
    }
  };

  // 상태: 이벤트 데이터, 배경색, 배너 이미지 (SSR/CSR 일치 유지)
  const [eventData, setEventData] = useState<{
    eventInfo: {
      nameKr: string;
      nameEng: string;
      startDate: string;
      region: string;
      mainBannerPcImageUrl: string;
      mainBannerMobileImageUrl: string;
      mainBannerColor: string;
    };
  } | null>(propEventInfo ?? null);
  const [error, setError] = useState<string | null>(null);
  // 텍스트도 SSR/CSR 일치: 최초에는 빈 문자열로 렌더, 클라이언트에서 채움
  const [titleEng, setTitleEng] = useState<string>('');
  const [titleKr, setTitleKr] = useState<string>('');
  // 사이드메뉴배너 이미지 URL (로컬 스토리지 캐시도 확인)
  const readCachedSideBanner = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`hero_side_banner_${eventId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // 1시간 이내 캐시만 유효
      if (Date.now() - parsed.ts < 60 * 60 * 1000) {
        return parsed.url;
      }
      return null;
    } catch {
      return null;
    }
  };
  const [sideBannerImageUrl, setSideBannerImageUrl] = useState<string | null>(readCachedSideBanner());
  const [isLoadingSideBanner, setIsLoadingSideBanner] = useState<boolean>(false);

  // CSR 시 로컬 캐시 우선 반영
  useEffect(() => {
    if (propEventInfo) return;
    const cached = readCachedMain();
    if (cached) {
      setEventData(prev => prev ?? cached);
    }
  }, [eventId, propEventInfo]);

  // 배너 이미지: SSR은 빈 상태로 시작, 클라이언트에서 실제 값으로 치환
  useEffect(() => {
    // 타이틀 텍스트 (빈 문자열로 시작 → 클라이언트에서만 채움)
    if (typeof window !== 'undefined') {
      const cachedInfo = readCachedMain();
      const eng =
        propEventInfo?.eventInfo?.nameEng ||
        eventData?.eventInfo?.nameEng ||
        cachedInfo?.eventInfo?.nameEng ||
        '';
      const kr =
        propEventInfo?.eventInfo?.nameKr ||
        eventData?.eventInfo?.nameKr ||
        cachedInfo?.eventInfo?.nameKr ||
        '';
      setTitleEng(eng || '');
      setTitleKr(kr || '');
    }
  }, [
    eventId,
    propEventInfo,
    eventData?.eventInfo?.mainBannerColor,
    eventData?.eventInfo?.mainBannerPcImageUrl,
    eventData?.eventInfo?.mainBannerMobileImageUrl,
  ]);

  // URL 쿼리와 동기화를 강제로 수행하지 않고, 컨텍스트만 갱신

  // URL 쿼리와 동기화를 강제로 수행하지 않고, 컨텍스트만 갱신

  // 데이터 페치 (캐시/prop 없을 때만)
  useEffect(() => {
    if (propEventInfo) return;

    const fetchEventData = async () => {
      try {
        setError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

        // 환경 변수 체크
        if (!API_BASE_URL) {
          setError('API 서버 설정이 필요합니다.');
          return;
        }

        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;
        const response = await fetch(API_ENDPOINT);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const normalized = {
          eventInfo: {
            nameKr: data.nameKr,
            nameEng: data.nameEng,
            startDate: data.startDate,
            region: data.region,
            mainBannerPcImageUrl: data.mainBannerPcImageUrl,
            mainBannerMobileImageUrl: data.mainBannerMobileImageUrl,
            mainBannerColor: data.mainBannerColor,
          },
        };
        setEventData(normalized);
        try {
          localStorage.setItem(
            `hero_main_${eventId}`,
            JSON.stringify({ data: normalized, ts: Date.now() })
          );
        } catch {}
      } catch (error) {

        if (
          error instanceof TypeError &&
          error.message.includes('Failed to fetch')
        ) {
          setError(
            'API 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
          );
        } else {
          setError('이벤트 정보를 불러올 수 없습니다.');
        }
      }
    };

    // 캐시가 없을 때만 호출
    if (!readCachedMain()) fetchEventData();
  }, [eventId, propEventInfo]);

  // 사이드메뉴배너 이미지 조회
  useEffect(() => {
    const fetchSideBanner = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        if (!API_BASE_URL) return;

        const response = await fetch(
          `${API_BASE_URL}/api/v1/public/event/${eventId}/side-banner`,
          { cache: 'no-store' }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data?.sideBannerImgUrl) {
            setSideBannerImageUrl(data.sideBannerImgUrl);
          }
        }
      } catch (error) {
        // 에러가 발생해도 기본 이미지를 사용하므로 에러 상태는 설정하지 않음
      }
    };

    if (eventId) {
      fetchSideBanner();
    }
  }, [eventId]);

  // 항상 동일한 마크업 구조 유지 (SSR/CSR 경고 방지)
  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      <div className="relative w-full">
        <div className="sm:hidden" style={{ paddingBottom: '20%' }}></div>
        <div
          className="hidden sm:block md:hidden"
          style={{ height: '150px' }}
        ></div>
        <div
          className="hidden md:block lg:hidden"
          style={{ height: '150px' }}
        ></div>
        <div className="hidden lg:block" style={{ height: '200px' }}></div>
        {/* 배너 이미지 */}
        {sideBannerImageUrl && (
        <Image
            src={sideBannerImageUrl}
          alt=""
          aria-hidden={true}
          fill
          className="object-cover relative z-10"
          priority
          sizes="(max-width: 768px) 100vw, 100vw"
        />
        )}

        {/* 텍스트 오버레이 */}
        <div className="absolute inset-0 flex items-center z-20">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <h1 className="text-sm sm:text-lg md:text-lg lg:text-2xl xl:text-2xl font-vitro-core mb-1 sm:mb-2">
                {titleEng}
              </h1>
              <p className="text-xl sm:text-3xl md:text-3xl lg:text-5xl xl:text-5xl font-vitro-core">
                {titleKr}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
