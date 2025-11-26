import React from 'react';
import NoticeSection from '@/components/main/NoticeSection';
import InquirySection from '@/components/main/MagazineSection';

export default function NoticeMagazineSection() {
  return (
    <section className="py-6 md:py-8 lg:py-12 bg-white">
      <div className="container mx-auto px-4">
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
