import {
  PolicyCallout,
  PolicyIntro,
  PolicyPageLayout,
  PolicySection,
} from '@/components/main/PolicyPage'
import {
  EMAIL_POLICY_CLAUSES,
  EMAIL_POLICY_INTRO,
  EMAIL_POLICY_PENALTY,
  EMAIL_POLICY_TITLE,
} from '@/data/emailPolicy'

const emailToc = EMAIL_POLICY_CLAUSES.map((clause, index) => ({
  id: `email-clause-${index + 1}`,
  label: clause.label,
}))

export default function EmailPolicyPage() {
  return (
    <PolicyPageLayout
      activeTab="email"
      title="이메일 주소 무단 수집 거부"
      tocItems={emailToc}
    >
      <PolicyIntro>{EMAIL_POLICY_INTRO}</PolicyIntro>

      <PolicySection id="email-law" title={EMAIL_POLICY_TITLE}>
        <ol className="list-none space-y-8 pl-0">
          {EMAIL_POLICY_CLAUSES.map((clause, index) => (
            <li key={clause.label} id={`email-clause-${index + 1}`} className="scroll-mt-32">
              <span className="mb-2 block font-semibold text-gray-900">
                {index + 1}. {clause.label}
              </span>
              <span>{clause.content}</span>
            </li>
          ))}
        </ol>
      </PolicySection>

      <div id="email-penalty" className="scroll-mt-32">
        <PolicyCallout variant="warning">{EMAIL_POLICY_PENALTY}</PolicyCallout>
      </div>
    </PolicyPageLayout>
  )
}
