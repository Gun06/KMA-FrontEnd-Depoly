import FaqSection from '@/components/main/FaqSection'
import ContactSection from '@/components/main/ContactSection'
import MarathonHeroCarousel from '@/components/main/HeroCarousel/HeroCarousel'
import CtaCards from '@/components/main/CtaCardSection'
import SponsorSection from '@/components/main/SponsorSection'
import GallerySection from '@/components/main/GallerySection'
import EventSection from '@/components/main/EventSection'
import NoticeMagazineSection from '@/layouts/main/NoticeMagazineSection'
import FeaturesSection from '@/components/main/FeaturesSection'

export default function AssociationPage() {
  return (
    <>
    <MarathonHeroCarousel />
      {/* SPONSOR 섹션 */}
      <SponsorSection />

      {/* 주요대회일정 섹션*/}
      <div className="mt-[20px]" />
      <EventSection />

      {/* 갤러리 섹션 */}
      <div className="mt-[0px] h-[20px] md:h-[40px] bg-gray-50" />
      <GallerySection />

      {/* 공지사항 및 매거진 섹션 */}
      <NoticeMagazineSection />

      {/* CTA 섹션*/}
      <CtaCards />

      {/* 기능 소개 섹션 */}
      <div className="h-[30px] md:h-[60px]" />
      <FeaturesSection />

      {/* FAQ 섹션 */}
      <div className="mt-[10px]">
        <FaqSection allowMultipleOpen />
      </div>

      {/* Contact Us 섹션 */}
      <div className="mt-[10px]">
        <ContactSection />
      </div>
    </>
  )
}