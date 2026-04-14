import Link from 'next/link';

/** 마이페이지 카드형 알림 — dashed/amber 대신 border-gray-200 + 링크 강조 */
export default function LocalEventLoginNotice() {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-center text-sm text-gray-700 shadow-sm">
      로그인이 필요합니다.{' '}
      <Link
        href="/login"
        className="font-semibold text-blue-600 underline-offset-2 hover:text-blue-700 hover:underline"
      >
        로그인하기
      </Link>
    </div>
  );
}
