import {
  PolicyContactBox,
  PolicyIntro,
  PolicyPageLayout,
  PolicySection,
} from '@/components/main/PolicyPage'
import {
  PRIVACY_POLICY_CONTACT,
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_SECTIONS,
} from '@/data/privacyPolicy'

const privacyToc = [
  ...PRIVACY_POLICY_SECTIONS.map((section, index) => ({
    id: `privacy-${index + 1}`,
    label: section.tocLabel,
  })),
  {
    id: 'privacy-contact',
    label: PRIVACY_POLICY_CONTACT.tocLabel,
  },
]

export default function PrivacyPage() {
  return (
    <PolicyPageLayout
      activeTab="privacy"
      title="전국마라톤협회 개인정보취급방침"
      tocItems={privacyToc}
    >
      <PolicyIntro>{PRIVACY_POLICY_INTRO}</PolicyIntro>

      {PRIVACY_POLICY_SECTIONS.map((section, index) => (
        <PolicySection
          key={section.title}
          id={`privacy-${index + 1}`}
          title={section.title}
          content={section.content}
        />
      ))}

      <PolicyContactBox
        id="privacy-contact"
        title={PRIVACY_POLICY_CONTACT.title}
        content={PRIVACY_POLICY_CONTACT.description}
      />
    </PolicyPageLayout>
  )
}
