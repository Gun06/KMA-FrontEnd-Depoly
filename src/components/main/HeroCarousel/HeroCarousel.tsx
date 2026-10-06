'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay } from 'swiper/modules';
import { useState, useEffect, useRef } from 'react';
import { MainBannerItem } from '@/types/event';
import ApiBannerSlide from './ApiBannerSlide';
import { HERO_OVERLAY_POSITION_CLASS } from './heroOverlayLayout';
import 'swiper/css';

const RESIZE_DEBOUNCE_MS = 180;

/** 로딩·빈 데이터 — ApiBannerSlide·마감임박 오버레이(z-30)와 겹치지 않게 배경만 z-[1] */
function HeroBannerSkeleton() {
  return (
    <div className="absolute inset-0 z-[1] h-full w-full overflow-hidden" aria-hidden>
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800" />
      <div className="pointer-events-none absolute inset-0 bg-black/45" />

      <div className={`${HERO_OVERLAY_POSITION_CLASS} gap-2.5 sm:gap-3`}>
        <div className="h-6 w-[5.25rem] shrink-0 animate-pulse rounded-full bg-white/25 sm:h-7 sm:w-24" />
        <div className="h-10 w-[min(92%,540px)] max-w-xl animate-pulse rounded-sm bg-white/35 sm:h-11 md:h-12 lg:h-14 xl:h-[3.75rem]" />
        <div className="h-6 w-[min(78%,420px)] max-w-lg animate-pulse rounded-sm bg-white/28 sm:h-7 md:h-8" />
        <div className="mt-2 h-10 w-[min(96%,520px)] max-w-xl animate-pulse rounded-md bg-[#FFED00]/45 sm:mt-3 md:mt-4 lg:h-11" />
      </div>

      <div className="absolute bottom-12 right-3 sm:right-5 sm:bottom-14 md:bottom-16 lg:bottom-16">
        <div className="h-7 w-[3.25rem] animate-pulse rounded-[20px] bg-black/40 sm:h-8" />
      </div>
    </div>
  );
}

interface MarathonHeroCarouselProps {
  /** 메인 스크롤 덮개 레이아웃: 뷰포트 높이에 맞춤 */
  fillViewport?: boolean;
}

export default function MarathonHeroCarousel({ fillViewport = false }: MarathonHeroCarouselProps) {
  const [bannerData, setBannerData] = useState<MainBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  // API에서 메인 배너 데이터 가져오기
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_USER || 'http://localhost:8080';
        const response = await fetch(`${baseUrl}/api/v1/public/main-page/main-banner`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data: MainBannerItem[] = await response.json();
          // orderNo 기준으로 정렬
          const sortedData = data.sort((a, b) => a.orderNo - b.orderNo);
          setBannerData(sortedData);
        } else {
          setError('배너 데이터를 불러올 수 없습니다.');
        }
      } catch (err) {
        setError('배너 데이터를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  const total = bannerData.length;
  const showSkeleton = isLoading || bannerData.length === 0;

  // 리사이즈 시 Swiper는 디바운스로만 갱신 (실제 사이트처럼 버벅임 방지)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        swiperRef.current?.update();
        timer = null;
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`relative w-full hero-section ${fillViewport ? 'hero-section--fill-viewport h-full min-h-0 max-h-none' : 'kma-main-hero-height max-[1023px]:aspect-auto'}`}
    >
      {/* 스켈레톤: 첫 페인트부터 보이도록 전환 지연 없음. 데이터 로드 전까지 Swiper는 마운트하지 않음(빈 슬라이드 플래시 방지). */}
      {showSkeleton ? (
        <div className="absolute inset-0 h-full w-full overflow-hidden" aria-busy="true" aria-label="메인 배너 로딩">
          <HeroBannerSkeleton />
        </div>
      ) : null}

      {!showSkeleton ? (
        <div className="relative z-10 h-full w-full">
          <Swiper
            modules={[Autoplay]}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            autoplay={{ delay: 8000, disableOnInteraction: false }}
            speed={350}
            loop={total > 1}
            slidesPerView={1}
            centeredSlides={false}
            spaceBetween={0}
            updateOnWindowResize
            observer
            observeParents
            className="h-full"
            onSlideChange={(swiper) => {
              const idx = typeof swiper.realIndex === 'number' && Number.isFinite(swiper.realIndex)
                ? swiper.realIndex
                : 0;
              setActiveIndex(idx);
            }}
          >
            {bannerData.map((banner, index) => (
              <SwiperSlide key={`api-banner-${banner.eventId}-${index}`}>
                <ApiBannerSlide
                  id={index}
                  imageUrl={banner.imageUrl}
                  title={banner.title}
                  subtitle={banner.subTitle}
                  date={banner.date}
                  eventId={banner.eventId}
                  eventNameKr={banner.eventNameKr}
                  total={total}
                  currentIndex={activeIndex}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : null}

      {/* 실제 사이트 방식: aspect-ratio로 높이 결정 (리사이즈 시 한 번에 계산, 버벅임 방지) */}
      <style jsx global>{`
        .hero-section {
          width: 100%;
          max-height: 800px;
          contain: layout;
        }
        .hero-section--fill-viewport {
          aspect-ratio: unset !important;
          min-height: 0 !important;
          max-height: none !important;
          height: 100% !important;
        }
        @media (max-width: 1023px) {
          .hero-section:not(.hero-section--fill-viewport) {
            aspect-ratio: auto !important;
          }
        }
        .hero-section > div,
        .hero-section .swiper,
        .hero-section .swiper-wrapper,
        .hero-section .swiper-slide {
          height: 100%;
        }
        .swiper-slide .hero-anim {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 800ms ease, transform 900ms ease;
          will-change: opacity, transform;
        }
        .swiper-slide-active .hero-anim {
          opacity: 1;
          transform: translateY(0);
        }
        .swiper-slide-active .hero-badge { transition-delay: 180ms; }
        .swiper-slide-active .hero-title { transition-delay: 360ms; }
        .swiper-slide-active .hero-date { transition-delay: 540ms; }
        .swiper-slide-active .hero-readmore { transition-delay: 630ms; }
      `}</style>
    </div>
  );
}
