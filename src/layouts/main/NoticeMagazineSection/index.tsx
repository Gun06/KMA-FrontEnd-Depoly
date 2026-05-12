import React from 'react';
import NoticeSection from '@/components/main/NoticeSection';
// import InquirySection from '@/components/main/MagazineSection'; // 2열(공지+문의) 복귀 시 주석 해제

export default function NoticeMagazineSection() {
  return (
    <section className="bg-white pt-6 pb-6 md:pt-8 md:pb-8 lg:pt-10 lg:pb-6">
      <div className="mx-auto max-w-[1920px] px-3 sm:px-4 md:px-5 lg:px-[6vw]">
        {/*
        ─── 기존: 공지 + 문의 2열 ───
        <div className="grid grid-cols-1 md:gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
          <NoticeSection />
          <InquirySection />
        </div>
        */}

        {/* 공지사항 단일 컬럼 (가독·균형용 최대 너비) */}
        <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
          <NoticeSection />
        </div>
      </div>
    </section>
  );
}
