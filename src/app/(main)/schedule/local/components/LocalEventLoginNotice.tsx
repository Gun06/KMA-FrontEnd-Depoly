import Link from 'next/link';

export default function LocalEventLoginNotice() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 mb-6 text-center">
      로그인이 필요합니다.{' '}
      <Link href="/login" className="font-medium underline hover:no-underline">
        로그인하기
      </Link>
    </div>
  );
}
