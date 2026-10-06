'use client';

import React from 'react';
import Image from 'next/image';
import shoppingImage from '@/assets/images/main/shopping.png';
import { mainBodyTextClass, mainSectionTitleClass } from '@/lib/main/typography';

interface ShopPreviewProps {
  onVisitShop: () => void;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
      <span className="h-2 w-2 shrink-0 bg-slate-800" aria-hidden />
      <h2 className={mainSectionTitleClass}>{children}</h2>
    </div>
  );
}

export default function ShopPreview({ onVisitShop }: ShopPreviewProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
      <p className={`border-l-4 border-slate-800 bg-slate-50/90 py-3 pl-4 pr-2 text-slate-700 ${mainBodyTextClass}`}>
        전국마라톤협회 공식 온라인몰 「월드런 쇼핑몰」입니다. 아래 화면은 실제 쇼핑몰
        구성을 미리 보여 드리는 안내용이며, 구매 및 회원 서비스는 외부 쇼핑몰에서
        이용하실 수 있습니다.
      </p>

      <div className="relative mt-6 w-full overflow-hidden sm:mt-8">
        <Image
          src={shoppingImage}
          alt="월드런 쇼핑몰 화면 미리보기"
          className="pointer-events-none h-auto w-full select-none"
          priority
        />
        <div className="absolute inset-0 z-10 bg-black/50" aria-hidden />
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <p className="text-xl font-bold text-white sm:text-2xl">월드런 쇼핑몰 미리보기</p>
            <p className={`mt-2 text-gray-200 ${mainBodyTextClass}`}>
              실제 쇼핑은 아래 버튼을 통해 이동하세요
            </p>
            <button
              type="button"
              onClick={onVisitShop}
              className="mt-6 bg-orange-500 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 sm:py-4 sm:text-base"
            >
              쇼핑몰 방문하기 →
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-10">
        <SectionHeading>월드런 쇼핑몰 특징</SectionHeading>
        <ul className={`mt-4 space-y-2 border-b border-slate-200 pb-6 text-slate-700 ${mainBodyTextClass}`}>
          <li className="flex gap-2">
            <span className="shrink-0 font-semibold text-slate-500">·</span>
            <span>마라톤 러닝화 전문 브랜드</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-semibold text-slate-500">·</span>
            <span>스피드업, 슈플, 베플 등 다양한 제품</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-semibold text-slate-500">·</span>
            <span>러닝 의류 및 액세서리 판매</span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 font-semibold text-slate-500">·</span>
            <span>건강보조식품 및 크림</span>
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-slate-600 ${mainBodyTextClass}`}>
            외부 사이트(
            <span className="font-mono text-slate-800">worldrun1080.com</span>
            )로 이동합니다.
          </p>
          <button
            type="button"
            onClick={onVisitShop}
            className={`shrink-0 border border-slate-800 bg-white px-5 py-2.5 font-semibold text-slate-900 transition-colors hover:bg-slate-50 ${mainBodyTextClass}`}
          >
            쇼핑몰 바로가기
          </button>
        </div>
      </div>
    </div>
  );
}
