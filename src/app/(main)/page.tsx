import FaqSection from '@/components/main/FaqSection'
import ContactSection from '@/components/main/ContactSection'
import CtaCards from '@/components/main/CtaCardSection'
import GallerySection from '@/components/main/GallerySection'
import EventSection from '@/components/main/EventSection'
import NoticeMagazineSection from '@/layouts/main/NoticeMagazineSection'
import FeaturesSection from '@/components/main/FeaturesSection'
import MainHomeHero from '@/components/main/MainHomeHero'
import MainSponsorMarqueeStrip from '@/components/main/MainSponsorMarqueeStrip'

export default function AssociationPage() {
  return (
    <>
      <div>
        <MainHomeHero />

        <div className="border-t border-zinc-100 bg-white">
          <MainSponsorMarqueeStrip />
          <div className="mx-auto max-w-[1920px] px-4 pt-10 pb-0 md:px-6 lg:px-[6vw]">
            <div className="flex flex-col gap-10">
              <EventSection variant="embedded" />
              <GallerySection variant="embedded" />
            </div>
          </div>
        </div>

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
      </div>
    </>
  )
}
