'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { UploadItem } from '@/components/common/Upload/types';
import ApiBannerSlide from '@/components/main/HeroCarousel/ApiBannerSlide';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export type MainBannerRow = {
  id: string | number; // UUID 또는 숫자 ID
  uuid?: string; // 원본 UUID 저장용
  visible: boolean;
  image: UploadItem | null;
  badge: string;
  title: string;
  subtitle: string;
  date: string;
  /** URL 입력 대신 eventId만 사용 */
  bannerType?: 'association' | 'event';
  eventId?: string;
};

function srcFromFile(f: UploadItem | null): string {
  if (!f) return '';
  const fileWithUrl = f as UploadItem & { previewUrl?: string; url?: string };
  if (typeof fileWithUrl?.previewUrl === 'string' && fileWithUrl.previewUrl) return fileWithUrl.previewUrl; // data:
  if (typeof fileWithUrl?.url === 'string' && /^https?:\/\//i.test(fileWithUrl.url)) return fileWithUrl.url; // 절대경로
  return '';
}

export default function MainBannersPreview({ rows }: { rows: MainBannerRow[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = React.useMemo(
    () =>
      rows
        .filter(r => r.visible && r.eventId && r.image) // visible이고 eventId와 image가 있는 것만
        .map(r => ({
          id: r.id,
          imageUrl: srcFromFile(r.image) || '',
          title: r.title || '',
          subtitle: r.subtitle || '',
          date: r.date || '',
          eventId: r.eventId || '',
        })),
    [rows]
  );
  const total = slides.length || 1;

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] rounded-lg border border-dashed text-gray-500">
        노출할 배너가 없습니다. &quot;공개&quot;로 전환하고 이미지를 등록해 주세요.
      </div>
    );
  }

  return (
    <div 
      className="relative w-full hero-section mt-2 sm:mt-4 md:mt-6 lg:mt-0 motion-safe:transition-all motion-safe:duration-300" 
      style={{ 
        height: 'var(--heroH, clamp(220px, 48vw, 680px))',
        minHeight: 'var(--heroH, clamp(220px, 48vw, 680px))'
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        }}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        speed={700}
        loop
        slidesPerView={1}
        centeredSlides={true}
        spaceBetween={0}
        breakpoints={{
          320: {
            slidesPerView: 1.25,
            spaceBetween: 10,
            centeredSlides: true,
          },
          640: {
            slidesPerView: 1.2,
            spaceBetween: 10,
            centeredSlides: true,
          },
          768: {
            slidesPerView: 1.2,
            spaceBetween: 10,
            centeredSlides: true,
          },
          1000: {
            slidesPerView: 1.1,
            spaceBetween: 8,
            centeredSlides: true,
          },
          1024: {
            slidesPerView: 1,
            spaceBetween: 0,
            centeredSlides: false,
          },
        }}
        className="h-full"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`preview-banner-${slide.id}-${index}`}>
            <ApiBannerSlide
              id={index}
              imageUrl={slide.imageUrl}
              title={slide.title}
              subtitle={slide.subtitle}
              date={slide.date}
              eventId={slide.eventId}
              total={total}
              currentIndex={activeIndex}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons - 데스크톱에서만 표시 */}
      <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 transition-colors cursor-pointer hidden lg:block">
        <svg
          className="w-12 md:w-16 h-12 md:h-16 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </div>

      <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 transition-colors cursor-pointer hidden lg:block">
        <svg
          className="w-12 md:w-16 h-12 md:h-16 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      {/* Custom Pagination Styles & Text Animations */}
      <style jsx global>{`
        /* Fluid responsive height like Programmers */
        .hero-section { --heroH: clamp(220px, 48vw, 680px); }
        @media (max-width: 1023px) { .hero-section { --heroH: clamp(200px, 44vw, 560px); } }
        /* Mobile: revert to preferred height ~28vh */
        @media (max-width: 639px)  { .hero-section { --heroH: 28vh; } }
        /* Text entrance animation per slide */
        .swiper-slide .hero-anim {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 800ms ease, transform 900ms ease;
          will-change: opacity, transform;
        }
        .gradient-text {
          background: linear-gradient(90deg, #00C4F4 0%, #00D886 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .swiper-slide-active .hero-anim {
          opacity: 1;
          transform: translateY(0);
        }
        /* Stagger */
        .swiper-slide-active .hero-badge { transition-delay: 180ms; }
        .swiper-slide-active .hero-title { transition-delay: 360ms; }
        .swiper-slide-active .hero-date { transition-delay: 540ms; }
        .swiper-slide-active .hero-buttons { transition-delay: 720ms; }

        /* Pagination 기본 스타일 */
        .swiper-pagination-bullet-custom {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          margin: 0 3px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active-custom {
          background: #256ef4;
          transform: scale(1.2);
        }
        
        .swiper-pagination {
          bottom: 20px !important;
        }

        /* 데스크탑 스타일 (768px 이상) */
        @media (min-width: 768px) {
          .swiper-pagination-bullet-custom {
            width: 12px;
            height: 12px;
            margin: 0 4px;
          }
          
          .swiper-pagination {
            bottom: 30px !important;
          }
        }

        /* 모바일 전용 스타일 (≤639px) - 옆 슬라이드 더 드러나게 */
        @media (max-width: 639px) {
          .swiper-slide {
            transition: transform 0.3s ease;
          }
          
          .swiper-slide:not(.swiper-slide-active) {
            transform: scale(0.9);
            opacity: 0.6;
          }
          
          .swiper-slide-active {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* 태블릿 전용 스타일 (640px–1023px) */
        @media (min-width: 640px) and (max-width: 1023px) {
          .swiper-slide {
            transition: transform 0.3s ease;
          }
          .swiper-slide:not(.swiper-slide-active) {
            transform: scale(0.94);
            opacity: 0.75;
          }
          .swiper-slide-active {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

