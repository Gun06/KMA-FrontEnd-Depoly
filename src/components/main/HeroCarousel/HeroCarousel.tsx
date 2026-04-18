'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay } from 'swiper/modules';
import { useState, useEffect, useRef } from 'react';
import { MainBannerItem } from '@/types/event';
import ApiBannerSlide from './ApiBannerSlide';
import 'swiper/css';

const RESIZE_DEBOUNCE_MS = 180;

/** 로딩·빈 데이터 시 실제 슬라이드와 동일한 자리·비율의 스켈레톤 */
function HeroBannerSkeleton() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-400 via-zinc-500 to-zinc-600" />
      <div className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden />
      <div
        className="absolute left-3 right-4 top-[calc(var(--kma-main-header-offset,64px)+0.75rem)] z-10 flex max-w-[min(100%,1000px)] flex-col items-start gap-2.5 pb-[clamp(5.25rem,22vw,8.25rem)] text-left sm:left-4 sm:right-6 sm:top-[calc(var(--kma-main-header-offset,64px)+0.9rem)] sm:gap-3 sm:pb-[clamp(6.75rem,28vw,10rem)] md:left-5 md:right-8 md:top-[calc(var(--kma-main-header-offset,64px)+1.05rem)] lg:right-auto lg:left-[6%] lg:top-[max(24%,calc(var(--kma-main-header-offset,64px)+1rem))] lg:max-w-[min(1000px,64vw)] lg:px-0 lg:pb-0 xl:top-[max(26%,calc(var(--kma-main-header-offset,64px)+1.25rem))]"
      >
        <div className="mb-1 flex flex-col gap-2 sm:mb-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
          <div className="h-7 w-14 shrink-0 animate-pulse rounded-md bg-white/35 sm:h-9 sm:w-16" />
          <div className="h-5 w-32 animate-pulse rounded bg-white/25 sm:h-6 sm:w-40" />
        </div>
        <div className="h-9 w-[92%] max-w-xl animate-pulse rounded-md bg-white/40 sm:h-11 md:h-12 lg:h-14 xl:h-16" />
        <div className="h-5 w-[72%] max-w-lg animate-pulse rounded bg-white/25 sm:h-6 md:h-7" />
        <div className="mt-1 h-9 w-32 animate-pulse rounded-md bg-[#FFED00]/35 sm:mt-2 sm:h-10 sm:w-36" />
        <div className="mt-3 hidden gap-2 sm:flex md:mt-4 md:gap-3">
          <div className="h-9 w-[5.5rem] animate-pulse rounded-md bg-white/30 md:h-10" />
          <div className="h-9 w-[5.5rem] animate-pulse rounded-md bg-white/20 md:h-10" />
          <div className="h-9 w-[5.5rem] animate-pulse rounded-md bg-white/20 md:h-10" />
        </div>
      </div>
      <div className="absolute bottom-5 right-5 z-10">
        <div className="h-8 w-[3.25rem] animate-pulse rounded-[20px] bg-black/50" />
      </div>
    </div>
  );
}

export default function MarathonHeroCarousel() {
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
    <div className="relative w-full max-h-[880px] hero-section">
      {/* 스켈레톤: 첫 페인트부터 보이도록 전환 지연 없음. 데이터 로드 전까지 Swiper는 마운트하지 않음(빈 슬라이드 플래시 방지). */}
      {showSkeleton ? (
        <div
          className="absolute inset-0 z-20 h-full w-full overflow-hidden"
          aria-busy="true"
          aria-label="메인 배너 로딩"
        >
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
          max-height: 880px;
          contain: layout;
        }
        @media (max-width: 639px) {
          .hero-section {
            /* 기존 3/4 대비 높이 약 2/3 (세로 약 1/3 축소) */
            aspect-ratio: 9 / 8;
            min-height: min(48vw, 254px);
            max-height: min(59vh, 374px);
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .hero-section {
            aspect-ratio: 16 / 10;
            min-height: 320px;
          }
        }
        @media (min-width: 1024px) {
          .hero-section {
            aspect-ratio: 16 / 10;
            min-height: 400px;
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
        .swiper-slide-active .hero-buttons { transition-delay: 720ms; }
      `}</style>
    </div>
  );
}
