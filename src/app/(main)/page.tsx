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

      <NoticeMagazineSection />

      <div className="bg-white">
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
