import { ClipboardList } from 'lucide-react';

export default function RecordsComingSoonPage() {
  return (
    <main className="mx-auto w-full max-w-[1920px] px-4 py-4">
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-[15px] font-semibold text-gray-900 font-pretendard">기록관리</h1>
      </div>

      <div className="flex flex-col items-center justify-center pt-20 pb-32 text-center">
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400"
          aria-hidden
        >
          <ClipboardList className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <p className="text-base text-gray-700 font-pretendard">서비스 준비중입니다</p>
        <p className="mt-2 text-sm text-gray-500 font-pretendard whitespace-pre-line">
          참가자 기록 관리 기능을 준비하고 있습니다.
        </p>
      </div>
    </main>
  );
}
