"use client"
import React from 'react'
import Image from 'next/image'
import sponsor01 from '@/assets/images/main/sponsor01.png'
import sponsor02 from '@/assets/images/main/sponsor02.png'
import sponsor03 from '@/assets/images/main/sponsor03.png'

export default function SponsorSection() {
  const sources = [sponsor01, sponsor02, sponsor03]
  const banners = Array.from({ length: 12 }, (_, i) => sources[i % sources.length])

  return (
    <section className="relative bg-white sponsor-section" style={{ height: 'var(--sectionH)' }}>
      {/* 타이틀: SectionPanel과 동일 래퍼/패딩으로 정렬 */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 h-full">
          <div className="h-full flex items-center pl-6 md:pl-20">
            <h2 className="font-giants text-[clamp(12px,2.8vw,22px)] md:text-[clamp(14px,2.2vw,26px)] text-gray-900">SPONSOR</h2>
          </div>
        </div>
      </div>
      {/* 움직이는 영역 배경 제거 (요청에 따라 빨간 배경 사용 안 함) */}

      {/* 이미지 트랙 (12개 반복, 중앙 정렬, 무한 이동) */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden z-10"
        style={{ height: 'var(--imgH)' }}
      >
        <div className="marquee flex w-max items-center h-full leading-[0]">
          <ul className="flex items-center gap-0 px-0 h-full">
            {banners.map((src, idx) => (
              <li key={`s-${idx}`} className="shrink-0 flex items-center justify-center h-full">
                <Image src={src} alt={`sponsor-${idx % sources.length}`} height={100} style={{ height: 'var(--imgH)' }} className="w-auto object-contain" />
              </li>
            ))}
          </ul>
          {/* 두 번째 트랙을 이어붙여 끊김 없는 루프 */}
          <ul className="flex items-center gap-0 px-0 h-full">
            {banners.map((src, idx) => (
              <li key={`s2-${idx}`} className="shrink-0 flex items-center justify-center h-full">
                <Image src={src} alt={`sponsor-${idx % sources.length}`} height={100} style={{ height: 'var(--imgH)' }} className="w-auto object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 양쪽 파란 테두리 + 흰색 배경 영역 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20" style={{ width: 'var(--leftW)' }}>
        <div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)'
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20" style={{ width: 'var(--rightW)' }}>
        <div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)'
          }}
        />
      </div>

      {/* 아래 구분선(회색 계열) */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-200 z-[60]" />

      <style jsx>{`
        .marquee { animation: marquee 45s linear infinite; will-change: transform; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        /* Desktop default (>=1280px) */
        .sponsor-section {
          --sectionH: 140px;  /* 기본 높이 증가 */
          --imgH: 80px;       /* 이미지 트랙 높이 증가 */
          --leftW: 320px;     /* 좌측 오버레이 폭 확장 */
          --rightW: 220px;    /* 우측 오버레이 폭 확장 */
        }
        /* 1024–1279px */
        @media (max-width: 1279px) and (min-width: 1024px) {
          .sponsor-section {
            --sectionH: 120px;
            --imgH: 70px;
            --leftW: 280px;   /* 좌측 오버레이 폭 확장 */
            --rightW: 200px;  /* 우측 오버레이 폭 확장 */
          }
        }
        /* 768–1023px (Tablet) */
        @media (max-width: 1023px) and (min-width: 768px) {
          .sponsor-section {
            --sectionH: 100px;
            --imgH: 60px;
            --leftW: 260px;   /* 좌측 오버레이 폭 확장 */
            --rightW: 180px;  /* 우측 오버레이 폭 확장 */
          }
        }
        /* 480–767px (Phones) */
        @media (max-width: 767px) and (min-width: 480px) {
          .sponsor-section {
            --sectionH: 80px;
            --imgH: 50px;
            --leftW: 200px;   /* 좌측 오버레이 폭 확장 */
            --rightW: 140px;  /* 우측 오버레이 폭 줄임 */
          }
        }
        /* <=479px (Small phones) */
        @media (max-width: 479px) {
          .sponsor-section {
            --sectionH: 70px;
            --imgH: 44px;
            --leftW: 160px;   /* 좌측 오버레이 폭 확장 */
            --rightW: 100px;  /* 우측 오버레이 폭 줄임 */
          }
        }
      `}</style>
    </section>
  )
}