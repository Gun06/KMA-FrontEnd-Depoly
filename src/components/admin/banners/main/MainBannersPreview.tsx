'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import HeroButton from '@/components/common/Button/HeroButton';
import type { UploadItem } from '@/components/common/Upload/types';

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

const makeEventUrls = (id?: string) => {
  if (!id) return { apply: '', guide: '', confirm: '', main: '' };
  return {
    main:   `https://www.newrun1080.com/event/${id}`,
    apply:   `/event/${id}/registration/apply`,
    guide:   `/event/${id}/guide/overview`,
    confirm: `/event/${id}/registration/confirm`,
  };
};

export default function MainBannersPreview({ rows }: { rows: MainBannerRow[] }) {
  const slides = React.useMemo(
    () =>
      rows
        .filter(r => r.visible)
        .map(r => {
          const _src = srcFromFile(r.image);
          const urls = makeEventUrls(r.eventId);
          return { ...r, _src, _urls: urls };
        }),
    [rows]
  );
  const total = slides.length || 1;

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] rounded-lg border border-dashed text-gray-500">
        노출할 배너가 없습니다. “공개”로 전환하고 이미지를 등록해 주세요.
      </div>
    );
  }

  return (
    <div className="relative w-full hero-section mt-2 sm:mt-4 md:mt-6 lg:mt-0" style={{ height: 'var(--heroH)' }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        speed={700}
        loop
        slidesPerView={1}
        centeredSlides
        spaceBetween={0}
        breakpoints={{
          320:  { slidesPerView: 1, centeredSlides: true },
          1024: { slidesPerView: 1, centeredSlides: false },
        }}
        className="h-full"
      >
        {slides.map((s, idx) => (
          <SwiperSlide key={s.id}>
            {/* 🔗 큰 배너 클릭 시 이벤트 메인으로 이동 */}
            <a
              href={s._urls.main || '#'}
              onClick={(e) => {
                if (!s._urls.main) { e.preventDefault(); e.stopPropagation(); }
              }}
              className="relative block w-full hero-slide rounded-lg lg:rounded-none overflow-hidden"
              style={{ height: 'var(--heroH)' }}
            >
              {s._src ? (
                <Image
                  src={s._src}
                  alt={s.title || 'banner'}
                  fill
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  quality={70}
                  sizes="(max-width: 1023px) 100vw, 1200px"
                  className="object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <div className="text-4xl mb-2">🖼️</div>
                    <div className="text-sm">이미지를 등록해주세요</div>
                  </div>
                </div>
              )}
              
              {/* 협회소개 배너는 오버레이 없이 이미지만 표시 */}
              {s.bannerType !== 'association' && (
                <div className="absolute inset-0 bg-black/40" />
              )}

              {/* 협회소개 배너는 텍스트 오버레이 없음 */}
              {s.bannerType !== 'association' && (
                <div className="absolute inset-0 flex items-center justify-start">
                  <div className="text-left text-white max-w-4xl px-4 sm:px-8 md:px-10 min-[900px]:px-12 lg:px-48 flex flex-col">
                    <div className="inline-block w-fit bg-white/20 rounded-full text-[10px] sm:text-xs md:text-sm lg:text-base font-medium px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-0.5 md:py-1 mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                      {s.badge || '대회 안내'}
                    </div>

                    <h1 className="flex flex-col gap-1.5 sm:gap-2 md:gap-4 font-giants text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-6 leading-tight">
                      <div>{s.title || '대회명'}</div>
                      <div>{s.subtitle || ''}</div>
                    </h1>

                    <p className="text-xs sm:text-sm md:text-base lg:text-xl text-white/90 mb-2 sm:mb-3 md:mb-5 lg:mb-6">
                      {s.date || ''}
                    </p>

                    {/* 버튼들은 세부 경로로 이동 */}
                    <div className="hidden sm:flex sm:flex-row gap-2 md:gap-3 mt-2">
                      {s._urls.apply && (
                        <HeroButton
                          variant="main" tone="blue" size="sm"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(s._urls.apply, '_self'); }}
                        >
                          신청하기
                        </HeroButton>
                      )}
                      {s._urls.guide && (
                        <HeroButton
                          variant="main" tone="white" size="sm"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(s._urls.guide, '_self'); }}
                        >
                          대회 요강
                        </HeroButton>
                      )}
                      {s._urls.confirm && (
                        <HeroButton
                          variant="main" tone="white" size="sm"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(s._urls.confirm, '_self'); }}
                        >
                          신청 확인
                        </HeroButton>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute right-4 bottom-3 z-10">
                <div className="px-2.5 py-1 rounded-full bg-black/50 text-white text-xs md:text-sm backdrop-blur-sm border border-white/20">
                  {idx + 1}/{total}
                </div>
              </div>
            </a>
          </SwiperSlide>
        ))}

        <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 cursor-pointer hidden lg:block">
          <svg className="w-12 md:w-16 h-12 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 cursor-pointer hidden lg:block">
          <svg className="w-12 md:w-16 h-12 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Swiper>

      <style jsx global>{`
        .hero-section { --heroH: clamp(220px, 48vw, 680px); }
        @media (max-width: 1023px) { .hero-section { --heroH: clamp(200px, 44vw, 560px); } }
        @media (max-width: 639px)  { .hero-section { --heroH: 28vh; } }

        .swiper-pagination-bullet-custom {
          width: 8px; height: 8px; background: rgba(255,255,255,.5);
          border-radius: 50%; margin: 0 3px; transition: all .3s ease;
        }
        .swiper-pagination-bullet-active-custom { background:#256ef4; transform: scale(1.2); }
        .swiper-pagination { bottom: 20px !important; }
        @media (min-width:768px){
          .swiper-pagination-bullet-custom{ width:12px; height:12px; margin:0 4px; }
          .swiper-pagination{ bottom:30px !important; }
        }
      `}</style>
    </div>
  );
}
