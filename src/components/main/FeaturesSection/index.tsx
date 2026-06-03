'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image, { StaticImageData } from 'next/image';
import cartIcon from '@/assets/images/main/cart.png';
import photoIcon from '@/assets/images/main/photo.png';
import dateIcon from '@/assets/images/main/date.png';
import paperIcon from '@/assets/images/main/paper.png';

interface FeatureCard {
  id: string;
  icon: StaticImageData;
  title: string;
  description: string;
  link: string;
  linkColor: string;
  bgColor: string;
}

const features: FeatureCard[] = [
  {
    id: '1',
    icon: cartIcon,
    title: '쇼핑몰',
    description: '마라톤 관련 상품을 만나보세요.',
    link: '/shop/merchandise',
    linkColor: '#8F6F55',
    bgColor: '#F8F6F2',
  },
  {
    id: '2',
    icon: photoIcon,
    title: '대회사진 갤러리',
    description: '대회 현장의 생생한 감동을 느껴보세요.',
    link: '/schedule/gallery',
    linkColor: '#256EF4',
    bgColor: '#F6F8FA',
  },
  {
    id: '3',
    icon: dateIcon,
    title: '대회일정',
    description: '달력으로 마라톤 대회일정을 확인하시고 신청하세요.',
    link: '/schedule',
    linkColor: '#2093A4',
    bgColor: '#F7F7F7',
  },
  {
    id: '4',
    icon: paperIcon,
    title: '접수안내',
    description: '안내사항을 확인하세요.',
    link: '/registration/guide',
    linkColor: '#EA753C',
    bgColor: '#F4F2F3',
  },
];

export default function FeaturesSection() {
  const router = useRouter();

  const handlePlusButtonClick = (e: React.MouseEvent, link: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(link);
  };

  return (
    <section className="bg-white pb-6 pt-10 sm:py-8 md:py-10">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-5 lg:px-[6vw]">
        <div className="mb-6 pt-3 text-center sm:mb-8 sm:pt-2 md:mb-12 md:pt-0">
          <h2 className="font-giants mb-3 text-xl leading-snug text-gray-900 sm:mb-4 sm:text-2xl md:text-3xl lg:text-4xl">
            전국마라톤 협회에서 지원하는 더 많은 기능
          </h2>
          <div className="mx-auto h-1 w-24 bg-slate-200 sm:w-32 md:w-48 lg:w-60" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.link}
              className="relative block cursor-pointer rounded-xl p-4 transition-shadow duration-300 hover:shadow-md active:scale-[0.99] sm:rounded-lg sm:p-5 md:p-6"
              style={{ backgroundColor: feature.bgColor }}
            >
              {/* 모바일: 아이콘+텍스트 가로 / md+: 세로 */}
              <div className="flex gap-3 sm:gap-4 md:block">
                <div className="shrink-0 md:mb-4">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={48}
                    height={48}
                    className="h-10 w-10 sm:h-12 sm:w-12"
                  />
                </div>

                <div className="min-w-0 flex-1 pr-11 pt-2 sm:pt-1 md:pr-0 md:pt-0">
                  <h3 className="font-giants mb-1.5 text-lg leading-tight text-gray-900 sm:mb-2 sm:text-xl md:mb-3">
                    {feature.title}
                  </h3>
                  <p className="mb-2 text-[13px] leading-snug text-[#7A7A7A] sm:mb-3 sm:text-sm sm:leading-relaxed md:mb-4">
                    {feature.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium sm:gap-2 sm:text-sm"
                    style={{ color: feature.linkColor }}
                  >
                    바로가기
                    <span aria-hidden>↗</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handlePlusButtonClick(e, feature.link)}
                className="absolute bottom-3 right-3 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800 active:bg-gray-900 sm:bottom-4 sm:right-4 sm:h-8 sm:w-8"
                aria-label={`${feature.title} 바로가기`}
              >
                <span className="text-xl leading-none sm:text-lg">+</span>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
