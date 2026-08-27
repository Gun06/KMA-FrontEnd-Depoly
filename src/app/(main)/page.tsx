import FaqSection from '@/components/main/FaqSection'
import ContactSection from '@/components/main/ContactSection'
import CtaCards from '@/components/main/CtaCardSection'
import GallerySection from '@/components/main/GallerySection'
import EventSection from '@/components/main/EventSection'
import NoticeMagazineSection from '@/layouts/main/NoticeMagazineSection'
import FeaturesSection from '@/components/main/FeaturesSection'
import MainHomeScrollLayout from '@/components/main/MainHomeScrollLayout'
import MainSponsorSection from '@/components/main/MainSponsorSection'
import MainSectionDivider from '@/components/main/MainSectionDivider'

export default function AssociationPage() {
  return (
    <MainHomeScrollLayout
      belowHero={<MainSponsorSection variant="embedded" />}
    >
      <MainSectionDivider />
      <EventSection variant="embedded" />

      <MainSectionDivider />
      <GallerySection variant="embedded" />

      <div className="bg-white pb-2 sm:pb-4 md:pb-6 lg:pb-8">
        <NoticeMagazineSection />
      </div>

      <div className="bg-white pt-6 sm:pt-8 md:pt-10 lg:pt-12">
        <CtaCards presets={['ios', 'android']} />
      </div>

      <FeaturesSection />

      <div className="mt-[10px]">
        <FaqSection allowMultipleOpen />
      </div>

      <div className="mt-[10px]">
        <ContactSection />
      </div>
    </MainHomeScrollLayout>
  )
}
