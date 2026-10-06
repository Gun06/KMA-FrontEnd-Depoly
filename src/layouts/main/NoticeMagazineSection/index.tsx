import Link from 'next/link';
import NoticeSection from '@/components/main/NoticeSection';
import {
  MAIN_EMBEDDED_SHELL_CLASS,
  MAIN_HOME_SECTION_TITLE_CLASS,
} from '@/components/main/mainLayoutTokens';

export default function NoticeMagazineSection() {
  return (
    <section className="bg-white" aria-labelledby="notice-title">
      <div className={MAIN_EMBEDDED_SHELL_CLASS}>
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16 md:h-20">
          <h2 id="notice-title" className={MAIN_HOME_SECTION_TITLE_CLASS}>
            공지사항
          </h2>
          <Link
            href="/notice/notice"
            className="shrink-0 text-xs font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 sm:text-sm"
          >
            더보기 &gt;
          </Link>
        </div>

        <NoticeSection variant="embedded" />
      </div>
    </section>
  );
}
