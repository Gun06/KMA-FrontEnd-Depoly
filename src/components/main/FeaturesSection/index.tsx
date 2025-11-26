import React from 'react';
import Link from 'next/link';
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
  hasPlusButton?: boolean;
}

const features: FeatureCard[] = [
  {
    id: '1',
    icon: cartIcon,
    title: '쇼핑몰',
    description: '마라톤 관련 상품을 만나보세요.',
    link: '/shop/merchandise',
    linkColor: '#8F6F55',
    hasPlusButton: true
  },
  {
    id: '2',
    icon: photoIcon,
    title: '대회사진 갤러리',
    description: '대회 현장의 생생한 감동을 느껴보세요.',
    link: '/galleries',
    linkColor: '#256EF4',
    hasPlusButton: true
  },
  {
    id: '3',
    icon: dateIcon,
    title: '대회일정',
    description: '달력으로 마라톤 대회일정을 확인하시고 신청하세요.',
    link: '/schedule',
    linkColor: '#2093A4',
    hasPlusButton: true
  },
  {
    id: '4',
    icon: paperIcon,
    title: '접수안내',
    description: '안내사항을 확인하세요.',
    link: '/registration/guide',
    linkColor: '#EA753C',
    hasPlusButton: true
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* 메인 타이틀 */}
        <div className="text-center mb-12">
          <h2 className="font-giants text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-4">
            전국마라톤 협회 사이트에서 지원하는 더 많은 기능
          </h2>
          <div className="w-32 md:w-48 lg:w-60 h-1 bg-slate-200 mx-auto"></div>
        </div>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link 
              key={feature.id} 
              href={feature.link}
              className="block rounded-lg p-6 relative hover:shadow-md transition-shadow duration-300 cursor-pointer"
              style={{ 
                backgroundColor: index === 0 ? '#F8F6F2' : 
                              index === 1 ? '#F6F8FA' : 
                              index === 2 ? '#F7F7F7' : '#F4F2F3'
              }}
            >
              {/* 아이콘 */}
              <div className="mb-4">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </div>

              {/* 제목 */}
              <h3 className="font-giants text-xl text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* 설명 */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#7A7A7A' }}>
                {feature.description}
              </p>

              {/* 바로가기 링크 */}
              <div>
                <span 
                  className="inline-flex items-center gap-2 font-medium hover:opacity-80 transition-opacity text-sm"
                  style={{ color: feature.linkColor }}
                >
                  바로가기
                  <span className="text-sm">↗</span>
                </span>
              </div>

              {/* 플러스 버튼 */}
              {feature.hasPlusButton && (
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors duration-200">
                  <span className="text-lg">+</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}