import { PolicyArticle, PolicyChapter, PolicyPageLayout } from '@/components/main/PolicyPage'
import { TERMS_OF_SERVICE_CHAPTERS } from '@/data/termsOfService'

const termsToc = TERMS_OF_SERVICE_CHAPTERS.map((chapter, index) => ({
  id: `terms-chapter-${index + 1}`,
  label: chapter.tocLabel,
}))

export default function TermsPage() {
  return (
    <PolicyPageLayout activeTab="terms" title="전국마라톤협회 이용약관" tocItems={termsToc}>
      {TERMS_OF_SERVICE_CHAPTERS.map((chapter, index) => (
        <PolicyChapter key={chapter.title} id={`terms-chapter-${index + 1}`} title={chapter.title}>
          {chapter.articles.map((article) => (
            <PolicyArticle key={article.title} title={article.title} content={article.content} />
          ))}
        </PolicyChapter>
      ))}
    </PolicyPageLayout>
  )
}
