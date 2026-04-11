import React from 'react';
import NoticeSection from '@/components/main/NoticeSection';
import InquirySection from '@/components/main/MagazineSection';

export default function NoticeMagazineSection() {
  return (
    <section className="bg-white pt-6 pb-6 md:pt-8 md:pb-8 lg:pt-10 lg:pb-6">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-5 lg:px-[6vw]">
        <div className="grid grid-cols-1 md:gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
          {/* 공지사항 섹션 */}
          <NoticeSection />
          
          {/* 문의사항 섹션 */}
          <InquirySection />
        </div>
      </div>
    </section>
  );
}
