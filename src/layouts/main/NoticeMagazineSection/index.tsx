import Link from 'next/link';
import NoticeSection from '@/components/main/NoticeSection';

/** FAQ·CTA와 동일한 메인 가로 여백 */
const FRAME_X = 'px-3 sm:px-4 md:px-5 lg:px-[6vw]';

export default function NoticeMagazineSection() {
  return (
    <section className="bg-white" aria-labelledby="notice-title">
      <div className={`mx-auto w-full max-w-[1920px] ${FRAME_X}`}>
        <div className="flex h-16 items-center justify-between md:h-20">
          <h2
            id="notice-title"
            className="font-giants text-[22px] text-gray-900 md:text-[28px]"
          >
            공지사항
          </h2>
          <Link
            href="/notice/notice"
            className="text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
          >
            더보기 &gt;
          </Link>
        </div>

        <NoticeSection variant="embedded" />
      </div>
    </section>
  );
}
